import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { workspace } from 'vscode';
import { getUserIdentificationInformation } from '../tracking';

vi.mock('@hubspot/local-dev-lib/config', () => ({
  getConfig: vi.fn(),
  getConfigAccountIfExists: vi.fn(),
  getConfigDefaultAccountIfExists: vi.fn().mockReturnValue(null),
}));

vi.mock('@hubspot/local-dev-lib/trackUsage', () => ({
  trackUsage: vi.fn().mockResolvedValue(undefined),
}));

import {
  getConfig,
  getConfigAccountIfExists,
  getConfigDefaultAccountIfExists,
} from '@hubspot/local-dev-lib/config';

const setupTrackingAllowed = () => {
  vi.mocked(getConfig).mockReturnValue({ allowUsageTracking: true } as any);
  vi.spyOn(workspace, 'getConfiguration').mockReturnValue({
    get: vi.fn(),
    telemetry: { enableTelemetry: true },
  } as any);
};

describe('getUserIdentificationInformation', () => {
  beforeEach(() => {
    vi.mocked(getConfig).mockReset();
    vi.mocked(getConfigAccountIfExists).mockReset();
    vi.mocked(getConfigDefaultAccountIfExists).mockReturnValue(null as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when tracking is not allowed → returns empty object', () => {
    it('returns {} when getConfig throws', () => {
      vi.mocked(getConfig).mockImplementation(() => {
        throw new Error('No config file found');
      });

      expect(getUserIdentificationInformation()).toEqual({});
    });

    it('returns {} when config.allowUsageTracking is false', () => {
      vi.mocked(getConfig).mockReturnValue({ allowUsageTracking: false } as any);
      vi.spyOn(workspace, 'getConfiguration').mockReturnValue({
        telemetry: { enableTelemetry: true },
      } as any);

      expect(getUserIdentificationInformation()).toEqual({});
    });

    it('returns {} when config.allowUsageTracking is undefined', () => {
      vi.mocked(getConfig).mockReturnValue({} as any);
      vi.spyOn(workspace, 'getConfiguration').mockReturnValue({
        telemetry: { enableTelemetry: true },
      } as any);

      expect(getUserIdentificationInformation()).toEqual({});
    });

    it('returns {} when VSCode telemetry is disabled', () => {
      vi.mocked(getConfig).mockReturnValue({ allowUsageTracking: true } as any);
      vi.spyOn(workspace, 'getConfiguration').mockReturnValue({
        telemetry: { enableTelemetry: false },
      } as any);

      expect(getUserIdentificationInformation()).toEqual({});
    });

    it('returns {} when workspace.getConfiguration throws', () => {
      vi.mocked(getConfig).mockReturnValue({ allowUsageTracking: true } as any);
      vi.spyOn(workspace, 'getConfiguration').mockImplementation(() => {
        throw new TypeError('getConfiguration is not a function');
      });

      expect(getUserIdentificationInformation()).toEqual({});
    });

    it('returns {} when getConfiguration returns an object without telemetry property', () => {
      vi.mocked(getConfig).mockReturnValue({ allowUsageTracking: true } as any);
      vi.spyOn(workspace, 'getConfiguration').mockReturnValue({
        get: vi.fn(),
        // no telemetry property — accessing .telemetry.enableTelemetry throws
      } as any);

      // The try/catch in isTrackingAllowedInVSCode catches the TypeError
      expect(getUserIdentificationInformation()).toEqual({});
    });
  });

  describe('when tracking is allowed → returns identification object', () => {
    beforeEach(() => {
      setupTrackingAllowed();
    });

    it('returns an object with the expected shape', () => {
      const result = getUserIdentificationInformation();

      expect(result).toMatchObject({
        applicationName: 'hubspot.hubl',
        language: expect.any(String),
        machineId: expect.any(String),
        os: expect.any(String),
        shell: expect.any(String),
        vscodeVersion: expect.any(String),
        authType: expect.any(String),
      });
    });

    it('sets applicationName to "hubspot.hubl"', () => {
      const result = getUserIdentificationInformation() as any;
      expect(result.applicationName).toBe('hubspot.hubl');
    });

    it('returns authType "unknown" when no accountId is provided', () => {
      const result = getUserIdentificationInformation(undefined) as any;
      expect(result.authType).toBe('unknown');
    });

    it('returns authType "apikey" (fallback) when accountId is provided but account does not exist in config', () => {
      // getAuthType falls back to 'apikey' — not 'unknown' — when accountConfig is falsy.
      // 'unknown' is only returned when no accountId is provided at all.
      vi.mocked(getConfigAccountIfExists).mockReturnValue(undefined as any);
      const result = getUserIdentificationInformation('999') as any;
      expect(result.authType).toBe('apikey');
    });

    it('returns authType "apikey" when account exists but has no authType field', () => {
      vi.mocked(getConfigAccountIfExists).mockReturnValue({
        accountId: 123,
        // no authType property
      } as any);

      const result = getUserIdentificationInformation('123') as any;
      expect(result.authType).toBe('apikey');
    });

    it('returns the account authType when the account has one set', () => {
      vi.mocked(getConfigAccountIfExists).mockReturnValue({
        accountId: 123,
        authType: 'personalaccesskey',
      } as any);

      const result = getUserIdentificationInformation('123') as any;
      expect(result.authType).toBe('personalaccesskey');
    });

    it('passes the accountId as a number to getConfigAccountIfExists', () => {
      vi.mocked(getConfigAccountIfExists).mockReturnValue(null as any);

      getUserIdentificationInformation('456');

      expect(getConfigAccountIfExists).toHaveBeenCalledWith(456);
    });

    it('includes prettierPluginVersion (initially null before setPrettierPluginVersion runs)', () => {
      const result = getUserIdentificationInformation() as any;
      // prettierPluginVersion is a module-level variable, starts as null
      // (set async during initializeTracking which we don't call here)
      expect(result.prettierPluginVersion).toBeNull();
    });
  });
});
