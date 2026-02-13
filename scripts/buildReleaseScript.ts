import { exec as _exec } from 'node:child_process';
import { promisify } from 'util';
import yargs, { ArgumentsCamelCase, Argv } from 'yargs';
import semver from 'semver';
import open from 'open';
import fs from 'fs-extra';
import {
  EXIT_CODES,
  DEFAULT_MAIN_BRANCH,
  VSCODE_VERSION_INCREMENT_OPTIONS,
} from './constants';
import {
  VscodeReleaseArguments,
  VscodeReleaseScriptBase,
  VscodeReleaseScriptOptions,
} from './types';
import { confirm, logger, getCurrentGitBranch } from './utils';

const exec = promisify(_exec);

function buildHandler({
  build,
  packageName,
  localVersion,
  mainBranch,
  repositoryUrl,
}: VscodeReleaseScriptOptions) {
  return async function handler({
    versionIncrement,
    dryRun,
    skipBranchCheck,
    skipVersionCheck,
  }: ArgumentsCamelCase<VscodeReleaseArguments>): Promise<void> {
    try {
      const branch = await getCurrentGitBranch();
      const isDryRun = Boolean(dryRun);

      if (!skipBranchCheck && branch !== mainBranch) {
        logger.error(
          `Releases can only be published from the ${mainBranch} branch. Current branch: ${branch}`
        );
        process.exit(EXIT_CODES.ERROR);
      }

      if (!skipVersionCheck) {
        try {
          const { stdout: lastTag } = await exec(
            'git describe --tags --abbrev=0'
          );
          const lastTagVersion = lastTag.trim().replace(/^v/, '');
          if (lastTagVersion !== localVersion) {
            logger.error(
              `Local package.json version ${localVersion} is out of sync with the latest git tag v${lastTagVersion}`
            );
            process.exit(EXIT_CODES.ERROR);
          }
        } catch {
          logger.warn('No git tags found, skipping version check.');
        }
      }

      let vsceCmd = 'vsce';
      try {
        await exec('vsce --version');
      } catch {
        logger.log('Installing @vscode/vsce...');
        await exec('yarn global add @vscode/vsce');
        try {
          await exec('vsce --version');
        } catch {
          vsceCmd = 'npx @vscode/vsce';
        }
      }

      const newVersion = semver.inc(localVersion, versionIncrement);

      if (!newVersion) {
        logger.error('Error incrementing version.');
        process.exit(EXIT_CODES.ERROR);
      }

      if (isDryRun) {
        logger.log('\nDRY RUN');
      }
      logger.log(`\nCurrent version: ${localVersion}`);
      logger.log(`New version to release: ${newVersion}`);

      const shouldRelease = await confirm({
        message: `Release version ${newVersion}?`,
      });

      if (!shouldRelease) {
        process.exit(EXIT_CODES.SUCCESS);
      }

      logger.log(`\nUpdating version to ${newVersion}...`);
      await exec(
        `yarn version --no-git-tag-version --new-version ${newVersion}`
      );
      logger.success('Version updated in package.json');

      const userHasTested = await confirm({
        message: 'Have you tested the pre-release package locally?',
      });

      if (!userHasTested) {
        logger.log('\nBuilding and packaging the pre-release for testing...\n');

        if (build && typeof build === 'function') {
          await build();
        } else {
          logger.log('Installing dependencies...');
          await exec('yarn install');

          logger.log('Running linting...');
          await exec('yarn lint');
        }

        logger.log('\nPackaging pre-release...');
        await exec(
          `mkdir -p releases && ${vsceCmd} package --pre-release -o releases/`
        );
        logger.success('Pre-release package created in releases/');

        logger.log('\nTo test the package locally:');
        logger.log('  1. Open VS Code');
        logger.log('  2. Go to the Extensions panel');
        logger.log('  3. Click "..." menu → "Install from VSIX..."');
        logger.log('  4. Select the .vsix file created above');
        logger.log('  5. Test key functionality\n');

        const readyToContinue = await confirm({
          message: 'Continue when you have finished testing the pre-release.',
        });

        if (!readyToContinue) {
          logger.log('Release aborted. Reverting version bump...');
          await exec('git checkout -- package.json');
          process.exit(EXIT_CODES.SUCCESS);
        }
      }

      logger.log(
        '\nPackaging regular release (this will overwrite the pre-release .vsix)...'
      );
      await exec(`mkdir -p releases && ${vsceCmd} package -o releases/`);
      logger.success('Regular release package created in releases/');

      const confirmRegularRelease = await confirm({
        message:
          'Test the regular release .vsix and confirm it works. Ready to proceed?',
      });

      if (!confirmRegularRelease) {
        logger.log(
          'Release aborted after regular release packaging. Reverting package.json version bump...'
        );
        logger.log('NOTE: You may discard the newly created .vsix file');
        await exec('git checkout -- package.json');
        process.exit(EXIT_CODES.SUCCESS);
      }

      const tempBranch = `v${newVersion}-publish`;

      if (isDryRun) {
        logger.log('\nReverting package.json version...');
        await exec('git checkout -- package.json');
        logger.log('\nDry run complete. Would have:');
        logger.log(`  1. Created branch ${tempBranch}`);
        logger.log(`  2. Committed package.json version bump`);
        logger.log(`  3. Pushed ${tempBranch} to origin`);
        logger.log(`  4. Opened draft PR page`);
        logger.log(`  5. Opened releases page`);
        logger.log(`  6. Opened VS Code Marketplace for .vsix upload`);
        logger.log(`  7. Reminded to publish to Open VSX`);
        process.exit(EXIT_CODES.SUCCESS);
      }

      if (branch === mainBranch) {
        logger.log(`\nCreating release branch ${tempBranch}...`);
        await exec(`git checkout -b ${tempBranch}`);
      }

      logger.log('Committing changes...');
      await exec('git add package.json');
      await exec(`git commit -m "chore: Bump to ${newVersion}"`);

      logger.log(`Creating git tag: v${newVersion}`);
      await exec(`git tag v${newVersion}`);

      logger.log(`\nPushing changes to Github...`);
      await exec(`git push --atomic origin ${tempBranch} v${newVersion}`);
      logger.log(`Changes pushed successfully`);

      logger.log(`\nOpening GitHub compare. Remember to create a new PR.`);
      await open(`${repositoryUrl}/compare/${mainBranch}...${tempBranch}`);

      logger.log(
        `\nOpening GitHub new release page. Remember to create a new release on Github.`
      );
      await open(`${repositoryUrl}/releases/new`);

      logger.log('\nNext steps:');
      logger.log(
        '  1. Upload the .vsix file to the VS Code Marketplace. If you need access, see: https://product.hubteam.com/docs/developer-platform/vscode-extension/publisher-access.html'
      );
      logger.log(
        `  2. Publish to Open VSX (for Cursor/Windsurf). Ensure the ovsx CLI is installed via npm install -g ovsx. Then run ovsx publish releases/hubl-${newVersion}.vsix -p YOUR_ACCESS_TOKEN `
      );
      logger.log(`  3. Merge the release PR`);
      logger.log(`  4. Publish the GH release`);

      await open(
        'https://marketplace.visualstudio.com/manage/publishers/hubspot'
      );

      logger.success(
        `\n${packageName} version ${newVersion} release prepared successfully!`
      );
    } catch (e) {
      logger.error(e);
      logger.log('Reverting package.json...');
      await exec('git checkout -- package.json');
      logger.warn(
        'If changes were already pushed, you may need to manually clean up the remote branch and tag.'
      );
      process.exit(EXIT_CODES.ERROR);
    }
  };
}

async function builder(yargs: Argv): Promise<Argv> {
  return yargs.options({
    versionIncrement: {
      alias: 'v',
      demandOption: true,
      describe: 'SemVer increment type for the next release',
      choices: VSCODE_VERSION_INCREMENT_OPTIONS,
    },
    dryRun: {
      alias: 'd',
      describe:
        'Run through the release process without pushing or creating releases',
      default: false,
      type: 'boolean',
    },
    skipBranchCheck: {
      describe: 'Bypass the branch check check',
      default: false,
      type: 'boolean',
    },
    skipVersionCheck: {
      describe:
        'Bypass checking that the local version matches the published version',
      default: false,
      type: 'boolean',
    },
  });
}

export function buildReleaseScript({
  packageJsonLocation,
  buildHandlerOptions,
}: {
  packageJsonLocation: string;
  buildHandlerOptions: VscodeReleaseScriptBase;
}) {
  try {
    const packageJsonContents = fs.readJsonSync(packageJsonLocation);

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    yargs(process.argv.slice(2))
      .scriptName('yarn')
      .usage('HubSpot VSCode extension release script')
      .command(
        'release',
        `Create a new release of the ${packageJsonContents.name} VSCode extension`,
        builder,
        buildHandler({
          ...buildHandlerOptions,
          packageName: packageJsonContents.name,
          localVersion: packageJsonContents.version,
          mainBranch: buildHandlerOptions.mainBranch || DEFAULT_MAIN_BRANCH,
        })
      )
      .version(false)
      .help().argv;
  } catch (e) {
    logger.error(e);
    process.exit(EXIT_CODES.ERROR);
  }
}
