## VSCode Extension Feedback Submission Serverless Function

This function supports the feedback submission form within the HubSpot VSCode Extension ([hubspot-cms-vscode]()). The function takes in a JSON object containing the user's feedback and submits it to a HubDB table as well as creating a JSON file with the data as its contents and placing it inton an S3 bucket.

#### Setup

1. Create the hubdb table using `hs hubdb create ./serverless/vscodeExtensionFeedbackSubmit.functions/vscode-extension-feedback-hubdb-table.json --portal=<portalId>`
2. Add the necessary environment variables to the function

- `hs secrets add VSCODE_EXTENSION_FEEDBACK_HUBDB_TABLE_NAME --portal=<portalId>`
  - Value should be `vscode_extension_feedback_form_submissions`
- `hs secrets add VSCODE_EXTENSION_FEEDBACK_S3_BUCKET_NAME --portal=<portalId>`
  - Value should be `hubspot-cms-vscode-feedback-na1`
- `hs secrets add VSCODE_EXTENSION_FEEDBACK_ACCESS_TOKEN --portal=<portalId>`
  - Value should be a private app token. This token should have access to `hubdb`. [More info about private apps](https://developers.hubspot.com/docs/api/private-apps)

3. Upload the function using `hs upload ./serverless/vscodeExtensionFeedbackSubmit.functions vscodeExtensionFeedbackSubmit.functions --portal=<portalId>`
4. Deploy the function using `hs functions deploy vscodeExtensionFeedbackSubmit.functions --portal=<portalId>`

#### Testing

Put your environment variables into `./serverless/vscodeExtensionFeedbackSubmit.functions/.env` and run the function locally using `hs functions server ./serverless/vscodeExtensionFeedbackSubmit.functions --log-output --portal=<portalId>`.
