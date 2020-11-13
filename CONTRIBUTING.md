# Contributing
Anyone should feel free to fork/PR this. Open source for the win!
Please make sure and explain your changes thoroughly, update version and changelog where needed.

_Note_: HubL tags, functions, expression tests and filters are all pulled from the `cos-rendering/v1/hubldoc` api, so do not update any `snippets/auto-gen/...` json files manually. Run `npm run generate` to re-generate these JSON files when HubL changes occur. `snippets/man_gen/...` files are for any extra/helpful snippets used in HubL - these files are maintained manually.

### To run this extension locally:
- `git clone` repo
- Open this project in Visual Studio Code
- Press `f5` to launch a new VSCode window with the extension installed
- Press `CMD` + `R` to reload the window after having made any changes

### Debugging
Debugging grammar scopes can be done line-by-line using the [VSCode scope inspector](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide#scope-inspector).

### Publishing
_Note: In order to publish you'll need to be added as a user in the HubSpot Azure Devops organization_

- Install the [vsce](https://github.com/microsoft/vscode-vsce) command line tool
- Create a [personal access token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token)
- Run `vsce login HubSpot` (case sensitive)
- Ensure that you've checked out the lastest work on the `master` branch
- Run `vsce publish minor`, which will increment the version number in `package.json` and publish the extension to the VS Code Marketplace

### VSCode Extension Links
Configuration
 - [Contribution points](https://code.visualstudio.com/api/references/contribution-points)
 - [Activation events](https://code.visualstudio.com/api/references/activation-events)
