import path from 'path';

try {
  process.loadEnvFile(path.join(import.meta.dirname, '..', '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

export const readRaw = (name, env = process.env) => {
  const raw = env[name];

  return raw === undefined || raw.trim() === '' ? undefined : raw.trim();
};

export const readNumber = (
  name,
  fallback,
  { min = 0, max = Number.MAX_SAFE_INTEGER } = {},
  env = process.env,
) => {
  const raw = readRaw(name, env);

  if (raw === undefined) {
    return fallback;
  }

  const value = Number(raw);

  if (!Number.isFinite(value) || value < min || value > max) {
    console.warn(
      `[chat] invalid value for ${name} ("${raw}"), using ${fallback} instead`,
    );
    return fallback;
  }

  return value;
};

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

export const readBoolean = (name, fallback, env = process.env) => {
  const raw = readRaw(name, env);

  if (raw === undefined) {
    return fallback;
  }

  const value = raw.toLowerCase();

  if (TRUE_VALUES.has(value)) {
    return true;
  }

  if (FALSE_VALUES.has(value)) {
    return false;
  }

  console.warn(
    `[chat] invalid value for ${name} ("${raw}"), using ${fallback} instead`,
  );
  return fallback;
};

export const DEFAULTS = {
  port: 3001,
  maxPayloadBytes: 16 * 1024,
  heartbeatIntervalMs: 30_000,
  maxMessageLength: 1000,
  useConnectionIdentity: true,
};

export const config = {
  port: readNumber('PORT', DEFAULTS.port, { min: 1, max: 65535 }),

  publicDir: path.join(import.meta.dirname, '..', 'public'),

  maxPayloadBytes: readNumber(
    'MAX_PAYLOAD_BYTES',
    DEFAULTS.maxPayloadBytes,
    { min: 1024 },
  ),

  heartbeatIntervalMs: readNumber(
    'HEARTBEAT_INTERVAL_MS',
    DEFAULTS.heartbeatIntervalMs,
    { min: 1000 },
  ),

  maxMessageLength: readNumber(
    'MAX_MESSAGE_LENGTH',
    DEFAULTS.maxMessageLength,
    { min: 1 },
  ),

  useConnectionIdentity: readBoolean(
    'USE_CONNECTION_IDENTITY',
    DEFAULTS.useConnectionIdentity,
  ),
};
