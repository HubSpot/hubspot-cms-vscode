# HubSpot Visual Studio Code Extension
For :rocket: fast HubSpot CMS Hub development.

This extension currently supports:
- Syntax highlighting for the [HubL templating language](https://designers.hubspot.com/docs/hubl/intro-to-hubl)
- Autocomplete for common HubL tags, filters, and functions
- Bracket wrapping, indentation, and other helpful editor features

If you're new to CMS Hub, check out how to [get started with local development.](https://designers.hubspot.com/docs/tools/local-development)

## Getting Started
This extension introduces new file languages: `HTML + HUBL` and `HTML + CSS`. In order to use these new features, you'll want to make sure you've told VSCode to use these languages. For one-off files, you can simply change the language in the lower right hand corner of your screen. However, we recommend adjusting your file associations under your User or Workspace preferences so HubL syntax highlighting will automatically be applied to all of your projects:
- In VSCode, press `CMD` + `SHIFT` + `P` to open the command prompt
- Search for and select the command `Preferences: Open Settings (UI)`
- Choose either the "User" or "Workspace" tab
- In "Search settings" look up `files.associations`
- Select "Add Item" and add these file associations: `*.html: html-hubl` and `*.css: css-hubl`

For more information about how VSCode settings work, [check out the docs](https://code.visualstudio.com/docs/getstarted/settings).

## Features

### Syntax Highlighting
HubL syntax highlighting is supported for `.html` and `.css` files support HubL syntax highlighting.

_Thanks to the [Better Jinja](https://github.com/samuelcolvin/jinjahtml-vscode) extension for inspiration._

### Editor Features
- Statement wrapping (Supports `{%%}`,`{##}`,`{{}}`)
- Block comment toggling: Press `CMD` + `/` to create HubL comments
- Block level indentation: Text inside of `{% block %}` will be indented automatically

### HubL Snippets
All HubL supported tags, filters, expression tests and functions have auto-complete snippets. A prefix is required to access some auto completions:

- [Expression tests](https://developers.hubspot.com/docs/cms/hubl/operators-and-expression-tests#expression-tests) are accessed by typing the test name alone. Ex: `di` > Enter produces:
```
divisibleby
```
- [Filters](https://developers.hubspot.com/docs/cms/hubl/filters) are accessed with `|`. Ex: `|se` > Enter produces:
```
|selectattr("${attr}", ${exp_test})
```
- [Functions](https://developers.hubspot.com/docs/cms/hubl/functions) and [tags](https://developers.hubspot.com/docs/cms/hubl/tags) are accessed with `~`. Ex: `~hub` > Enter produces:
```
hubdb_table_rows(${table_id}, ${query})
```
- [HubL supported variables](https://developers.hubspot.com/docs/cms/hubl/variables) are accessed by typing the variable name alone. Ex: `content.ab` > Enter produces:
```
content.absolute_url
```
- [Module fields](https://developers.hubspot.com/docs/cms/building-blocks/module-theme-fields-overview) can be access by typing the field type (in JSON files only). Ex: `ri` > Enter produces:
```
{
"name": "richtext_field",
"label": "Rich text field",
"required": false,
"locked": false,
"type": "richtext",
"inline_help_text": "",
"help_text": "",
"default": null
}
```

Other helpful snippets include:
| Snippet Prefix | Description | Example |
|-|-|-|
| otrue | Generates overrideable=True for HubL tags | overrideable=True |
| ofalse | Generates overrideable=False for HubL tags | overrideable=False |
| for | Returns a basic if statement | {% for {item} in {dict} %} {{ item }} {% endfor %}" |
| if | Returns a basic if statement | {% if {condition} %} do_something {% endif %} |
| elif | Else if statement to be used within if statement | {% elif {condition} %} |
| else | Else statement to be used within if statement | {% else %} |
| hubldoc | Boilerplate html/HubL document |  |
| hublblog | Boilerplate blog markup |  |


### Common issues
- If you are having trouble getting IntelliSense suggestions when in snippet placeholders you may need to add the following to your [User Settings](https://code.visualstudio.com/docs/getstarted/settings) `"editor.suggest.snippetsPreventQuickSuggestions": false`. If parameter suggestions are not showing up, set `"editor.parameterHints": true`.

 ### Contributing
 For more information about contributing, see the [contributing docs](./CONTRIBUTING.md).
