import { commands, workspace, ExtensionContext } from 'vscode';
import { convertFolderToModule } from '../fileHelpers';
import { trackEvent } from '../tracking';
import { COMMANDS, TRACKED_EVENTS } from '../constants';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(COMMANDS.CREATE_MODULE, async (clickContext) => {
      if (clickContext.scheme === 'file') {
        const createFileSubscription = workspace.onWillCreateFiles(
          convertFolderToModule(clickContext.fsPath, async () => {
            await trackEvent(TRACKED_EVENTS.CREATE_MODULE);
            createFileSubscription.dispose();
          })
        );

        commands.executeCommand('explorer.newFolder');
      }
    })
  );
};
