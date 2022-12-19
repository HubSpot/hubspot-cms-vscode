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

export interface HubLValidationError {
  reason: string;
  message: string;
  lineno: number;
  startPosition: number;
  categoryErrors: {
    fullName?: string;
    path?: string;
  };
  category: string;
}
