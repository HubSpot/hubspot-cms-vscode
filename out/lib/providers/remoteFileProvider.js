"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteFileProvider = void 0;
const vscode_1 = require("vscode");
const fileMapper_1 = require("@hubspot/local-dev-lib/api/fileMapper");
const config_1 = require("@hubspot/local-dev-lib/config");
const helpers_1 = require("../helpers");
exports.RemoteFileProvider = new (class {
    constructor() {
        this.onDidChangeEmitter = new vscode_1.EventEmitter();
        this.onDidChange = this.onDidChangeEmitter.event;
    }
    async provideTextDocumentContent(uri) {
        (0, helpers_1.requireAccountId)();
        const filepath = uri.toString().split(':')[1];
        // filepath must be de-encoded since it gets reencoded by download in cli-lib
        const decodedFilePath = decodeURIComponent(filepath);
        try {
            const { data: file } = await (0, fileMapper_1.download)((0, config_1.getAccountId)(), decodedFilePath);
            return `[[ READONLY: @remote/${decodedFilePath} ]]\n` + file.source;
        }
        catch (e) {
            console.log(e);
        }
    }
})();
//# sourceMappingURL=remoteFileProvider.js.map