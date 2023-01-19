<h1 align="center">
  <br>
    <img src="https://github.com/HubSpot/hubspot-cms-vscode/blob/master/images/hubspot-logo.png?raw=true" alt="HubSpot Logo" width="150">
  <br>
  HubSpot for Visual Studio Code
  <br>
  <br>
</h1>

For fast HubSpot CMS Hub development right inside your editor.

The new HubSpot panel in the activity bar provides developers access to features such as syntax formatters and highlighting for the [HubL templating language](https://designers.hubspot.com/docs/hubl/intro-to-hubl), as well as autocomplete for common HubL tags, filters, and functions. Additionally, it provides developers with quick views and commands to manage their connected accounts with HubSpot, extending some of the functionality of the HubSpot command line interface into the editor directly.

<!-- TODO: Link 'HubSpot Developer Docs' text to CMS Dev Docs url when they are live -->
To read more about this extension and its features, please see the documentation at the HubSpot Developer Docs. If you're new to CMS Hub, check out [how to get started with local development](https://designers.hubspot.com/docs/tools/local-development).

## Settings

### Language Modes

This extension introduces new file languages: `HTML + HUBL` and `CSS + HUBL`. In order to use the full set of features from the extension, VS Code needs to be aware of these languages and how they are associated with various file types. For one-off files, you can simply change the Language Mode in the lower right hand status bar of the editor. However, we recommend adjusting your file associations under your User or Workspace preferences so HubL syntax highlighting will automatically be applied to all of your projects:

- In VSCode, press `CMD + SHIFT + P` to open the command prompt
- Search for and select the command `Preferences: Open User Settings`
- Choose either the "User" or "Workspace" tab to apply these settings
- In "Search settings" look up `files.associations`
- Select "Add Item" and add these file associations: `*.html: html-hubl` and `*.css: css-hubl`
- For more information about how VSCode settings work, [please read the official VS Code documentation](https://code.visualstudio.com/docs/getstarted/settings).

### Enabling Emmet for HTML/HubL files

To enable Emmet on your `html-hubl` files, you can map `html-hubl` to `html` in your settings under "Emmet: Include Languages"

![VS Code Setting for Emmet](https://user-images.githubusercontent.com/9009552/114593899-9e320500-9c5a-11eb-98c6-9de022344ebc.png)

### IntelliSense Suggestions

If you are would like to get IntelliSense suggestions when in snippet placeholders, you will need to add the following to your user settings:

`"editor.suggest.snippetsPreventQuickSuggestions": false`

For parameter suggestions, the following should also be added:

`"editor.parameterHints": true`

## Beta Features

To enable beta features, navigate to `HubSpot > Beta` in your VS Code settings and check the box to opt in. Any current beta features are listed below.

### Current list of features available in Beta:

None at this time.

## Telemetry

HubSpot for VS Code collects user data in order to improve the extension’s experience. You can [review HubSpot’s privacy policy here](https://legal.hubspot.com/privacy-policy). Additionally, you may opt out of data collection by changing the setting for global telemetry in VS Code. To read more about VS Code and telemetry, including disabling telemetry reporting, [please read the official VS Code documentation](https://code.visualstudio.com/docs/getstarted/telemetry).

## Contributing

This extension is open source and we welcome contributions as well as issues for feature requests and bug reports. For more information about contributing, see the [contributing docs](https://github.com/HubSpot/hubspot-cms-vscode/blob/master/CONTRIBUTING.md) to get started.