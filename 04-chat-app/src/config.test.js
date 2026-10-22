import { jest } from '@jest/globals';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULTS, readBoolean, readNumber, readRaw } from './config.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(moduleDir, 'config.js');

const runConfig = (env = {}, cwd = moduleDir, modulePath = configPath) => {
  const script =
    `import(${JSON.stringify(modulePath)}).then(({ config }) => ` +
    `console.log(JSON.stringify(config)))`;

  return spawnSync(
    process.execPath,
    ['--input-type=module', '-e', script],
    {
      cwd,
      env: { ...process.env, ...env },
      encoding: 'utf8',
    },
  );
};

const readConfig = (env = {}, cwd = moduleDir, modulePath = configPath) => {
  const { stdout } = runConfig(env, cwd, modulePath);

  return JSON.parse(stdout.trim().split('\n').pop());
};

describe('readRaw', () => {  test('should return undefined when the variable does not exist', () => {
    expect(readRaw('MISSING', {})).toBeUndefined();
  });

  test('should return undefined for an empty variable', () => {
    expect(readRaw('EMPTY', { EMPTY: '' })).toBeUndefined();
    expect(readRaw('BLANK', { BLANK: '   ' })).toBeUndefined();
  });

  test('should return the trimmed value', () => {
    expect(readRaw('NAME', { NAME: '  Camper  ' })).toBe('Camper');
  });
});

describe('readNumber', () => {
  test('should return the fallback when the variable does not exist', () => {
    expect(readNumber('PORT', 3001, {}, {})).toBe(3001);
  });

  test('should return the value of the variable', () => {
    expect(readNumber('PORT', 3001, {}, { PORT: '4321' })).toBe(4321);
  });

  test('should return the fallback when the value is not a number', () => {
    expect(readNumber('PORT', 3001, {}, { PORT: 'abc' })).toBe(3001);
  });

  test('should return the fallback when the value is out of range', () => {
    expect(
      readNumber('PORT', 3001, { min: 1, max: 65535 }, { PORT: '70000' }),
    ).toBe(3001);
    expect(
      readNumber('PORT', 3001, { min: 1, max: 65535 }, { PORT: '0' }),
    ).toBe(3001);
  });

  test('should warn about the invalid value', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    readNumber('PORT', 3001, {}, { PORT: 'abc' });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('invalid value for PORT'),
    );

    warn.mockRestore();
  });
});

describe('readBoolean', () => {
  test('should return the fallback when the variable does not exist', () => {
    expect(readBoolean('FLAG', true, {})).toBe(true);
  });

  test('should accept the usual truthy values', () => {
    for (const value of ['1', 'true', 'TRUE', 'yes', 'on']) {
      expect(readBoolean('FLAG', false, { FLAG: value })).toBe(true);
    }
  });

  test('should accept the usual falsy values', () => {
    for (const value of ['0', 'false', 'FALSE', 'no', 'off']) {
      expect(readBoolean('FLAG', true, { FLAG: value })).toBe(false);
    }
  });

  test('should return the fallback when the value is not a boolean', () => {
    expect(readBoolean('FLAG', true, { FLAG: 'maybe' })).toBe(true);
  });
});

describe('config', () => {
  let tempDir;
  let tempConfigPath;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chat-config-'));
    fs.mkdirSync(path.join(tempDir, 'src'));
    tempConfigPath = path.join(tempDir, 'src', 'config.js');
    fs.copyFileSync(configPath, tempConfigPath);
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('defaults', () => {
    test('should use the default values when no variable is set', () => {
      const config = readConfig({}, tempDir, tempConfigPath);

      expect(config.port).toBe(DEFAULTS.port);
      expect(config.maxPayloadBytes).toBe(DEFAULTS.maxPayloadBytes);
      expect(config.heartbeatIntervalMs).toBe(DEFAULTS.heartbeatIntervalMs);
      expect(config.maxMessageLength).toBe(DEFAULTS.maxMessageLength);
      expect(config.useConnectionIdentity).toBe(DEFAULTS.useConnectionIdentity);
    });

    test('should expose the absolute path of the public folder', () => {
      const config = readConfig({}, moduleDir, configPath);

      expect(path.isAbsolute(config.publicDir)).toBe(true);
      expect(config.publicDir.endsWith(path.join('04-chat-app', 'public'))).toBe(
        true,
      );
    });
  });

  describe('environment variables', () => {
    test('should read the numeric variables', () => {
      const config = readConfig(
        {
          PORT: '4321',
          MAX_PAYLOAD_BYTES: '2048',
          HEARTBEAT_INTERVAL_MS: '5000',
          MAX_MESSAGE_LENGTH: '50',
        },
        tempDir,
        tempConfigPath,
      );

      expect(config.port).toBe(4321);
      expect(config.maxPayloadBytes).toBe(2048);
      expect(config.heartbeatIntervalMs).toBe(5000);
      expect(config.maxMessageLength).toBe(50);
    });

    test('should read the boolean variables', () => {
      expect(
        readConfig(
          { USE_CONNECTION_IDENTITY: 'false' },
          tempDir,
          tempConfigPath,
        ).useConnectionIdentity,
      ).toBe(false);
      expect(
        readConfig(
          { USE_CONNECTION_IDENTITY: 'true' },
          tempDir,
          tempConfigPath,
        ).useConnectionIdentity,
      ).toBe(true);
    });

    test('should fall back when a numeric value is invalid', () => {
      const config = readConfig(
        { PORT: 'abc', MAX_PAYLOAD_BYTES: '-5' },
        tempDir,
        tempConfigPath,
      );

      expect(config.port).toBe(DEFAULTS.port);
      expect(config.maxPayloadBytes).toBe(DEFAULTS.maxPayloadBytes);
    });

    test('should warn about the invalid values', () => {
      const { stderr } = runConfig({ PORT: 'abc' }, tempDir, tempConfigPath);

      expect(stderr).toContain('invalid value for PORT');
    });
  });

  describe('.env file', () => {
    const envFile = () => path.join(tempDir, '.env');

    afterEach(() => {
      fs.rmSync(envFile(), { force: true });
    });

    test('should load the values of the .env file', () => {
      fs.writeFileSync(envFile(), 'PORT=4321\nMAX_MESSAGE_LENGTH=25\n');

      const config = readConfig({}, tempDir, tempConfigPath);

      expect(config.port).toBe(4321);
      expect(config.maxMessageLength).toBe(25);
    });

    test('should start without a .env file', () => {
      const config = readConfig({}, tempDir, tempConfigPath);

      expect(config.port).toBe(DEFAULTS.port);
    });

    test('should let the real environment variables win', () => {
      fs.writeFileSync(envFile(), 'PORT=4321\n');

      const config = readConfig({ PORT: '5555' }, tempDir, tempConfigPath);

      expect(config.port).toBe(5555);
    });
  });
});
