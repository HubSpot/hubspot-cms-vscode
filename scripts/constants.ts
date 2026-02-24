export const EXIT_CODES = {
  SUCCESS: 0,
  ERROR: 1,
};

export const DEFAULT_MAIN_BRANCH = 'master';

export const INCREMENT = {
  PATCH: 'patch',
  MINOR: 'minor',
  MAJOR: 'major',
  PRERELEASE: 'prerelease',
} as const;

export const VSCODE_VERSION_INCREMENT_OPTIONS = [
  INCREMENT.PATCH,
  INCREMENT.MINOR,
  INCREMENT.MAJOR,
] as const;
