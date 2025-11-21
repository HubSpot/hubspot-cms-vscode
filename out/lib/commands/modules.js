"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const fileHelpers_1 = require("../fileHelpers");
const tracking_1 = require("../tracking");
const path = require('path');
const { createModule } = require('@hubspot/local-dev-lib/cms/modules');
const registerCommands = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CREATE.MODULE, (0, fileHelpers_1.onClickCreateFolder)('module', async (folderPath) => {
        const { dir, base } = path.parse(folderPath);
        await createModule({
            moduleLabel: '',
            contentTypes: [],
            global: false,
        }, base, dir, false, { allowExistingDir: true });
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.CREATE.MODULE);
    })));
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=modules.js.map