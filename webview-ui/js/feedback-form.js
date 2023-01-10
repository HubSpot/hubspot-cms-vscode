// eslint-disable-next-line no-undef
const webviewWindow = window;
const vscode = webviewWindow.acquireVsCodeApi();

function handleSubmitClick(e) {
  e.preventDefault();

  // Handle form data submission here
  const disabledInputs = e.target.querySelectorAll('input[disabled]');

  // Set all inputs to enabled to allow FormData to include any disabled inputs
  disabledInputs.forEach((input) => {
    input.disabled = false;
  });
  const formData = new webviewWindow.FormData(e.target);
  const formDataEntries = Object.fromEntries(formData.entries());

  if (
    !Object.prototype.hasOwnProperty.call(formDataEntries, 'experience-rating')
  ) {
    vscode.postMessage({
      command: 'submit-error',
      errorMessage: 'Please select an experience rating.',
    });
    return;
  }

  vscode.postMessage({
    command: 'submit',
    data: formDataEntries,
  });
}

function main() {
  const feedbackForm = webviewWindow.document.getElementById('feedback-form');

  feedbackForm.addEventListener('submit', handleSubmitClick);
}

webviewWindow.addEventListener('load', main);
