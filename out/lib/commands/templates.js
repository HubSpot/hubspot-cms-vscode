"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const fileHelpers_1 = require("../fileHelpers");
const path_1 = require("path");
const tracking_1 = require("../tracking");
const { createTemplate } = require('@hubspot/local-dev-lib/cms/templates');
const registerCommands = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CREATE.SECTION, (0, fileHelpers_1.onClickCreateFile)('html', async (uniqueFilePath) => {
        await createTemplate((0, path_1.basename)(uniqueFilePath), (0, path_1.dirname)(uniqueFilePath), constants_1.TEMPLATE_NAMES.SECTION, { allowExisting: true });
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.CREATE.SECTION);
    })));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CREATE.TEMPLATE, (0, fileHelpers_1.onClickCreateFile)('html', async (uniqueFilePath) => {
        await createTemplate((0, path_1.basename)(uniqueFilePath), (0, path_1.dirname)(uniqueFilePath), constants_1.TEMPLATE_NAMES.TEMPLATE, { allowExisting: true });
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.CREATE.TEMPLATE);
    })));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CREATE.PARTIAL, (0, fileHelpers_1.onClickCreateFile)('html', async (uniqueFilePath) => {
        await createTemplate((0, path_1.basename)(uniqueFilePath), (0, path_1.dirname)(uniqueFilePath), constants_1.TEMPLATE_NAMES.PARTIAL, { allowExisting: true });
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.CREATE.PARTIAL);
    })));
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.CREATE.GLOBAL_PARTIAL, (0, fileHelpers_1.onClickCreateFile)('html', async (uniqueFilePath) => {
        await createTemplate((0, path_1.basename)(uniqueFilePath), (0, path_1.dirname)(uniqueFilePath), constants_1.TEMPLATE_NAMES.GLOBAL_PARTIAL, { allowExisting: true });
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.CREATE.GLOBAL_PARTIAL);
    })));
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=templates.js.map