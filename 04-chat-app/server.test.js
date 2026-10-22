import { jest } from '@jest/globals';
import request from 'supertest';
import { WebSocket } from 'ws';

process.env.HEARTBEAT_INTERVAL_MS = '1000';
process.env.MAX_MESSAGE_LENGTH = '1000';

const { server, wss } = await import('./server.js');

const clients = new Set();

let port;

beforeAll(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  port = server.address().port;
});

afterAll(async () => {
  delete process.env.HEARTBEAT_INTERVAL_MS;
  delete process.env.MAX_MESSAGE_LENGTH;

  for (const client of clients) {
    client.terminate();
  }

  await new Promise((resolve) => wss.close(resolve));
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

afterEach(() => {
  for (const client of clients) {
    client.terminate();
  }

  clients.clear();
});

const connectClient = (username) =>
  new Promise((resolve, reject) => {
    const query = username
      ? `?username=${encodeURIComponent(username)}`
      : '';
    const socket = new WebSocket(`ws://localhost:${port}${query}`);

    socket.messages = [];
    socket.on('message', (data) =>
      socket.messages.push(JSON.parse(data.toString())),
    );
    socket.on('open', () => resolve(socket));
    socket.on('error', reject);

    clients.add(socket);
    socket.on('close', () => clients.delete(socket));
  });

const waitFor = async (socket, predicate, timeout = 3000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    const message = socket.messages.find(predicate);

    if (message) {
      return message;
    }

    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  return null;
};

describe('HTTP server', () => {
  test('should serve the index page', async () => {
    const response = await request(server).get('/');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/html');
    expect(response.text).toContain('<!DOCTYPE html>');
    expect(response.text).toContain('id="messages"');
  });

  test('should serve the index page on /index.html', async () => {
    const response = await request(server).get('/index.html');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/html');
  });

  test('should serve the stylesheet', async () => {
    const response = await request(server).get('/styles.css');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/css');
    expect(response.text).toContain(':root');
  });

  test('should serve the client script', async () => {
    const response = await request(server).get('/script.js');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/javascript');
    expect(response.text).toContain('new WebSocket');
  });

  test('should send the security and cache headers', async () => {
    const response = await request(server).get('/');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['cache-control']).toBe('no-cache');
  });

  test('should answer a HEAD request without a body', async () => {
    const response = await request(server).head('/');

    expect(response.status).toBe(200);
    expect(response.text).toBeUndefined();
  });

  test('should return 404 for an unknown route', async () => {
    const response = await request(server).get('/does-not-exist');

    expect(response.status).toBe(404);
  });

  test('should block path traversal attempts', async () => {
    const response = await request(server).get('/../server.js');

    expect(response.status).toBe(404);
  });

  test('should block encoded path traversal attempts', async () => {
    const response = await request(server).get('/..%2fserver.js');

    expect(response.status).toBe(404);
  });

  test('should block malformed url encoding', async () => {
    const response = await request(server).get('/%E0%A4%A');

    expect(response.status).toBe(404);
  });

  test('should return 405 for a method that is not allowed', async () => {
    const response = await request(server).post('/');

    expect(response.status).toBe(405);
    expect(response.headers.allow).toBe('GET, HEAD');
  });
});

describe('WebSocket server', () => {
  test('should accept a connection', async () => {
    const client = await connectClient('Camper');

    expect(client.readyState).toBe(WebSocket.OPEN);
  });
  test('should announce the connection to the existing clients', async () => {
    const first = await connectClient('Alice');
    const second = await connectClient('Bob');

    const announcement = await waitFor(
      first,
      (message) => message.type === 'system' && message.text.includes('Bob'),
    );

    expect(announcement).toEqual({ type: 'system', text: 'Bob joined' });
    expect(second.messages[0]).toEqual({
      type: 'system',
      text: 'Bob joined',
    });
  });

  test('should broadcast a chat message to every client', async () => {
    const alice = await connectClient('Alice');
    const bob = await connectClient('Bob');

    await waitFor(alice, (message) => message.type === 'system');
    await waitFor(bob, (message) => message.type === 'system');

    alice.send(JSON.stringify({ username: 'Alice', text: 'Hello there' }));

    const expected = { type: 'chat', username: 'Alice', text: 'Hello there' };

    expect(await waitFor(alice, (message) => message.type === 'chat')).toEqual(
      expected,
    );
    expect(await waitFor(bob, (message) => message.type === 'chat')).toEqual(
      expected,
    );
  });

  test('should announce the disconnection to the remaining clients', async () => {
    const alice = await connectClient('Alice');
    const bob = await connectClient('Bob');

    await waitFor(bob, (message) => message.type === 'system');

    alice.close();

    const announcement = await waitFor(
      bob,
      (message) => message.type === 'system' && message.text.includes('left'),
    );

    expect(announcement).toEqual({ type: 'system', text: 'Alice left' });
  });

  test('should use the default username when none is given', async () => {
    const client = await connectClient();

    await waitFor(client, (message) => message.type === 'system');

    expect(client.messages[0]).toEqual({
      type: 'system',
      text: 'Anonymous joined',
    });
  });

  test('should survive a malformed message and keep the connection', async () => {
    const alice = await connectClient('Alice');
    const bob = await connectClient('Bob');

    await waitFor(bob, (message) => message.type === 'system');

    alice.send('this is not json');

    const error = await waitFor(alice, (message) => message.type === 'error');

    expect(error).toEqual({ type: 'error', text: 'Invalid message format' });
    expect(
      bob.messages.find((message) => message.type === 'error'),
    ).toBeUndefined();

    alice.send(JSON.stringify({ username: 'Alice', text: 'Still alive' }));

    expect(
      await waitFor(bob, (message) => message.type === 'chat'),
    ).toEqual({ type: 'chat', username: 'Alice', text: 'Still alive' });
  });

  test('should not allow a client to post as another user', async () => {
    const victim = await connectClient('Victim');
    const watcher = await connectClient('Watcher');

    await waitFor(watcher, (message) => message.type === 'system');

    victim.send(JSON.stringify({ username: 'Hacker', text: 'Spoofed' }));

    expect(await waitFor(watcher, (message) => message.type === 'chat')).toEqual(
      { type: 'chat', username: 'Victim', text: 'Spoofed' },
    );
  });

  test('should reject a message longer than the maximum length', async () => {
    const alice = await connectClient('Alice');
    const bob = await connectClient('Bob');

    await waitFor(bob, (message) => message.type === 'system');

    alice.send(JSON.stringify({ username: 'Alice', text: 'x'.repeat(1001) }));

    expect(await waitFor(alice, (message) => message.type === 'error')).toEqual({
      type: 'error',
      text: 'Invalid message format',
    });
    expect(
      bob.messages.find(
        (message) => message.type === 'chat' && message.text.length === 1001,
      ),
    ).toBeUndefined();
  });
});

describe('error handling', () => {
  test('should log an unexpected http server error', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    server.emit('error', new Error('boom'));

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('http server error'),
    );

    error.mockRestore();
  });

  test('should log an unexpected websocket server error', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    wss.emit('error', new Error('boom'));

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('websocket server error'),
    );

    error.mockRestore();
  });
});

describe('heartbeat', () => {
  const findServerSocket = () =>
    [...wss.clients].find((client) => client.readyState === WebSocket.OPEN);

  test('should ping the connected clients', async () => {
    const client = await connectClient('Camper');
    const serverSocket = findServerSocket();

    expect(serverSocket).toBeDefined();

    const pong = new Promise((resolve) => serverSocket.once('pong', resolve));

    await pong;

    expect(serverSocket.isAlive).toBe(true);
  });

  test('should terminate a client that does not answer', async () => {
    const client = await connectClient('Camper');
    const serverSocket = findServerSocket();

    const closed = new Promise((resolve) => client.once('close', resolve));

    serverSocket.isAlive = false;

    await closed;

    expect(client.readyState).toBe(WebSocket.CLOSED);
  });
});
