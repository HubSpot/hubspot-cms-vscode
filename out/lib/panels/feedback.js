"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackPanel = void 0;
const vscode_1 = require("vscode");
const node_fetch_1 = require("node-fetch");
const utilities_1 = require("../utilities");
const tracking_1 = require("../tracking");
const constants_1 = require("../constants");
// This comes from the base example https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/default/hello-world
/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering FeedbackPanel webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
class FeedbackPanel {
    /**
     * The FeedbackPanel class private constructor (called only from the render method).
     *
     * @param panel A reference to the webview panel
     * @param extensionUri The URI of the directory containing the extension
     */
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
        // the panel or when the panel is closed programmatically)
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Set the HTML content for the webview panel
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        // Set an event listener to listen for messages passed from the webview context
        this._setWebviewMessageListener(this._panel.webview);
    }
    /**
     * Renders the current webview panel if it exists otherwise a new webview panel
     * will be created and displayed.
     *
     * @param extensionUri The URI of the directory containing the extension.
     */
    static render(extensionUri) {
        if (FeedbackPanel.currentPanel) {
            // If the webview panel already exists reveal it
            FeedbackPanel.currentPanel._panel.reveal(vscode_1.ViewColumn.One);
        }
        else {
            // If a webview panel does not already exist create and show a new one
            const panel = vscode_1.window.createWebviewPanel(
            // Panel view type
            'feedbackPanel', 
            // Panel title
            'HubSpot VSCode Extension Feedback', 
            // The editor column the panel should be displayed in
            vscode_1.ViewColumn.One, 
            // Extra panel configurations
            {
                // Enable JavaScript in the webview
                enableScripts: true,
            });
            FeedbackPanel.currentPanel = new FeedbackPanel(panel, extensionUri);
        }
    }
    /**
     * Cleans up and disposes of webview resources when the webview panel is closed.
     */
    dispose() {
        FeedbackPanel.currentPanel = undefined;
        // Dispose of the current webview panel
        this._panel.dispose();
        // Dispose of all disposables (i.e. commands) for the current webview panel
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    /**
     * Defines and returns the HTML that should be rendered within the webview panel.
     *
     * @remarks This is also the place where references to CSS and JavaScript files/packages
     * (such as the Webview UI Toolkit) are created and inserted into the webview HTML.
     *
     * @param webview A reference to the extension webview
     * @param extensionUri The URI of the directory containing the extension
     * @returns A template string literal containing the HTML that should be
     * rendered within the webview panel
     */
    _getWebviewContent(webview, extensionUri) {
        const mainUri = (0, utilities_1.getUri)(webview, extensionUri, [
            'webview-ui',
            'js',
            'feedback-form.js',
        ]);
        const stylesheetUri = (0, utilities_1.getUri)(webview, extensionUri, [
            'webview-ui',
            'css',
            'styles.css',
        ]);
        const userIdentificationInformation = (0, tracking_1.getUserIdentificationInformation)();
        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.FEEDBACK.FEEDBACK_PANEL_OPENED);
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="${stylesheetUri}" />
          <script type="module" src="${mainUri}"></script>
          <title>HubSpot VSCode Extension Feedback</title>
        </head>
        <body>
          <h1>HubSpot VSCode Extension Feedback</h1>
          <div class="description">
            <h3>
              Thank you for taking the time to provide feedback on the HubSpot VSCode Extension.
            </h3>
          </div>
          <form id="feedback-form" enctype="multipart/form-data">
            <div class="form-field hidden">
                <label>Visual Studio Code Version</label><br />
                <input name="vsCodeVersion" type="hidden" value="${userIdentificationInformation.vscodeVersion}" readonly>
            </div>
            <div class="form-field hidden">
                <label>HubSpot Extension Version</label><br />
                <input name="extensionVersion" type="hidden" value="${userIdentificationInformation.version}" readonly>
            </div>
            <div class="form-field hidden">
                <label>Machine ID</label><br />
                <input name="machineId" type="hidden" value="${userIdentificationInformation.machineId}" readonly>
            </div>
            <div class="form-field hidden">
                <label>OS</label><br />
                <input name="operatingSystem" type="hidden" value="${userIdentificationInformation.os}" readonly>
            </div>
            <div class="form-field hidden">
                <label>Shell</label><br />
                <input name="shell" type="hidden" value="${userIdentificationInformation.shell}" readonly>
            </div>
            <div class="form-field hidden">
                <label>Language</label><br />
                <input name="language" type="hidden" value="${userIdentificationInformation.language}" readonly>
            </div>
            <div class="form-field">
                <label>Rate your experience with this developer tool</label>
                <div class="radio-group">
                    <div class="radio">
                        <input name="experienceRating" id="experience-1" value="1" type="radio">
                        <label for="experience-1">1</label>
                    </div>
                    <div class="radio">
                        <input name="experienceRating" id="experience-2" value="2" type="radio">
                        <label for="experience-2">2</label>
                    </div>
                    <div class="radio">
                        <input name="experienceRating" id="experience-3" value="3" type="radio">
                        <label for="experience-3">3</label>
                    </div>
                    <div class="radio">
                        <input name="experienceRating" id="experience-4" value="4" type="radio">
                        <label for="experience-4">4</label>
                    </div>
                    <div class="radio">
                        <input name="experienceRating" id="experience-5" value="5" type="radio">
                        <label for="experience-5">5</label>
                    </div>
                </div>
            </div>
            <div class="form-field">
                <label for="reason-for-rating">Why did you choose this rating?</label><br />
                <textarea type="textarea" name="reasonForRating" id="reason-for-rating" maxlength="10000"></textarea>
            </div>

            <div>
              <h3>May we contact you for questions? If so, please provide your name and email.</h3>
              <div class="form-field">
                  <label for="name">Full Name</label><br />
                  <input type="text" name="name" id="name" maxlength="250">
              </div>
              <div class="form-field">
                  <label for="email">Email</label><br />
                  <input type="email" name="email" id="email" maxlength="250">
              </div>
            </div>
            <button type="submit">Submit</button>
        </form>
        </body>
      </html>
    `;
    }
    /**
     * Sets up an event listener to listen for messages passed from the webview context and
     * executes code based on the message that is recieved.
     *
     * @param webview A reference to the extension webview
     * @param context A reference to the extension context
     */
    _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage(async (message) => {
            const { command, data, errorMessage } = message;
            switch (command) {
                case 'submit':
                    try {
                        this._panel.dispose();
                        const postResp = await (0, node_fetch_1.default)('https://api.hubspot.com/cms/vs-code-extension-feedback/v1/feedback', {
                            method: 'post',
                            body: JSON.stringify(data),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        if (postResp.status === 204) {
                            // Delay showing the message again for 90 days when the form has
                            // been filled out
                            vscode_1.commands.executeCommand(constants_1.COMMANDS.GLOBAL_STATE.UPDATE_DELAY, constants_1.GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL, 90, 'day');
                            (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.FEEDBACK.FEEDBACK_PANEL_SUBMITTED);
                            vscode_1.window.showInformationMessage('Feedback submitted! Thank you!');
                            return;
                        }
                        console.log('Error: ', postResp.statusText);
                        vscode_1.window.showErrorMessage('There was an error submitting your feedback. Please try again later.');
                        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.FEEDBACK.FEEDBACK_PANEL_ERROR, {
                            error: postResp.statusText,
                        });
                        return;
                    }
                    catch (err) {
                        const errorMessage = err && err.response && err.response.data;
                        console.log('Error: ', errorMessage);
                        vscode_1.window.showErrorMessage('There was an error submitting your feedback. Please try again later.');
                        (0, tracking_1.trackEvent)(constants_1.TRACKED_EVENTS.FEEDBACK.FEEDBACK_PANEL_ERROR, {
                            error: errorMessage,
                        });
                        return;
                    }
                case 'submit-error':
                    vscode_1.window.showErrorMessage(errorMessage);
                    return;
            }
        }, undefined, this._disposables);
    }
}
exports.FeedbackPanel = FeedbackPanel;
//# sourceMappingURL=feedback.js.map