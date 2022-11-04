const { findConfig, loadConfig, validateConfig } = require('@hubspot/cli-lib');
const { setCustomClauseVariables } = require('./variables');

const loadHubspotConfigFile = (rootPath: string) => {
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
    console.log(`!validateCofig`);
    return;
  } else {
    return path;
  }
};

module.exports = {
  loadHubspotConfigFile,
};
