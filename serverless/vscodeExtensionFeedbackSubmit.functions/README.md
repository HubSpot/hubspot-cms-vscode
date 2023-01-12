## VSCode Extension Feedback Submission Serverless Function

This function supports the feedback submission form within the HubSpot VSCode Extension ([hubspot-cms-vscode](https://github.com/HubSpot/hubspot-cms-vscode)). The function takes in a JSON object containing the user's feedback and submits it to a HubDB table.

#### Setup

1. Create the hubdb table using `npm run hubdb:table:create`
2. Add the necessary environment variables to the function

- `hs secrets add VSCODE_EXTENSION_FEEDBACK_HUBDB_TABLE_NAME --portal=<portalId>`
  - Value should be `vscode_extension_feedback_form_submissions`
- `hs secrets add VSCODE_EXTENSION_FEEDBACK_ACCESS_TOKEN --portal=<portalId>`
  - Value should be a private app token. This token should have access to `hubdb`. [More info about private apps](https://developers.hubspot.com/docs/api/private-apps)

3. Upload the function using `npm run upload`
4. Deploy the function using `npm run deploy`

#### Testing

Put your environment variables into `./serverless/vscodeExtensionFeedbackSubmit.functions/.env` and run the function locally using `npm run localserver`.
