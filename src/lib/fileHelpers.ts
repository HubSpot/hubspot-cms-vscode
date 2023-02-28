import {
  commands,
  workspace,
  FileCreateEvent,
  FileWillCreateEvent,
  Uri,
  WorkspaceEdit,
} from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/*
 * Returns a non-duplicate folder/file name with the format <name>.<extension>
 * It will add a number to the end of the name if it already exists
 * @param path - path of folder/file
 * @param extension - name of extension
 */
export const getUniquePathName = (folderPath: string, extension: string) => {
  const folderName = folderPath.split(path.sep).pop() || '';
  const hasExtension = folderName.split('.').pop() === extension;
  let newFolderPath = hasExtension ? folderPath : `${folderPath}.${extension}`;
  let uniqueFolderPath = newFolderPath;
  if (!hasExtension) {
    let incrementor = 0;
    // Add incremental number to folder name if it already exists
    while (fs.existsSync(uniqueFolderPath)) {
      incrementor++;
      const folderPathParts = newFolderPath.split('.');
      folderPathParts.pop();
      uniqueFolderPath = `${folderPathParts.join(
        '.'
      )}${incrementor}.${extension}`;
    }
  }
  return uniqueFolderPath;
};

// returns a listener that deletes the created file and then allows a given callback to run
// doAfter receives unique filepath with the given extension
// ex: extension given is "html", user types "example", but "example.html" already exists. doAfter receives "example1.html"
const buildFileCreateListener = (
  extension: string,
  folderPath: string,
  doAfter: Function,
  cleanupCallback: Function
) => {
  return async (e: FileCreateEvent) => {
    if (
      e.files?.length === 1 &&
      e.files[0].fsPath.startsWith(folderPath)
    ) {
      cleanupCallback();
      const uniqueFilePath = getUniquePathName(e.files[0].fsPath, extension);
      if (e.files[0].fsPath !== uniqueFilePath) {
        const edit = new WorkspaceEdit();
        edit.renameFile(e.files[0], Uri.file(uniqueFilePath));
        await workspace.applyEdit(edit);
      }
      await doAfter(uniqueFilePath);
    }
  };
};

// doAfter receives (filepath: string)
export const onClickCreateFile = (extension: string, doAfter: Function) => {
  return (clickContext: any) => {
    if (clickContext.scheme === 'file') {
      const createFileSubscription = workspace.onDidCreateFiles(
        buildFileCreateListener(extension, clickContext.fsPath, doAfter, () =>
          createFileSubscription.dispose()
        )
      );
      commands.executeCommand('explorer.newFile');
    }
  };
};

const buildFolderCreateListener = (
  extension: string,
  folderPath: string,
  doAfter: Function,
  cleanupCallback: Function
) => {
  return (e: FileWillCreateEvent) => {
    return e.waitUntil(
      new Promise((resolve, reject) => {
        try {
          const edit = new WorkspaceEdit();

          if (
            e.files?.length === 1 &&
            e.files[0].fsPath.startsWith(folderPath)
          ) {
            cleanupCallback();
            const uniqueFolderPath = getUniquePathName(
              e.files[0].fsPath,
              extension
            );

            edit.renameFile(e.files[0], Uri.file(uniqueFolderPath));

            workspace.applyEdit(edit).then(async () => {
              await doAfter(uniqueFolderPath);
              resolve(edit);
            });
          }
          reject(edit);
        } catch (e: any) {
          reject(e);
        }
      })
    );
  };
};

export const onClickCreateFolder = (extension: string, doAfter: Function) => {
  return (clickContext: any) => {
    if (clickContext.scheme === 'file') {
      const createFileSubscription = workspace.onWillCreateFiles(
        buildFolderCreateListener(extension, clickContext.fsPath, doAfter, () =>
          createFileSubscription.dispose()
        )
      );
      commands.executeCommand('explorer.newFolder');
    }
  };
};
