import path from 'path';
import { buildReleaseScript } from './buildReleaseScript';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonLocation = path.resolve(
  path.join(__dirname, '..', 'package.json')
);

buildReleaseScript({
  packageJsonLocation,
  buildHandlerOptions: {
    repositoryUrl: 'https://github.com/HubSpot/hubspot-cms-vscode',
    mainBranch: 'master',
  },
});
