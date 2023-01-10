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
