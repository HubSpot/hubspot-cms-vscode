// eslint-disable-next-line no-undef
const webviewWindow = window;
const vscode = webviewWindow.acquireVsCodeApi();

function handleSubmitClick(e) {
  e.preventDefault();

  // Handle form data submission here
  console.log('e.target: ', e.target);
  const disabledInputs = e.target.querySelectorAll('input[disabled]');

  disabledInputs.forEach((input) => {
    input.disabled = false;
  });
  const formData = new webviewWindow.FormData(e.target);
  const formDataEntries = Object.fromEntries(formData.entries());
  console.log('formDataEntries: ', formDataEntries);

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
