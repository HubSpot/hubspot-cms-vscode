import {
  commands,
  window,
  Disposable,
  Uri,
  ViewColumn,
  Webview,
  WebviewPanel,
} from 'vscode';
import axios from 'axios';
import { getUri } from '../utilities';
import { getUserIdentificationInformation, trackEvent } from '../tracking';
import { COMMANDS, GLOBAL_STATE_KEYS, TRACKED_EVENTS } from '../constants';

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
export class FeedbackPanel {
  public static currentPanel: FeedbackPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  /**
   * The FeedbackPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri) {
    if (FeedbackPanel.currentPanel) {
      // If the webview panel already exists reveal it
      FeedbackPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        'feedbackPanel',
        // Panel title
        'HubSpot VSCode Extension Feedback',
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
        }
      );

      FeedbackPanel.currentPanel = new FeedbackPanel(panel, extensionUri);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
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
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const mainUri = getUri(webview, extensionUri, [
      'webview-ui',
      'js',
      'feedback-form.js',
    ]);
    const stylesheetUri = getUri(webview, extensionUri, [
      'webview-ui',
      'css',
      'styles.css',
    ]);
    const userIdentificationInformation = getUserIdentificationInformation();

    trackEvent(TRACKED_EVENTS.FEEDBACK.FEEDBACK_PANEL_OPENED);

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
                <input name="vs-code-version" type="hidden" value="${userIdentificationInformation.vscodeVersion}" readonly>
            </div>
            <div class="form-field hidden">
                <label>HubSpot Extension Version</label><br />
                <input name="hubspot-extension-version" type="hidden" value="${userIdentificationInformation.version}" readonly>
            </div>
            <div class="form-field hidden">
                <label>Machine ID</label><br />
                <input name="machine-id" type="hidden" value="${userIdentificationInformation.machineId}" readonly>
            </div>
            <div class="form-field hidden">
                <label>OS</label><br />
                <input name="operating-system" type="hidden" value="${userIdentificationInformation.os}" readonly>
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
                <div class="radio-group" style="display: flex">
                    <div class="radio">
                        <input name="experience-rating" id="experience-1" value="1" type="radio">
                        <label for="experience-1">1</label>
                    </div>
                    <div class="radio">
                        <input name="experience-rating" id="experience-2" value="2" type="radio">
                        <label for="experience-2">2</label>
                    </div>
                    <div class="radio">
                        <input name="experience-rating" id="experience-3" value="3" type="radio">
                        <label for="experience-3">3</label>
                    </div>
                    <div class="radio">
                        <input name="experience-rating" id="experience-4" value="4" type="radio">
                        <label for="experience-4">4</label>
                    </div>
                    <div class="radio">
                        <input name="experience-rating" id="experience-5" value="5" type="radio">
                        <label for="experience-5">5</label>
                    </div>
                    <div class="radio">
                        <input name="experience-rating" id="experience-6" value="6" type="radio">
                        <label for="experience-6">6</label>
                    </div>
                    <div class="radio">
                        <input name="experience-rating" id="experience-7" value="7" type="radio">
                        <label for="experience-7">7</label>
                    </div>
                    <div class="radio">
                        <input name="experience-rating" id="experience-8" value="8" type="radio">
                        <label for="experience-8">8</label>
                    </div>
                    <div class="radio">
                        <input name="experience-rating" id="experience-9" value="9" type="radio">
                        <label for="experience-9">9</label>
                    </div>
                    <div class="radio">
                        <input name="experience-rating" id="experience-10" value="10" type="radio">
                        <label for="experience-10">10</label>
                    </div>
                </div>
            </div>
            <div class="form-field">
                <label for="reason-for-rating">Why did you choose this rating?</label><br />
                <textarea type="textarea" name="reason-for-rating" id="reason"></textarea>
            </div>

            <div>
              <h3>May we contact you for questions? If so, please provide your name and email.</h3>
              <div class="form-field">
                  <label for="name">Full Name</label><br />
                  <input type="text" name="name" id="name">
              </div>
              <div class="form-field">
                  <label for="email">Email</label><br />
                  <input type="email" name="email" id="email">
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
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      async (message: any) => {
        const { command, data, errorMessage } = message;

        switch (command) {
          case 'submit':
            try {
              this._panel.dispose();
              await axios({
                method: 'post',
                url: 'https://23748177.hs-sites.com/_hcms/api/vscode/feedback/submit',
                data,
              });

              // Delay showing the message again for 90 days when the form has
              // been filled out
              commands.executeCommand(
                COMMANDS.GLOBAL_STATE.UPDATE_DELAY,
                GLOBAL_STATE_KEYS.DISMISS_FEEDBACK_INFO_MESSAGE_UNTIL,
                90,
                'day'
              );

              trackEvent(TRACKED_EVENTS.FEEDBACK.FEEDBACK_PANEL_SUBMITTED);

              window.showInformationMessage('Feedback submitted! Thank you!');

              return;
            } catch (err: any) {
              console.log('Error: ', err, err.response.data);
              window.showErrorMessage(
                'There was an error submitting your feedback. Please try again later.'
              );
              trackEvent(TRACKED_EVENTS.FEEDBACK.FEEDBACK_PANEL_ERROR, {
                error: err,
              });
              return;
            }
          case 'submit-error':
            window.showErrorMessage(errorMessage);
            return;
        }
      },
      undefined,
      this._disposables
    );
  }
}
