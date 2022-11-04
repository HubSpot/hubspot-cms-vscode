import * as vscode from 'vscode';

export const setCustomClauseVariables = (configPath: any) => {
  console.log(
    `Setting hubspot.folderContainsHublFiles variable to ${!!configPath}`
  );
  vscode.commands.executeCommand(
    'setContext',
    'hubspot.folderContainsHubSpotConfigYaml',
    !!configPath
  );
};
