import path from 'path';
import { buildVscodeReleaseScript } from '@hubspot/npm-scripts/src/vscode-release';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonLocation = path.resolve(
  path.join(__dirname, '..', 'package.json')
);

buildVscodeReleaseScript({
  packageJsonLocation,
  buildHandlerOptions: {
    repositoryUrl: 'https://github.com/HubSpot/hubspot-cms-vscode',
    mainBranch: 'master',
    marketplaceUrl:
      'https://marketplace.visualstudio.com/items?itemName=HubSpot.hubl',
    extensionName: 'HubL',
  },
});
