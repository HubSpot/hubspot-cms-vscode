"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const account_1 = require("./commands/account");
const auth_1 = require("./commands/auth");
const config_1 = require("./commands/config");
const globalState_1 = require("./commands/globalState");
const modules_1 = require("./commands/modules");
const notifications_1 = require("./commands/notifications");
const serverless_1 = require("./commands/serverless");
const templates_1 = require("./commands/templates");
const terminal_1 = require("./commands/terminal");
const remoteFs_1 = require("./commands/remoteFs");
const registerCommands = (context, rootPath) => {
    if (rootPath) {
        (0, auth_1.registerCommands)(context, rootPath);
    }
    (0, account_1.registerCommands)(context);
    (0, config_1.registerCommands)(context);
    (0, globalState_1.registerCommands)(context);
    (0, modules_1.registerCommands)(context);
    (0, notifications_1.registerCommands)(context);
    (0, serverless_1.registerCommands)(context);
    (0, templates_1.registerCommands)(context);
    (0, terminal_1.registerCommands)(context);
    (0, remoteFs_1.registerCommands)(context);
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=commands.js.map