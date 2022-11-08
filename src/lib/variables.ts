import * as vscode from 'vscode';

export const setCustomClauseVariables = (configPath: any) => {
  console.log(
    `Setting hubspot.folderContainsHubSpotConfigYaml variable to ${!!configPath}: ${configPath}`
  );
  vscode.commands.executeCommand(
    'setContext',
    'hubspot.folderContainsHubSpotConfigYaml',
    !!configPath
  );
};

export const initializeVariables = () => {};
