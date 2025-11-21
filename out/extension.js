"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const helpers_1 = require("./lib/helpers");
const constants_1 = require("./lib/constants");
const commands_1 = require("./lib/commands");
const events_1 = require("./lib/events");
const uri_1 = require("./lib/uri");
const logger_1 = require("./lib/logger");
const statusBar_1 = require("./lib/statusBar");
const providers_1 = require("./lib/providers");
const auth_1 = require("./lib/auth");
const terminal_1 = require("./lib/terminal");
const panels_1 = require("./lib/panels");
const tracking_1 = require("./lib/tracking");
const globalState_1 = require("./lib/globalState");
const autoDetect_1 = require("./lib/autoDetect");
const projectConfigValidation_1 = require("./lib/projectConfigValidation");
const activate = async (context) => {
    (0, logger_1.initializeCliLibLogger)();
    await (0, tracking_1.initializeTracking)(context);
    await (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.ACTIVATE);
    console.log('Activating Extension Version: ', context.extension.packageJSON.version);
    const rootPath = (0, helpers_1.getRootPath)();
    (0, commands_1.registerCommands)(context, rootPath);
    (0, events_1.registerEvents)(context);
    (0, uri_1.registerURIHandler)(context);
    (0, globalState_1.initializeGlobalState)(context);
    (0, providers_1.initializeProviders)(context);
    (0, panels_1.initializePanels)(context);
    (0, terminal_1.initializeTerminal)();
    (0, statusBar_1.initializeStatusBar)(context);
    (0, autoDetect_1.initializeHubLAutoDetect)(context);
    (0, projectConfigValidation_1.initializeProjectConfigValidation)(context);
    if (rootPath) {
        (0, auth_1.initializeConfig)(rootPath);
    }
};
exports.activate = activate;
//# sourceMappingURL=extension.js.map