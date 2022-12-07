import { env, version, ExtensionContext } from 'vscode';
import { platform, release } from 'os';

import { registerURIHandler } from './lib/uri';
import { registerCommands } from './lib/commands';
import { initializeStatusBar } from './lib/statusBar';
import { getRootPath } from './lib/helpers';
import { initializeProviders } from './lib/providers';
import { initializeConfig } from './lib/auth';

export const activate = async (context: ExtensionContext) => {
  console.log('Activating Extension...');
  const rootPath = getRootPath();

  registerCommands(context);
  registerURIHandler(context, rootPath);

  initializeProviders(context);
  initializeStatusBar(context);

  initializeConfig(rootPath);

  console.log('tracking data: ', {
    machineId: env.machineId,
    shell: env.shell,
    language: env.language,
    source: env.appName,
    vscodeVersion: version,
    extensionName: 'hubspot.hubl',
    os: `${platform()} ${release()}`,
  });
};
