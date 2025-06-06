import { AnySchema, ValidateFunction } from '@hubspot/project-parsing-lib';
import { Command } from 'vscode';

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
