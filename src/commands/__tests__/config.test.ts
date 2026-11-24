import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getConfig } from '@hubspot/local-dev-lib/config';
import { expect, it, vi } from 'vitest';
import { commands, window, type ExtensionContext } from 'vscode';
import { COMMANDS, EVENTS } from '../../lib/constants';
import { showAutoDismissedStatusBarMessage } from '../../lib/statusBar';
import { registerCommands } from '../config';

vi.mock('vscode', () => ({
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn(),
  },
  window: { showInformationMessage: vi.fn().mockResolvedValue('Yes') },
}));

vi.mock('../../lib/statusBar', () => ({
  showAutoDismissedStatusBarMessage: vi.fn(),
}));

it.each([
  { name: 'selected-account', label: 'selected-account' },
  { name: '', label: '12345' },
])(
  'deletes the selected account by ID (label: $label)',
  async ({ name, label }) => {
    const configDir = mkdtempSync(join(tmpdir(), 'hubspot-delete-account-'));
    const configPath = join(configDir, 'hubspot.config.yml');

    try {
      vi.stubEnv('HUBSPOT_CONFIG_PATH', configPath);
      vi.stubEnv('USE_ENVIRONMENT_HUBSPOT_CONFIG', 'false');
      writeFileSync(
        configPath,
        JSON.stringify({
          allowUsageTracking: false,
          defaultAccount: 12345,
          accounts: [
            { accountId: 12345, name },
            { accountId: 67890, name: 'other-account' },
          ],
        })
      );

      registerCommands({ subscriptions: [] } as unknown as ExtensionContext);
      const deleteCommand = vi
        .mocked(commands.registerCommand)
        .mock.calls.find(([id]) => id === COMMANDS.CONFIG.DELETE_ACCOUNT);
      await deleteCommand![1](getConfig().accounts[0]);

      const config = getConfig();
      expect(config.accounts.map(({ accountId }) => accountId)).toEqual([
        67890,
      ]);
      expect(config.defaultAccount).toBeUndefined();
      expect(window.showInformationMessage).toHaveBeenCalledWith(
        `Are you sure that you want to delete ${label} from the config?`,
        'Yes',
        'No'
      );
      expect(showAutoDismissedStatusBarMessage).toHaveBeenCalledWith(
        `Successfully deleted account ${label}.`
      );
      expect(commands.executeCommand).toHaveBeenCalledWith(
        EVENTS.ACCOUNT.REFRESH
      );
    } finally {
      vi.unstubAllEnvs();
      vi.clearAllMocks();
      rmSync(configDir, { recursive: true, force: true });
    }
  }
);
