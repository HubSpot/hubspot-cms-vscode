import { describe, it, expect } from 'vitest';
import { getDisplayedHubSpotPortalInfo, portalNameInvalid } from '../config';
import type { HubSpotConfigAccount } from '@hubspot/local-dev-lib/types/Accounts';

describe('getDisplayedHubSpotPortalInfo', () => {
  it('returns "name - accountId" when the portal has a name', () => {
    const account = {
      name: 'My Portal',
      accountId: 12345,
    } as HubSpotConfigAccount;
    expect(getDisplayedHubSpotPortalInfo(account)).toBe('My Portal - 12345');
  });

  it('returns just the accountId string when portal has no name', () => {
    const account = { accountId: 12345 } as HubSpotConfigAccount;
    expect(getDisplayedHubSpotPortalInfo(account)).toBe('12345');
  });

  it('returns just the accountId string when portal name is undefined', () => {
    const account = {
      name: undefined,
      accountId: 67890,
    } as HubSpotConfigAccount;
    expect(getDisplayedHubSpotPortalInfo(account)).toBe('67890');
  });

  it('handles accountId of 0', () => {
    const account = { accountId: 0 } as HubSpotConfigAccount;
    expect(getDisplayedHubSpotPortalInfo(account)).toBe('0');
  });

  it('handles an accountId with a name that is an empty string', () => {
    // An empty string is falsy, so it falls back to just the accountId
    const account = { name: '', accountId: 111 } as HubSpotConfigAccount;
    expect(getDisplayedHubSpotPortalInfo(account)).toBe('111');
  });
});

describe('portalNameInvalid', () => {
  describe('type validation', () => {
    it('returns error message when portal name is a number', () => {
      expect(portalNameInvalid(123 as any, null)).toBe(
        'Portal name must be a string'
      );
    });

    it('returns error message when portal name is null', () => {
      expect(portalNameInvalid(null as any, null)).toBe(
        'Portal name must be a string'
      );
    });

    it('returns error message when portal name is undefined', () => {
      expect(portalNameInvalid(undefined as any, null)).toBe(
        'Portal name must be a string'
      );
    });

    it('returns error message when portal name is a boolean', () => {
      expect(portalNameInvalid(true as any, null)).toBe(
        'Portal name must be a string'
      );
    });

    it('returns error message when portal name is an object', () => {
      expect(portalNameInvalid({} as any, null)).toBe(
        'Portal name must be a string'
      );
    });

    it('returns error message when portal name is an array', () => {
      expect(portalNameInvalid([] as any, null)).toBe(
        'Portal name must be a string'
      );
    });
  });

  describe('empty string validation', () => {
    it('returns error message when portal name is an empty string', () => {
      expect(portalNameInvalid('', null)).toBe('Portal name cannot be empty');
    });
  });

  describe('whitespace validation', () => {
    it('returns error when portal name contains an internal space', () => {
      expect(portalNameInvalid('my portal', null)).toBe(
        'Portal name cannot contain spaces'
      );
    });

    it('returns error when portal name is only spaces', () => {
      expect(portalNameInvalid('   ', null)).toBe(
        'Portal name cannot contain spaces'
      );
    });

    it('returns error when portal name has a leading space', () => {
      expect(portalNameInvalid(' myportal', null)).toBe(
        'Portal name cannot contain spaces'
      );
    });

    it('returns error when portal name has a trailing space', () => {
      expect(portalNameInvalid('myportal ', null)).toBe(
        'Portal name cannot contain spaces'
      );
    });

    it('returns error when portal name contains a tab character', () => {
      expect(portalNameInvalid('my\tportal', null)).toBe(
        'Portal name cannot contain spaces'
      );
    });

    it('returns error when portal name contains a newline character', () => {
      expect(portalNameInvalid('my\nportal', null)).toBe(
        'Portal name cannot contain spaces'
      );
    });
  });

  describe('duplicate name validation', () => {
    it('returns empty string when config is null', () => {
      expect(portalNameInvalid('my-portal', null)).toBe('');
    });

    it('returns empty string when config has empty accounts list', () => {
      const config = { portals: [{}], accounts: [] } as any;
      expect(portalNameInvalid('new-portal', config)).toBe('');
    });

    it('returns error when portal name already exists (config has portals key)', () => {
      // The code gates the duplicate check on 'portals' in config
      const config = {
        portals: [{}],
        accounts: [{ name: 'existingPortal', accountId: 123 }],
      } as any;
      expect(portalNameInvalid('existingPortal', config)).toBe(
        'existingPortal already exists in config.'
      );
    });

    it('returns empty string for a unique name when other portals exist', () => {
      const config = {
        portals: [{}],
        accounts: [{ name: 'otherPortal', accountId: 123 }],
      } as any;
      expect(portalNameInvalid('uniquePortal', config)).toBe('');
    });

    it('returns empty string when account entries have undefined names', () => {
      const config = {
        portals: [{}],
        accounts: [{ accountId: 123 }], // no name property
      } as any;
      expect(portalNameInvalid('anyPortal', config)).toBe('');
    });

    it('detects duplicate when config only has accounts key (new-format config)', () => {
      const config = {
        accounts: [{ name: 'existingPortal', accountId: 123 }],
        // No 'portals' key — this is a new-format HubSpot config
      } as any;
      expect(portalNameInvalid('existingPortal', config)).toBe(
        'existingPortal already exists in config.'
      );
    });
  });
});
