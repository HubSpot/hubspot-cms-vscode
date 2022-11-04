import * as vscode from 'vscode';

const setCustomClauseVariables = (configPath: any) => {
  // logOutput(
  //   `Setting hubspot.folderContainsHublFiles variable to ${!!configPath}`
  // );
  vscode.commands.executeCommand(
    'setContext',
    'hubspot.folderContainsHubSpotConfigYaml',
    !!configPath
  );
};

module.exports = {
  setCustomClauseVariables,
};
