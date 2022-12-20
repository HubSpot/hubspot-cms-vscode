import { Command } from 'vscode';

export interface Portal {
  name: string;
  portalId: string;
  authType: string;
  auth: {
    clientId: string;
    clientSecret: string;
    scopes: string[];
    tokenInfo: {
      accessToken: string;
      expiresAt: number;
      refreshToken: string;
    };
  };
  personalAccessKey: string;
  env?: string;
  sandboxAccountType?: string;
  parentAccountId?: number;
}

export interface HubspotConfig {
  defaultPortal: string;
  portals: Array<Portal>;
  defaultMode?: 'draft' | 'published' | undefined;
  httpTimeout?: number | undefined;
  allowUsageTracking?: boolean | undefined;
  useCustomObjectHubFile?: boolean | undefined;
}

export interface Link {
  label: string;
  url: string;
}

export function instanceOfLink(object: any): object is Link {
  return 'url' in object;
}

export function instanceOfCommand(object: any): object is Command {
  return 'title' in object && 'command' in object;
}
