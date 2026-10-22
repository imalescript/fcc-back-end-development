import fs from 'fs/promises';
import path from 'path';

const MIME_TYPES = new Map([
  ['.html', 'text/html'],
  ['.js', 'application/javascript'],
  ['.css', 'text/css'],
  ['.json', 'application/json'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain'],
]);

const sendText = (res, statusCode, body, headers = {}) => {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
};

const sendFile = async (res, filePath) => {
  try {
    const data = await fs.readFile(filePath);

    res.writeHead(200, {
      'Content-Type':
        MIME_TYPES.get(path.extname(filePath).toLowerCase()) ??
        'application/octet-stream',
      'Content-Length': data.length,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  } catch (error) {
    console.error(`[chat] could not read ${filePath}: ${error.message}`);
    sendText(res, 500, 'Internal Server Error');
  }
};

export const resolveStaticFile = (publicDir, pathname) => {
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const filePath = path.resolve(publicDir, decodedPath.replace(/^\/+/, ''));

  if (!filePath.startsWith(publicDir + path.sep)) {
    return null;
  }

  return filePath;
};

export const createRequestHandler =
  ({ publicDir, indexFile }) =>
  async (req, res) => {
    try {
      const { pathname } = new URL(
        req.url,
        `http://${req.headers.host ?? 'localhost'}`,
      );

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return sendText(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
      }

      const filePath =
        pathname === '/' ? indexFile : resolveStaticFile(publicDir, pathname);

      if (!filePath) {
        return sendText(res, 404, 'Not Found');
      }

      const stats = await fs.stat(filePath).catch(() => null);

      if (!stats || !stats.isFile()) {
        return sendText(res, 404, 'Not Found');
      }

      return await sendFile(res, filePath);
    } catch (error) {
      console.error(`[chat] request failed: ${error.message}`);
      return sendText(res, 500, 'Internal Server Error');
    }
  };
