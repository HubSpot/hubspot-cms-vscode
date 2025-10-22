import { workspace } from 'vscode';
import * as dayjs from 'dayjs';

export const getRootPath = () => {
  const workspaceFolders = workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length < 1) {
    return;
  }
  return workspaceFolders[0].uri.fsPath;
};

export const getDayJsHasDatePassed = (date: string): boolean => {
  return dayjs().isAfter(date);
};

export const getDayjsDateFromNow = (days: number): string => {
  return dayjs().add(days, 'day').toISOString();
};
