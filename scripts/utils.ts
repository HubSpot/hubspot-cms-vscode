import { promisify } from 'util';
import { exec as _exec } from 'node:child_process';
import { EXIT_CODES } from './constants';
import chalk from 'chalk';
import _confirm from '@inquirer/confirm';

export const logger = {
  log(...args: unknown[]) {
    console.log(...args);
  },
  info(...args: unknown[]) {
    console.log(`${chalk.cyan('[INFO]')}`, ...args);
  },
  success(...args: unknown[]) {
    console.log(`${chalk.green('[SUCCESS]')}`, ...args);
  },
  warn(...args: unknown[]) {
    console.log(`${chalk.yellow('[WARN]')}`, ...args);
  },
  error(...args: unknown[]) {
    console.log(`${chalk.red('[ERROR]')}`, ...args);
  },
  table(...args: unknown[]) {
    console.table(...args);
  },
};

export async function confirm(
  ...args: Parameters<typeof _confirm>
): Promise<ReturnType<typeof _confirm>> {
  try {
    return await _confirm(...args);
  } catch (e) {
    if (e instanceof Error && e.name === 'ExitPromptError') {
      logger.log('Exiting...');
      process.exit(EXIT_CODES.SUCCESS);
    }
    throw e;
  }
}

const exec = promisify(_exec);

export async function getCurrentGitBranch(): Promise<string> {
  const { stdout } = await exec('git rev-parse --abbrev-ref HEAD');
  return stdout.trim();
}
