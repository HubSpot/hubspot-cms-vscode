import * as vscode from 'vscode';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import {
  EXTENSION_CONFIG_NAME,
  EXTENSION_CONFIG_KEYS,
} from '../../lib/constants';

const cors = require('cors');

export const startAuthServer = ({ onPostRequest }: any) => {
  const app = express();
  const port = vscode.workspace
    .getConfiguration(EXTENSION_CONFIG_NAME)
    .get(EXTENSION_CONFIG_KEYS.NETWORK.AUTH_SERVER_PORT);

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.post('/', async (req: any, res: any) => {
    console.log(`Auth POST Body: ${JSON.stringify(req.body, null, 2)}`);

    try {
      res.send(await onPostRequest(req));
    } catch (e) {
      res.status(500).send(e);
    }
  });

  app.listen(port, () => {
    console.log(`Auth server listening on port ${port}`);
  });
};
