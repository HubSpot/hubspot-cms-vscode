import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'HubSpot.hubl';

suite('Extension', () => {
  suite('Activation', () => {
    test('extension is present', () => {
      assert.ok(
        vscode.extensions.getExtension(EXTENSION_ID),
        `Extension "${EXTENSION_ID}" should be installed in test host`
      );
    });

    test('activates successfully', async () => {
      const ext = vscode.extensions.getExtension(EXTENSION_ID);
      assert.ok(ext);
      await ext!.activate();
      assert.strictEqual(ext!.isActive, true);
    });
  });

  suite('Command registration', () => {
    let registeredCommands: string[];

    suiteSetup(async () => {
      const ext = vscode.extensions.getExtension(EXTENSION_ID);
      await ext!.activate();
      registeredCommands = await vscode.commands.getCommands(true);
    });

    const expectedCommands = [
      'hubspot.create.module',
      'hubspot.create.section',
      'hubspot.create.template',
      'hubspot.create.partial',
      'hubspot.create.globalPartial',
      'hubspot.create.serverlessFunction',
      'hubspot.create.serverlessFunctionFolder',
      'hubspot.config.selectDefaultAccount',
      'hubspot.config.setDefaultAccount',
      'hubspot.config.deleteAccount',
      'hubspot.config.renameAccount',
      'hubspot.modals.openFeedbackPanel',
      'hubspot.account.openDesignManager',
      'hubspot.account.viewPersonalAccessKey',
      'hubspot.remoteFs.hardRefresh',
      'hubspot.remoteFs.endWatch',
      // hubspot.remoteFs.{upload,watch,fetch,delete} are only registered when
      // an account is configured (see commands/remoteFs.ts) — not testable
      // in a no-account fixture environment.
    ];

    for (const command of expectedCommands) {
      test(`registers ${command}`, () => {
        assert.ok(
          registeredCommands.includes(command),
          `Expected command "${command}" to be registered`
        );
      });
    }
  });
});
