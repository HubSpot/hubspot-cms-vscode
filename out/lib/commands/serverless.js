"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const fileHelpers_1 = require("../fileHelpers");
const path_1 = require("path");
const tracking_1 = require("../tracking");
const findup = require('findup-sync');
const { createFunction } = require('@hubspot/local-dev-lib/cms/functions');
const registerCommands = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CREATE.SERVERLESS_FUNCTION, (0, fileHelpers_1.onClickCreateFile)('js', (filePath) => {
        if (!new RegExp('(.*).functions(.*)').test(filePath)) {
            vscode_1.window.showErrorMessage('Could not find parent .functions folder!');
            return;
        }
        const functionsFolderPath = findup('*.functions', {
            cwd: (0, path_1.join)(filePath, '..'),
            nocase: true,
        });
        const functionsFolderDest = (0, path_1.dirname)(functionsFolderPath);
        const functionsFolderName = (0, path_1.basename)(functionsFolderPath);
        const functionFileName = filePath.slice(functionsFolderPath.length + 1);
        createFunction({
            functionsFolder: functionsFolderName,
            filename: functionFileName,
            endpointPath: functionFileName.slice(0, -3),
            endpointMethod: 'GET',
        }, functionsFolderDest, {
            allowExistingFile: true,
        });
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.CREATE.SERVERLESS_FUNCTION);
    })));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CREATE.SERVERLESS_FUNCTION_FOLDER, (0, fileHelpers_1.onClickCreateFolder)('functions', (folderPath) => {
        const { dir, base } = (0, path_1.parse)(folderPath);
        if (new RegExp('(.*).functions(.*)').test(dir)) {
            vscode_1.window.showErrorMessage('Cannot create functions folder within another functions folder!');
            return;
        }
        createFunction({
            functionsFolder: base,
            filename: 'serverless',
            endpointPath: 'serverless',
            endpointMethod: 'GET',
        }, dir);
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.CREATE.SERVERLESS_FUNCTION_FOLDER);
    })));
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=serverless.js.map