const fetch = require('node-fetch');
const fs = require('fs');

const packageLockJSON = require('../package-lock.json');
const cliLibVersion = packageLockJSON.dependencies['@hubspot/cli-lib'].version;

console.log('Running precommit check for lang files...');
(async () => {
  const res = await fetch(
    `https://raw.githubusercontent.com/HubSpot/hubspot-cli/v${cliLibVersion}/packages/cli-lib/lang/en.lyaml`
  );
  const txt = await res.text();
  const localLyaml = fs.readFileSync('./src/lang/en.lyaml', 'utf8');
  if (txt !== localLyaml) {
    console.error('Local lyaml needs to be updated because it is out of sync, replacing...');
    fs.writeFileSync('./src/lang/en.lyaml', txt);
  } else {
    console.log(`Local lyaml matches remote for v${cliLibVersion}!`);
  }
})();
