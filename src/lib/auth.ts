import { setCustomClauseVariables } from './variables';
import { updateStatusBarItems } from './statusBar';
const { findConfig, loadConfig, validateConfig } = require('@hubspot/cli-lib');

export const loadHubspotConfigFile = (rootPath: string) => {
  if (!rootPath) {
    return;
  }

  console.log(`Root path: ${rootPath}`);

  const path = findConfig(rootPath);
  setCustomClauseVariables(path);

  console.log(`Path: ${path}`);

  if (!path) {
    return;
  }

  loadConfig(path);

  if (!validateConfig()) {
    return;
  } else {
    return path;
  }
};
