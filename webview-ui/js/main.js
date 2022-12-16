// eslint-disable-next-line no-undef
const webviewWindow = window;
const vscode = webviewWindow.acquireVsCodeApi();

function handleSubmitClick(e) {
  e.preventDefault();

  // Handle form data submission here

  vscode.postMessage({
    command: 'submit',
    text: 'Thanks for submitting your feedback!',
  });
}

function main() {
  const feedbackForm = webviewWindow.document.getElementById('feedback-form');

  feedbackForm.addEventListener('submit', handleSubmitClick);
}

webviewWindow.addEventListener('load', main);
