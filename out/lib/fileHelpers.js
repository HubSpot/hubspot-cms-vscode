"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dirname = exports.doesFileExist = exports.onClickCreateFolder = exports.onClickCreateFile = exports.getUniquePathName = void 0;
const vscode_1 = require("vscode");
const path = require("path");
const fs = require("fs");
/*
 * Returns a non-duplicate folder/file name with the format <name>.<extension>
 * It will add a number to the end of the name if it already exists
 * @param path - path of folder/file
 * @param extension - name of extension
 */
const getUniquePathName = (folderPath, extension) => {
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
            uniqueFolderPath = `${folderPathParts.join('.')}${incrementor}.${extension}`;
        }
    }
    return uniqueFolderPath;
};
exports.getUniquePathName = getUniquePathName;
// returns a listener that deletes the created file and then allows a given callback to run
// doAfter receives unique filepath with the given extension
// ex: extension given is "html", user types "example", but "example.html" already exists. doAfter receives "example1.html"
const buildFileCreateListener = (extension, folderPath, doAfter, cleanupCallback) => {
    return async (e) => {
        var _a;
        if (((_a = e.files) === null || _a === void 0 ? void 0 : _a.length) === 1 && e.files[0].fsPath.startsWith(folderPath)) {
            cleanupCallback();
            const uniqueFilePath = (0, exports.getUniquePathName)(e.files[0].fsPath, extension);
            if (e.files[0].fsPath !== uniqueFilePath) {
                const edit = new vscode_1.WorkspaceEdit();
                edit.renameFile(e.files[0], vscode_1.Uri.file(uniqueFilePath));
                await vscode_1.workspace.applyEdit(edit);
            }
            await doAfter(uniqueFilePath);
        }
    };
};
// doAfter receives (filepath: string)
const onClickCreateFile = (extension, doAfter) => {
    return (clickContext) => {
        if (clickContext.scheme === 'file') {
            const createFileSubscription = vscode_1.workspace.onDidCreateFiles(buildFileCreateListener(extension, clickContext.fsPath, doAfter, () => createFileSubscription.dispose()));
            vscode_1.commands.executeCommand('explorer.newFile');
        }
    };
};
exports.onClickCreateFile = onClickCreateFile;
const buildFolderCreateListener = (extension, folderPath, doAfter, cleanupCallback) => {
    return (e) => {
        return e.waitUntil(new Promise((resolve, reject) => {
            var _a;
            try {
                const edit = new vscode_1.WorkspaceEdit();
                if (((_a = e.files) === null || _a === void 0 ? void 0 : _a.length) === 1 &&
                    e.files[0].fsPath.startsWith(folderPath)) {
                    cleanupCallback();
                    const uniqueFolderPath = (0, exports.getUniquePathName)(e.files[0].fsPath, extension);
                    edit.renameFile(e.files[0], vscode_1.Uri.file(uniqueFolderPath));
                    vscode_1.workspace.applyEdit(edit).then(async () => {
                        await doAfter(uniqueFolderPath);
                        resolve(edit);
                    });
                }
                reject(edit);
            }
            catch (e) {
                reject(e);
            }
        }));
    };
};
const onClickCreateFolder = (extension, doAfter) => {
    return (clickContext) => {
        if (clickContext.scheme === 'file') {
            const createFileSubscription = vscode_1.workspace.onWillCreateFiles(buildFolderCreateListener(extension, clickContext.fsPath, doAfter, () => createFileSubscription.dispose()));
            vscode_1.commands.executeCommand('explorer.newFolder');
        }
    };
};
exports.onClickCreateFolder = onClickCreateFolder;
async function doesFileExist(uri) {
    try {
        await vscode_1.workspace.fs.stat(uri);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.doesFileExist = doesFileExist;
// VSCode doesn't provide a dirname function, that's in the github:/microsoft/vscode-uri package
function dirname(uri) {
    return uri.with({ path: path.dirname(uri.path) });
}
exports.dirname = dirname;
//# sourceMappingURL=fileHelpers.js.map