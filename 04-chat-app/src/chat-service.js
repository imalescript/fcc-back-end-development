export class ChatService {
  constructor({
    maxMessageLength = 1000,
    defaultUsername = 'Anonymous',
    useConnectionIdentity = true,
  } = {}) {
    this.maxMessageLength = maxMessageLength;
    this.defaultUsername = defaultUsername;
    this.useConnectionIdentity = useConnectionIdentity;
  }

  createIdentity(rawUsername) {
    const isExplicit =
      typeof rawUsername === 'string' && rawUsername.trim().length > 0;

    return { username: this.sanitizeUsername(rawUsername), isExplicit };
  }

  resolveAuthor(identity, payloadUsername) {
    if (this.useConnectionIdentity && identity.isExplicit) {
      return identity.username;
    }

    return payloadUsername ?? identity.username;
  }

  sanitizeUsername(rawUsername) {
    if (typeof rawUsername === 'number' && Number.isFinite(rawUsername)) {
      return String(rawUsername);
    }
    if (typeof rawUsername !== 'string') {
      return this.defaultUsername;
    }

    const cleaned = rawUsername.replace(/[\u0000-\u001f\u007f]/g, '').trim();
    return cleaned.length > 0 ? cleaned : this.defaultUsername;
  }

  parseIncomingMessage(rawMessage) {
    let payload;

    try {
      payload = JSON.parse(rawMessage.toString('utf8'));
    } catch {
      return null;
    }

    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
      return null;
    }

    const { username, text } = payload;

    if (typeof text !== 'string' || text.length > this.maxMessageLength) {
      return null;
    }

    return {
      username:
        username === undefined || username === null
          ? null
          : this.sanitizeUsername(username),
      text,
    };
  }

  createSystemMessage(text) {
    return { type: 'system', text };
  }

  createChatMessage(username, text) {
    return { type: 'chat', username, text };
  }

  createErrorMessage(text) {
    return { type: 'error', text };
  }
}
