const vscode = require('vscode');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
} = require('../../lib/constants');

const {
  updateConfigWithPersonalAccessKey,
} = require('@hubspot/cli-lib/personalAccessKey');
const {
  createEmptyConfigFile,
  updateDefaultAccount,
  setConfigPath,
} = require('@hubspot/cli-lib/lib/config');

const startAuthServer = (
  { getConfigPath, rootPath, onAuthSuccess }: any,
  logOutput: any
) => {
  const app = express();
  const port = vscode.workspace
    .getConfiguration(EXTENSION_CONFIG_NAME)
    .get(EXTENSION_CONFIG_KEYS.AUTH_SERVER_PORT);

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.post('/', async (req: any, res: any) => {
    logOutput(`Auth POST Body: ${JSON.stringify(req.body, null, 2)}`);

    try {
      const {
        env = 'prod',
        name,
        personalAccessKeyResp: { encodedOAuthRefreshToken: personalAccessKey },
      } = req.body;
      let configPath = getConfigPath(rootPath);

      if (configPath) {
        // Do we need this?
        setConfigPath(configPath);
      } else {
        configPath = `${rootPath}/hubspot.config.yml`;
        await createEmptyConfigFile({ path: configPath });
      }
      const updatedConfig = await updateConfigWithPersonalAccessKey({
        personalAccessKey,
        name,
        env,
      });

      vscode.window.showInformationMessage(
        `Successfully added ${name} to the config.`
      );
      vscode.window
        .showInformationMessage(
          `Do you want to set ${name} as the default account?`,
          'Yes',
          'No'
        )
        .then((answer: string) => {
          if (answer === 'Yes') {
            logOutput(`Updating defaultPortal to ${name}.`);
            updateDefaultAccount(name);
          }
        });

      await onAuthSuccess(updatedConfig, name, configPath);
      res.send(updatedConfig);
    } catch (e) {
      res.status(500).send(e);
    }
  });

  app.listen(port, () => {
    logOutput(`Auth server listening on port ${port}`);
  });
};

module.exports = { startAuthServer };
