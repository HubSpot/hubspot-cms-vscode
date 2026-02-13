import { VSCODE_VERSION_INCREMENT_OPTIONS } from './constants';

export type VscodeReleaseArguments = {
  versionIncrement: (typeof VSCODE_VERSION_INCREMENT_OPTIONS)[number];
  dryRun: boolean;
  skipBranchCheck: boolean;
  skipVersionCheck: boolean;
};

export interface VscodeReleaseScriptBase {
  repositoryUrl: string;
  mainBranch?: string;
  build?: () => Promise<void> | void;
}

export interface VscodeReleaseScriptOptions extends VscodeReleaseScriptBase {
  packageName: string;
  localVersion: string;
}
