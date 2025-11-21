"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const vscode_1 = require("vscode");
const dayjs = require("dayjs");
const constants_1 = require("../constants");
const registerCommands = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand(constants_1.COMMANDS.GLOBAL_STATE.UPDATE_DELAY, async (variableToUpdate, delayNumber, delayUnitName) => {
        const newDelayDate = dayjs()
            .add(delayNumber, delayUnitName)
            .toISOString();
        console.log(`Updating ${variableToUpdate} to ${newDelayDate}`);
        context.globalState.update(variableToUpdate, newDelayDate);
    }));
};
exports.registerCommands = registerCommands;
//# sourceMappingURL=globalState.js.map