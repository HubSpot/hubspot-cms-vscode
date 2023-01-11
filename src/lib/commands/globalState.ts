import { commands, ExtensionContext } from 'vscode';
import * as dayjs from 'dayjs';
import { COMMANDS } from '../constants';

export const registerCommands = (context: ExtensionContext) => {
  context.subscriptions.push(
    commands.registerCommand(
      COMMANDS.GLOBAL_STATE.UPDATE_DELAY,
      async (variableToUpdate, delayNumber, delayUnitName) => {
        const newDelayDate = dayjs()
          .add(delayNumber, delayUnitName)
          .toISOString();

        console.log(`Updating ${variableToUpdate} to ${newDelayDate}`);

        context.globalState.update(variableToUpdate, newDelayDate);
      }
    )
  );
};
