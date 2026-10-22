import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';

import { config } from './src/config.js';
import { ChatService } from './src/chat-service.js';
import { createRequestHandler } from './src/http.js';

export const PORT = config.port;

const PUBLIC_DIR = config.publicDir;
const INDEX_FILE = path.join(PUBLIC_DIR, 'index.html');

export const chatService = new ChatService({
  maxMessageLength: config.maxMessageLength,
  useConnectionIdentity: config.useConnectionIdentity,
});

export const server = http.createServer(
  createRequestHandler({ publicDir: PUBLIC_DIR, indexFile: INDEX_FILE }),
);

export const wss = new WebSocketServer({
  server,
  maxPayload: config.maxPayloadBytes,
});

const sendToClient = (client, payload) => {
  try {
    client.send(payload);
  } catch (error) {
    console.error(`[chat] could not send message: ${error.message}`);
  }
};

const broadcast = (message) => {
  const payload = JSON.stringify(message);

  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) {
      continue;
    }

    sendToClient(client, payload);
  }
};

wss.on('connection', (socket, req) => {
  const rawUsername = new URL(req.url, 'http://localhost').searchParams.get(
    'username',
  );
  const identity = chatService.createIdentity(rawUsername);

  socket.isAlive = true;
  socket.on('pong', () => {
    socket.isAlive = true;
  });

  broadcast(chatService.createSystemMessage(`${identity.username} joined`));

  socket.on('message', (rawMessage) => {
    const parsed = chatService.parseIncomingMessage(rawMessage);

    if (!parsed) {
      sendToClient(
        socket,
        JSON.stringify(chatService.createErrorMessage('Invalid message format')),
      );
      return;
    }

    if (!identity.isExplicit && parsed.username) {
      identity.username = parsed.username;
    }

    const author = chatService.resolveAuthor(identity, parsed.username);

    broadcast(chatService.createChatMessage(author, parsed.text));
  });

  socket.on('close', () => {
    broadcast(chatService.createSystemMessage(`${identity.username} left`));
  });

  socket.on('error', (error) => {
    console.error(
      `[chat] socket error for ${identity.username}: ${error.message}`,
    );
  });
});

wss.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    return;
  }

  console.error(`[chat] websocket server error: ${error.message}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `[chat] port ${PORT} is already in use. Stop the process using it and try again.`,
    );
    process.exit(1);
  }

  console.error(`[chat] http server error: ${error.message}`);
});

const heartbeat = setInterval(() => {
  for (const client of wss.clients) {
    if (client.isAlive === false) {
      client.terminate();
      continue;
    }

    client.isAlive = false;
    client.ping();
  }
}, config.heartbeatIntervalMs);

heartbeat.unref();

const shutdown = (signal) => {
  console.log(`\n[chat] ${signal} received, shutting down...`);
  clearInterval(heartbeat);

  wss.close(() => {
    server.close(() => process.exit(0));
  });

  setTimeout(() => process.exit(0), 5000).unref();
};

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(signal));
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename;

if (isDirectRun) {
  server.listen(PORT, () => {
    console.log(`Chat server running at http://localhost:${PORT}`);
  });
}
