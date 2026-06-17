import type { AnySchema } from '@hubspot/project-parsing-lib/schema';
import type { ValidateFunction } from 'ajv';
import { Command } from 'vscode';

export interface Link {
  label: string;
  url: string;
}

export function instanceOfLink(value: unknown): value is Link {
  return value !== null && typeof value === 'object' && 'url' in value;
}

export function instanceOfCommand(value: unknown): value is Command {
  return (
    value !== null &&
    typeof value === 'object' &&
    'title' in value &&
    'command' in value
  );
}

export interface FileLink {
  label: string;
  path: string;
  isDefault: boolean;
  isFolder: boolean;
  isSynced: boolean;
}

export interface RemoteFsDirectory {
  id: string;
  name: string;
  folder: boolean;
  children: string[];
}

export interface FileAssociations {
  [key: string]: string;
}

export type SchemaAndValidator = {
  schema: AnySchema;
  validator?: ValidateFunction;
};

export type SchemaCacheEntry =
  | {
      type: 'schema';
      schemasByType: Record<
        string, // internal type
        SchemaAndValidator
      >;
    }
  | { type: 'error'; error: string };

// A schema cache maps a platform version to a set of schemas and validators indexed by the internal type.
// Validators are compiled on demand and then cached.
export type PlatformVersionSchemaCache = Record<
  string, // platform version
  SchemaCacheEntry
>;
