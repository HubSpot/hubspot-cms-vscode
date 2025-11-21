"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instanceOfCommand = exports.instanceOfLink = void 0;
function instanceOfLink(object) {
    return 'url' in object;
}
exports.instanceOfLink = instanceOfLink;
function instanceOfCommand(object) {
    return 'title' in object && 'command' in object;
}
exports.instanceOfCommand = instanceOfCommand;
//# sourceMappingURL=types.js.map