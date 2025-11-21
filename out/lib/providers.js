"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeProviders = void 0;
const vscode_1 = require("vscode");
const fileCompletion_1 = require("./providers/fileCompletion");
const constants_1 = require("./constants");
const accounts_1 = require("./providers/treedata/accounts");
const helpAndFeedback_1 = require("./providers/treedata/helpAndFeedback");
const remoteFileProvider_1 = require("./providers/remoteFileProvider");
const remoteFsProvider_1 = require("./providers/remoteFsProvider");
const initializeTreeDataProviders = (context) => {
    const accountProvider = new accounts_1.AccountsProvider();
    const fileCompletionProvider = new fileCompletion_1.FileCompletionProvider();
    const helpAndFeedbackProvider = new helpAndFeedback_1.HelpAndFeedbackProvider();
    const remoteFsProvider = new remoteFsProvider_1.RemoteFsProvider();
    const remoteFileProvider = remoteFileProvider_1.RemoteFileProvider;
    const scheme = 'hubl';
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.ACCOUNTS_REFRESH, () => {
        console.log(constants_1.COMMANDS.ACCOUNTS_REFRESH);
        accountProvider.refresh();
    }));
    context.subscriptions.push(vscode_1.workspace.registerTextDocumentContentProvider(scheme, remoteFileProvider));
    vscode_1.languages.registerCompletionItemProvider('html-hubl', fileCompletionProvider, "'", '"');
    vscode_1.window.registerTreeDataProvider(constants_1.TREE_DATA.ACCOUNTS, accountProvider);
    vscode_1.window.registerTreeDataProvider(constants_1.TREE_DATA.HELP_AND_FEEDBACK, helpAndFeedbackProvider);
    vscode_1.window.registerTreeDataProvider(constants_1.TREE_DATA.REMOTE, remoteFsProvider);
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.REMOTE_FS.REFRESH, () => {
        console.log(constants_1.COMMANDS.REMOTE_FS.REFRESH);
        remoteFsProvider.refresh();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.REMOTE_FS.HARD_REFRESH, () => {
        console.log(constants_1.COMMANDS.REMOTE_FS.HARD_REFRESH);
        remoteFsProvider.hardRefresh();
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.REMOTE_FS.INVALIDATE_CACHE, (filePath) => {
        console.log(constants_1.COMMANDS.REMOTE_FS.INVALIDATE_CACHE);
        remoteFsProvider.invalidateCache(filePath);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.REMOTE_FS.START_WATCH, (srcPath, destPath, filesToUpload) => {
        console.log(constants_1.COMMANDS.REMOTE_FS.START_WATCH);
        remoteFsProvider.changeWatch(srcPath, destPath, filesToUpload);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.REMOTE_FS.END_WATCH, () => {
        console.log(constants_1.COMMANDS.REMOTE_FS.END_WATCH);
        remoteFsProvider.endWatch();
    }));
};
const initializeProviders = (context) => {
    initializeTreeDataProviders(context);
};
exports.initializeProviders = initializeProviders;
//# sourceMappingURL=providers.js.map