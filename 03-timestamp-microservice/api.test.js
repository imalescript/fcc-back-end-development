import request from 'supertest';
import { app } from './server.js';

describe('Timestamp Microservice API Tests', () => {
  describe('GET /api/:date', () => {
    test('should return the unix timestamp and utc date of a valid date', async () => {
      const response = await request(app).get('/api/2015-12-25');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        unix: 1451001600000,
        utc: 'Fri, 25 Dec 2015 00:00:00 GMT',
      });
    });

    test('should return the unix timestamp and utc date of a unix timestamp', async () => {
      const response = await request(app).get('/api/1451001600000');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        unix: 1451001600000,
        utc: 'Fri, 25 Dec 2015 00:00:00 GMT',
      });
    });

    test('should handle the unix epoch', async () => {
      const response = await request(app).get('/api/0');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        unix: 0,
        utc: 'Thu, 01 Jan 1970 00:00:00 GMT',
      });
    });

    test('should handle a negative unix timestamp', async () => {
      const response = await request(app).get('/api/-1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        unix: -1,
        utc: 'Wed, 31 Dec 1969 23:59:59 GMT',
      });
    });

    test('should return an error object for an invalid date', async () => {
      const response = await request(app).get('/api/invalid');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ error: 'Invalid Date' });
    });

    test('should return the current time for an empty date parameter', async () => {
      const before = Date.now();
      const response = await request(app).get('/api/');
      const after = Date.now();

      expect(response.status).toBe(200);
      expect(typeof response.body.unix).toBe('number');
      expect(response.body.unix).toBeGreaterThanOrEqual(before);
      expect(response.body.unix).toBeLessThanOrEqual(after);
      expect(typeof response.body.utc).toBe('string');
      expect(response.body.utc).toMatch(
        /^\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/
      );
    });

    test('should return the current time without a trailing slash', async () => {
      const before = Date.now();
      const response = await request(app).get('/api');
      const after = Date.now();

      expect(response.status).toBe(200);
      expect(response.body.unix).toBeGreaterThanOrEqual(before);
      expect(response.body.unix).toBeLessThanOrEqual(after);
      expect(typeof response.body.utc).toBe('string');
    });

    test('should respond with cors headers', async () => {
      const response = await request(app).get('/api/1451001600000');

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    test('should ignore the query string', async () => {
      const response = await request(app).get('/api/1451001600000?foo=bar');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        unix: 1451001600000,
        utc: 'Fri, 25 Dec 2015 00:00:00 GMT',
      });
    });
  });

  describe('GET /', () => {
    test('should serve the index page', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.text).toContain('Timestamp Microservice');
    });
  });

  describe('GET /styles.css', () => {
    test('should serve the static stylesheet', async () => {
      const response = await request(app).get('/styles.css');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/css/);
    });
  });

  describe('unknown routes', () => {
    test('should return 404', async () => {
      const response = await request(app).get('/does-not-exist');

      expect(response.status).toBe(404);
    });
  });
});
