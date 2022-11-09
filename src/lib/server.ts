import * as express from 'express';
import * as bodyParser from 'body-parser';

const cors = require('cors');

const corsOptions = {
  origin: /^http(s)?:\/\/.*hubspot(qa)?\.com.*$/,
};
const port = 4441;

export const startServer = ({ onPostRequest }: any) => {
  const server = express();

  server.use(cors(corsOptions));
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());

  server.post('/auth', async (req: any, res: any) => {
    console.log(`POST to /auth received from origin: ${req.headers.origin}`);

    try {
      res.send(await onPostRequest(req));
    } catch (e) {
      res.status(500).send(e);
    }
  });

  server.listen(port, () => {
    console.log(`Local server listening on port ${port}`);
  });

  return server;
};
