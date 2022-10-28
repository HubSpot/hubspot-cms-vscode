const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const {
  updateConfigWithPersonalAccessKey,
} = require('@hubspot/cli-lib/personalAccessKey');
const {
  createEmptyConfigFile,
  // updateDefaultAccount,
  // findConfig,
  setConfigPath,
} = require('@hubspot/cli-lib/lib/config');

const startAuthServer = ({ configPath, rootPath }: any, logOutput: any) => {
  const app = express();
  const port = 4441;

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.get('/', (req: any, res: any) => {
    logOutput('GET');
    res.send('Hello World!');
  });

  app.post('/', async (req: any, res: any) => {
    logOutput(`POST Body: ${JSON.stringify(req.body, null, 2)}`);
    logOutput(`Req Host: ${req.url} - ${req.url.path}`);
    // TODO - Figure out which env the request came from to set `env`

    try {
      const {
        name,
        personalAccessKeyResp: { encodedOAuthRefreshToken: personalAccessKey },
      } = req.body;

      if (configPath) {
        // Do we need this?
        setConfigPath(configPath);
      } else {
        await createEmptyConfigFile({ path: `${rootPath}/hubspot.config.yml` });
      }
      const updatedConfig = await updateConfigWithPersonalAccessKey({
        personalAccessKey,
        name,
        env: 'QA',
      });

      logOutput(`Updated config: ${JSON.stringify(updatedConfig, null, 2)}`);

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
