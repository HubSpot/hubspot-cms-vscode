import { commands, ExtensionContext } from 'vscode';
import * as fs from 'fs';
import {
  getUpdateLintingOnConfigChange,
  setLintingEnabledState,
} from '../../lib/lint';
import { updateStatusBarItems } from '../../lib/statusBar';
import { EVENTS } from '../constants';
import { loadHubspotConfigFile } from '../auth';

let configFoundAndLoaded = false;
let hubspotConfigWatcher: fs.FSWatcher | null;

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(EVENTS.ON_CONFIG_FOUND, (rootPath, configPath) => {
      if (!configFoundAndLoaded) {
        configFoundAndLoaded = true;
        console.log(EVENTS.ON_CONFIG_FOUND);
        setLintingEnabledState();
        context.subscriptions.push(getUpdateLintingOnConfigChange());
        updateStatusBarItems();
      }

      if (!hubspotConfigWatcher) {
        console.log(`watching: ${configPath}`);
        // This triggers an in-memory update of the config when the file changes
        hubspotConfigWatcher = fs.watch(configPath, async (eventType: any) => {
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
        });
      }
    })
  );
};
