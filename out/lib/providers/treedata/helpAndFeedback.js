"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandTreeItem = exports.UrlLinkTreeItem = exports.HelpAndFeedbackProvider = void 0;
const vscode_1 = require("vscode");
const types_1 = require("../../types");
const constants_1 = require("../../constants");
class HelpAndFeedbackProvider {
    getTreeItem(q) {
        if ((0, types_1.instanceOfCommand)(q)) {
            return new CommandTreeItem(q);
        }
        else if ((0, types_1.instanceOfLink)(q)) {
            return new UrlLinkTreeItem(q.label, vscode_1.Uri.parse(q.url));
        }
        else {
            throw new Error('Invalid tree item passed to HelpAndFeedbackProvider');
        }
    }
    getChildren() {
        return Promise.resolve([
            {
                label: 'Get started with HubSpot development',
                url: 'https://developers.hubspot.com/docs/getting-started/quickstart',
            },
            {
                label: 'CLI Documentation',
                url: 'https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli#interacting-with-the-developer-file-system',
            },
            {
                label: 'Report issue',
                url: 'https://github.com/HubSpot/hubspot-cms-vscode/issues/new?assignees=&labels=bug&template=bug_report.md&title=',
            },
            {
                label: 'Rate the extension',
                url: 'https://marketplace.visualstudio.com/items?itemName=hubspot.hubl&ssr=false#review-details',
            },
            {
                label: 'About HubSpot VSCode Extension',
                url: 'https://github.com/HubSpot/hubspot-cms-vscode/blob/master/README.md',
            },
            {
                title: 'Submit feedback',
                command: constants_1.COMMANDS.PANELS.OPEN_FEEDBACK_PANEL,
            },
        ]);
    }
}
exports.HelpAndFeedbackProvider = HelpAndFeedbackProvider;
class UrlLinkTreeItem extends vscode_1.TreeItem {
    constructor(label, resourceUri) {
        super(label, vscode_1.TreeItemCollapsibleState.None);
        this.label = label;
        this.resourceUri = resourceUri;
        this.tooltip = `Open link: ${resourceUri.toString()}`;
        this.iconPath = new vscode_1.ThemeIcon('link-external');
        this.contextValue = 'url-link-tree-item';
        this.command = {
            command: 'vscode.open',
            title: '',
            arguments: [resourceUri],
        };
    }
}
exports.UrlLinkTreeItem = UrlLinkTreeItem;
class CommandTreeItem extends vscode_1.TreeItem {
    constructor(command) {
        super(command.title, vscode_1.TreeItemCollapsibleState.None);
        this.command = command;
        this.tooltip = `Open ${command.title}`;
        this.iconPath = new vscode_1.ThemeIcon('file');
        this.contextValue = 'command-tree-item';
        this.command = command;
    }
}
exports.CommandTreeItem = CommandTreeItem;
//# sourceMappingURL=helpAndFeedback.js.map