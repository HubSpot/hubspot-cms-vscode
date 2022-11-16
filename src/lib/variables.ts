import * as vscode from 'vscode';

export const setCustomClauseVariables = (configPath: string | undefined) => {
  console.log(`Setting hubspot.configPath variable to ${configPath}`);
  vscode.commands.executeCommand(
    'setContext',
    'hubspot.configPath',
    configPath
  );
};

export const initializeVariables = () => {};
