# HubL Visual Studio Code Language Extension
For :rocket: fast HubSpot CMS Hub development.

This extension currently supports:
- Syntax highlighting for the [HubL templating language](https://designers.hubspot.com/docs/hubl/intro-to-hubl)
- Autocomlete for common HubL tags, filters, and functions
- Bracket wrapping, indentation, and other helpful editor features

If you're new to CMS Hub, check out how to [get started with local development.](https://designers.hubspot.com/docs/tools/local-development)

## Features

### Syntax Highlighting
HubL syntax hightlighting is supported for `.HTML` and `.CSS` files. To enable syntax highlighting, make sure that your file type is set to `HTML + HUBL` or `CSS + HUBL`, respectively.

_Thanks to the [Better Jinja](https://github.com/samuelcolvin/jinjahtml-vscode) extension for inspiration._

### Editor Features
- Statement wrapping (Supports `{%%}`,`{##}`,`{{}}`)
- Block comment toggling: Press `CMD + /` to create HubL comments
- Block level indentation: Text inside of `{% block %}` will be indented automatically

### HubL Snippets
All HubL supported tags, filters, expression tests and functions have auto-complete snippets. Expression tests are accessed by typing the test name alone, filters are accessed with `|` and functions/tags are accessed with `~`. All snippets include descriptions and parameter details. You up/down arrow to navigate the IntelliSense and hit enter to execute a snippet. Snippet completed HubL statements will auto-highlight available parameters, which can be tabbed through (`${parameter}`). Additionally there is support for other commonly needed syntax, such as module fields.

## Getting Started
This extension introduces new file languages: `HTML + HUBL` and `HTML + CSS`. In order to use these new features, you'll want to make sure you're told VSCode to use these langauges. For one-off files, you can simple change the language in the lower right hand corner of your screen. However, we recommend adjusting your file associations under your User or Workspace preferences:
- In VSCode, press `CMD` + `SHIFT` + `P` to open the command prompt
- Search for and select the command `Preferences: Open Settings (UI)`
- Choose either the "User" or "Workspace" tab
- In "Search settings" look up `files.associations`
- Select "Add Item" and add these file associations:
    `*.html`:`html-hubl`
    `*.html`:`css-hubl`

For more information about how VSCode settings work, [check out the docs](https://code.visualstudio.com/docs/getstarted/settings).

_NOTE_: If you are having trouble getting IntelliSense suggestions when in snippet placeholders you may need to add the following to your [User Settings](https://code.visualstudio.com/docs/getstarted/settings) `"editor.suggest.snippetsPreventQuickSuggestions": false`. If parameter suggestions are not showing up, set `"editor.parameterHints": true`.

 ### Contributing
 For more information about contributing, see the [contributing docs](./CONTRIBUTING.md).
