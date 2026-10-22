import { jest } from '@jest/globals';
import { ChatService } from './chat-service.js';

describe('ChatService', () => {
  let chatService;

  beforeEach(() => {
    chatService = new ChatService();
  });

  describe('constructor', () => {
    test('should use the default values', () => {
      expect(chatService.maxMessageLength).toBe(1000);
      expect(chatService.defaultUsername).toBe('Anonymous');
      expect(chatService.useConnectionIdentity).toBe(true);
    });

    test('should accept custom values', () => {
      const custom = new ChatService({
        maxMessageLength: 10,
        defaultUsername: 'Guest',
        useConnectionIdentity: false,
      });

      expect(custom.maxMessageLength).toBe(10);
      expect(custom.defaultUsername).toBe('Guest');
      expect(custom.useConnectionIdentity).toBe(false);
    });
  });

  describe('sanitizeUsername', () => {
    test('should return a trimmed username', () => {
      expect(chatService.sanitizeUsername('  Camper  ')).toBe('Camper');
    });

    test('should remove control characters', () => {
      expect(chatService.sanitizeUsername('Cam\u0000per\u001f')).toBe('Camper');
    });

    test('should fall back to the default username when empty', () => {
      expect(chatService.sanitizeUsername('')).toBe('Anonymous');
      expect(chatService.sanitizeUsername('   ')).toBe('Anonymous');
    });

    test('should fall back to the default username for non strings', () => {
      expect(chatService.sanitizeUsername(null)).toBe('Anonymous');
      expect(chatService.sanitizeUsername(undefined)).toBe('Anonymous');
      expect(chatService.sanitizeUsername({})).toBe('Anonymous');
      expect(chatService.sanitizeUsername([])).toBe('Anonymous');
      expect(chatService.sanitizeUsername(Number.NaN)).toBe('Anonymous');
      expect(chatService.sanitizeUsername(Number.POSITIVE_INFINITY)).toBe(
        'Anonymous',
      );
    });

    test('should convert finite numbers to strings', () => {
      expect(chatService.sanitizeUsername(42)).toBe('42');
    });

    test('should not truncate a long username', () => {
      const username = 'a'.repeat(120);

      expect(chatService.sanitizeUsername(username)).toBe(username);
    });

    test('should use the configured default username', () => {
      const custom = new ChatService({ defaultUsername: 'Guest' });

      expect(custom.sanitizeUsername('')).toBe('Guest');
    });
  });

  describe('parseIncomingMessage', () => {
    test('should parse a valid payload', () => {
      const result = chatService.parseIncomingMessage(
        JSON.stringify({ username: 'Camper', text: 'Hello' }),
      );

      expect(result).toEqual({ username: 'Camper', text: 'Hello' });
    });

    test('should parse a payload without username', () => {
      const result = chatService.parseIncomingMessage(
        JSON.stringify({ text: 'Hello' }),
      );

      expect(result).toEqual({ username: null, text: 'Hello' });
    });

    test('should return null for malformed json', () => {
      expect(chatService.parseIncomingMessage('this is not json')).toBeNull();
      expect(chatService.parseIncomingMessage('')).toBeNull();
      expect(chatService.parseIncomingMessage('{')).toBeNull();
    });

    test('should return null when the payload is not an object', () => {
      expect(chatService.parseIncomingMessage('null')).toBeNull();
      expect(chatService.parseIncomingMessage('"text"')).toBeNull();
      expect(chatService.parseIncomingMessage('42')).toBeNull();
      expect(chatService.parseIncomingMessage('[]')).toBeNull();
      expect(
        chatService.parseIncomingMessage(JSON.stringify(['a', 'b'])),
      ).toBeNull();
    });

    test('should return null when the text is missing or not a string', () => {
      expect(
        chatService.parseIncomingMessage(JSON.stringify({ username: 'Camper' })),
      ).toBeNull();
      expect(
        chatService.parseIncomingMessage(JSON.stringify({ text: 42 })),
      ).toBeNull();
      expect(
        chatService.parseIncomingMessage(JSON.stringify({ text: null })),
      ).toBeNull();
    });

    test('should return null when the text is too long', () => {
      const long = 'x'.repeat(1001);

      expect(
        chatService.parseIncomingMessage(JSON.stringify({ text: long })),
      ).toBeNull();
    });

    test('should accept a text with the exact maximum length', () => {
      const max = 'x'.repeat(1000);

      expect(
        chatService.parseIncomingMessage(JSON.stringify({ text: max })),
      ).toEqual({ username: null, text: max });
    });

    test('should sanitize the username of the payload', () => {
      const result = chatService.parseIncomingMessage(
        JSON.stringify({ username: '  Cam\u0000per ', text: 'Hello' }),
      );

      expect(result.username).toBe('Camper');
    });

    test('should keep the text untouched', () => {
      const text = '  Hello   world \n ';

      expect(
        chatService.parseIncomingMessage(JSON.stringify({ text })).text,
      ).toBe(text);
    });

    test('should use the configured maximum length', () => {
      const custom = new ChatService({ maxMessageLength: 10 });

      expect(
        custom.parseIncomingMessage(JSON.stringify({ text: 'x'.repeat(11) })),
      ).toBeNull();
      expect(
        custom.parseIncomingMessage(JSON.stringify({ text: 'x'.repeat(10) })),
      ).not.toBeNull();
    });
  });

  describe('createIdentity', () => {
    test('should create an explicit identity', () => {
      expect(chatService.createIdentity('Camper')).toEqual({
        username: 'Camper',
        isExplicit: true,
      });
    });

    test('should create a non explicit identity without a username', () => {
      expect(chatService.createIdentity(null)).toEqual({
        username: 'Anonymous',
        isExplicit: false,
      });
    });

    test('should create a non explicit identity for a blank username', () => {
      expect(chatService.createIdentity('   ')).toEqual({
        username: 'Anonymous',
        isExplicit: false,
      });
    });
  });

  describe('resolveAuthor', () => {
    test('should use the connection username when the identity is explicit', () => {
      const identity = { username: 'Camper', isExplicit: true };

      expect(chatService.resolveAuthor(identity, 'Hacker')).toBe('Camper');
    });

    test('should use the payload username when the identity is not explicit', () => {
      const identity = { username: 'Anonymous', isExplicit: false };

      expect(chatService.resolveAuthor(identity, 'Camper')).toBe('Camper');
    });

    test('should fall back to the connection username without a payload username', () => {
      const identity = { username: 'Anonymous', isExplicit: false };

      expect(chatService.resolveAuthor(identity, null)).toBe('Anonymous');
    });

    test('should use the payload username when the identity is not enforced', () => {
      const custom = new ChatService({ useConnectionIdentity: false });
      const identity = { username: 'Camper', isExplicit: true };

      expect(custom.resolveAuthor(identity, 'Hacker')).toBe('Hacker');
    });
  });

  describe('message factories', () => {
    test('should create a system message', () => {
      expect(chatService.createSystemMessage('Camper joined')).toEqual({
        type: 'system',
        text: 'Camper joined',
      });
    });

    test('should create a chat message', () => {
      expect(
        chatService.createChatMessage('Camper', 'Hello'),
      ).toEqual({
        type: 'chat',
        username: 'Camper',
        text: 'Hello',
      });
    });

    test('should create an error message', () => {
      expect(chatService.createErrorMessage('Invalid message format')).toEqual(
        {
          type: 'error',
          text: 'Invalid message format',
        },
      );
    });
  });
});
