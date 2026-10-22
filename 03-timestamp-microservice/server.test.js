import { jest } from '@jest/globals';
import { TimestampService } from './server.js';

describe('TimestampService Tests', () => {
  let timestampService;

  beforeEach(() => {
    timestampService = new TimestampService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getTimestamp', () => {
    test('should return the unix timestamp and utc date of a valid date string', () => {
      const result = timestampService.getTimestamp('2015-12-25');

      expect(result).toEqual({
        unix: 1451001600000,
        utc: 'Fri, 25 Dec 2015 00:00:00 GMT',
      });
    });

    test('should return the unix timestamp and utc date of a unix timestamp string', () => {
      const result = timestampService.getTimestamp('1451001600000');

      expect(result).toEqual({
        unix: 1451001600000,
        utc: 'Fri, 25 Dec 2015 00:00:00 GMT',
      });
    });

    test('should handle the unix epoch', () => {
      const result = timestampService.getTimestamp('0');

      expect(result).toEqual({
        unix: 0,
        utc: 'Thu, 01 Jan 1970 00:00:00 GMT',
      });
    });

    test('should handle a negative unix timestamp', () => {
      const result = timestampService.getTimestamp('-1');

      expect(result).toEqual({
        unix: -1,
        utc: 'Wed, 31 Dec 1969 23:59:59 GMT',
      });
    });

    test('should return an error object for an invalid date', () => {
      const result = timestampService.getTimestamp('invalid');

      expect(result).toEqual({ error: 'Invalid Date' });
    });

    test('should return an error object when no extra keys are present', () => {
      const result = timestampService.getTimestamp('not-a-date');

      expect(Object.keys(result)).toEqual(['error']);
    });

    test('should return the current time for an empty date parameter', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2015-12-25T00:00:00Z'));

      const result = timestampService.getTimestamp('');

      expect(result).toEqual({
        unix: 1451001600000,
        utc: 'Fri, 25 Dec 2015 00:00:00 GMT',
      });
    });

    test('should return the current time for an undefined date parameter', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2015-12-25T00:00:00Z'));

      const result = timestampService.getTimestamp(undefined);

      expect(result).toEqual({
        unix: 1451001600000,
        utc: 'Fri, 25 Dec 2015 00:00:00 GMT',
      });
    });

    test('should return a unix number and a utc string', () => {
      const result = timestampService.getTimestamp('2015-12-25');

      expect(typeof result.unix).toBe('number');
      expect(typeof result.utc).toBe('string');
      expect(result.utc).toMatch(
        /^\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/
      );
    });
  });

  describe('getCurrentTimestamp', () => {
    test('should return the current unix timestamp and utc date', () => {
      const before = Date.now();
      const result = timestampService.getCurrentTimestamp();
      const after = Date.now();

      expect(result.unix).toBeGreaterThanOrEqual(before);
      expect(result.unix).toBeLessThanOrEqual(after);
      expect(typeof result.utc).toBe('string');
      expect(result.utc).toMatch(
        /^\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/
      );
    });

    test('should return a deterministic value with a mocked system time', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2015-12-25T00:00:00Z'));

      const result = timestampService.getCurrentTimestamp();

      expect(result).toEqual({
        unix: 1451001600000,
        utc: 'Fri, 25 Dec 2015 00:00:00 GMT',
      });
    });
  });

  describe('isUnixTimestamp', () => {
    test('should detect unix timestamps', () => {
      expect(timestampService.isUnixTimestamp('1451001600000')).toBe(true);
      expect(timestampService.isUnixTimestamp('0')).toBe(true);
      expect(timestampService.isUnixTimestamp('-1')).toBe(true);
    });

    test('should reject anything that is not a unix timestamp', () => {
      expect(timestampService.isUnixTimestamp('2015-12-25')).toBe(false);
      expect(timestampService.isUnixTimestamp('invalid')).toBe(false);
      expect(timestampService.isUnixTimestamp('')).toBe(false);
      expect(timestampService.isUnixTimestamp('12.5')).toBe(false);
    });
  });

  describe('toDate', () => {
    test('should parse a unix timestamp string as milliseconds', () => {
      const date = timestampService.toDate('1451001600000');

      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(1451001600000);
    });

    test('should parse a date string', () => {
      const date = timestampService.toDate('2015-12-25');

      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(1451001600000);
    });

    test('should return an invalid date for an unparsable string', () => {
      const date = timestampService.toDate('invalid');

      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(true);
    });
  });
});
