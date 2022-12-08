import * as vscode from 'vscode';
import * as fs from 'fs';
import {
  getUpdateLintingOnConfigChange,
  setLintingEnabledState,
} from '../../lib/lint';
import { updateStatusBarItems } from '../../lib/statusBar';
import { COMMANDS } from '../constants';
import { loadHubspotConfigFile } from '../auth';

let configFoundAndLoaded = false;
let hubspotConfigWatcher: fs.FSWatcher | null;

export const registerCommands = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      COMMANDS.ON_CONFIG_FOUND,
      (rootPath, configPath) => {
        if (!configFoundAndLoaded) {
          configFoundAndLoaded = true;
          console.log(COMMANDS.ON_CONFIG_FOUND);
          setLintingEnabledState();
          context.subscriptions.push(getUpdateLintingOnConfigChange());
          updateStatusBarItems();
        }

        if (!hubspotConfigWatcher) {
          console.log(`watching: ${configPath}`);
          // This triggers an in-memory update of the config when the file changes
          hubspotConfigWatcher = fs.watch(
            configPath,
            async (eventType: any) => {
              if (eventType === 'change') {
                console.log(`${configPath} changed`);
                loadHubspotConfigFile(rootPath);
              } else if (eventType === 'rename') {
                // 'rename' event is triggers for renames and deletes
                console.log(`${configPath} renamed/deleted`);
                loadHubspotConfigFile(rootPath);
                hubspotConfigWatcher && hubspotConfigWatcher.close();
                hubspotConfigWatcher = null;
                console.log(`stopped watching ${configPath}`);
              }
            }
          );
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.ON_CONFIG_UPDATED, () => {
      console.log(COMMANDS.ON_CONFIG_UPDATED);
      vscode.commands.executeCommand(COMMANDS.ACCOUNTS_REFRESH);
      updateStatusBarItems();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.AUTHORIZE_ACCOUNT, async () => {
      const authUrl =
        'https://app.hubspot.com/l/personal-access-key/auth/vscode';

      const callableUri = await vscode.env.asExternalUri(
        vscode.Uri.parse(authUrl)
      );
      await vscode.env.openExternal(callableUri);
    })
  );
};
