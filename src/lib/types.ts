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
