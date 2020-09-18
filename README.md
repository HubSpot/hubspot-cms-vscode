# HubSpot Visual Studio Code Extension
For :rocket: fast HubSpot CMS Hub development.

This extension currently supports:
- Syntax highlighting for the [HubL templating language](https://designers.hubspot.com/docs/hubl/intro-to-hubl)
- Autocomlete for common HubL tags, filters, and functions
- Bracket wrapping, indentation, and other helpful editor features

If you're new to CMS Hub, check out how to [get started with local development.](https://designers.hubspot.com/docs/tools/local-development)

## Features

### Syntax Highlighting
HubL syntax highlighting is supported for `.html` and `.css` files support HubL syntax highlighting. Enable syntax highlighting by setting your file type to HTML + HubL or CSS + HubL.

_Thanks to the [Better Jinja](https://github.com/samuelcolvin/jinjahtml-vscode) extension for inspiration._

### Editor Features
- Statement wrapping (Supports `{%%}`,`{##}`,`{{}}`)
- Block comment toggling: Press `CMD + /` to create HubL comments
- Block level indentation: Text inside of `{% block %}` will be indented automatically

### HubL Snippets
All HubL supported tags, filters, expression tests and functions have auto-complete snippets. A prefix is required to access some auto completions:

- Expression tests are accessed by typing the test name alone. Ex: `di` > Enter produces:
```
divisibleby
```
- Filters are accessed with `|`. Ex: `|se` > Enter produces:
```
|selectattr("${attr}", ${exp_test})
```
- Functions and tags are accessed with `~`. Ex: `~hub` > Enter produces:
```
hubdb_table_rows(${table_id}, ${query})
```
- HubL supported variables are accessed by typing the variable name alone. Ex: `content.ab` > Enter produces:
```
content.absolute_url
```

There are also other helpful snippets:
| Snippet Prefix | Description | Example |
|-|-|-|
| otrue | Generates overrideable=True for HubL tags | overrideable=True |
| ofalse | Generates overrideable=False for HubL tags | overrideable=False |
| for | Returns a basic if statement | {% for {iterable} in {dict} %} {{ iterable }} {% endfor %}" |
| if | Returns a basic if statement | {% if {test} %} do_something}{% endif %} |
| elif | Else if statement to be used within if statement | {% elif {test} %} |
| else | Else statement to be used within if statement | {% else %} |
| hubldoc | Boilerplate html/HubL document |  |
| hublblog | Boilerplate blog markup |  |


## Getting Started
This extension introduces new file languages: `HTML + HUBL` and `HTML + CSS`. In order to use these new features, you'll want to make sure you've told VSCode to use these langauges. For one-off files, you can simply change the language in the lower right hand corner of your screen. However, we recommend adjusting your file associations under your User or Workspace preferences:
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
