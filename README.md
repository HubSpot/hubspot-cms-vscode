# HubL Visual Studio Code Language Extension
This is the HubSpot extension for [Visual Studio Code](https://code.visualstudio.com/), allowing for :rocket: fast HubSpot CMS Hub development.

This extension currently supports:
- Syntax highlighting for the [HubL templating language](https://designers.hubspot.com/docs/hubl/intro-to-hubl)
- Autocomlete for common HubL tags, filters, and functions
- Bracket wrapping, indentation, and other helpful editor features

If you're new to CMS Hub, check out how to [get started with local development.](https://designers.hubspot.com/docs/tools/local-development)

## Features

### Syntax Highlighting
HubL syntax hightlighting is supported for `.HTML`, `.CSS`, and `.JS` files. To enable syntax highlighting, make sure that your file type is set to one of these types.

_Thanks to the [Better Jinja](https://github.com/samuelcolvin/jinjahtml-vscode) extension for inspiration._

### Editor Features
- Statement wrapping (Supports `{%%}`,`{##}`,`{{}}`)
- Block comment toggling: Press `CMD + /` to create HubL comments
- Block level indentation: Text inside of `{% block %}` will be indented automatically

### __HubL Snippets__
All HubL supported tags, filters, expression tests and functions have auto-complete snippets. Expression tests are accessed by typing the test name alone, filters are accessed with `|` and functions/tags are accessed with `~`. All snippets include descriptions and parameter details. You up/down arrow to navigate the IntelliSense and hit enter to execute a snippet. Snippet completed HubL statements will auto-highlight available parameters, which can be tabbed through (`${parameter}`).

![Parameters](https://cdn2.hubspot.net/hubfs/2359872/IMPORTANT/DONOTDELETE/hubl-language-extension/params.png)
[__HubL Tags__](https://designers.hubspot.com/docs/hubl/hubl-supported-tags) produce entire HubL tag statements with available parameters. Ex `~he` > Enter produces:
```
{% header "${my_header}"
   header_tag="${header_tag}",
   value="${value}"
%}
```
[__HubL Filters__](https://designers.hubspot.com/docs/hubl/hubl-supported-filters) produce entire HubL filter statements with available parameters. Ex `|se` > Enter produces:
```
|selectattr("${attr}", ${exp_test})
```
[__HubL Functions__](https://designers.hubspot.com/en/docs/hubl/hubl-supported-functions) produce entire HubL function statements with available parameters, without wrapping curly braces. The intention of this is so you can use HubL functions within other HubL statements easily (like setting variables, for loops, etc.) Ex `~hub` > Enter produces:
```
hubdb_table_rows(${table_id}, ${query})
```
[__HubL Expression Tests__](https://designers.hubspot.com/docs/hubl/operators-and-expression-tests#expression-tests) produce expression test names. Ex `di` > Enter produces:
```
divisibleby
```

__Other Helpful HubL Things__
[`standard_footer_includes` & `standard_header_includes`](https://designers.hubspot.com/docs/hubl/hubl-supported-variables#required-page-template-variables)
 ```
{{ standard_footer_includes }}
{{ standard_header_includes }}
 ```
[`for`](https://designers.hubspot.com/docs/hubl/for-loops)
```
{% for ${iterable} in ${dict} %}
   {{ ${iterable} }}
{% endfor %}
```
[`if`](https://designers.hubspot.com/docs/hubl/if-statements)
```
{% if ${test} %}
    ${do_something}
{% endif %}
```
[`elif` & `else`](https://designers.hubspot.com/docs/hubl/if-statements#using-elif-and-else)
```
{% elif ${test} %}
{% else %}
```
[`blog variables`](https://designers.hubspot.com/docs/hubl/hubl-supported-variables#blog-variables)
```
{{ content.post_body }}
{{ content.blog_post_author }}
{{ group }}
{{ next_page_num }}
etc.
```
_NOTE_: Some of these variables are nested
![Nested variables](https://cdn2.hubspot.net/hubfs/2359872/IMPORTANT/DONOTDELETE/hubl-language-extension/content..gif)

`hubldoc`
```
<!doctype html>
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="{{ html_lang }}" {{ html_lang_dir }}> <![endif]-->
<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="{{ html_lang }}" {{ html_lang_dir }}>        <![endif]-->
<!--[if IE 8]>    <html class="no-js lt-ie9" lang="{{ html_lang }}" {{ html_lang_dir }}>               <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="{{ html_lang }}" {{ html_lang_dir }}> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="author" content="{{ meta_author }}">
        <meta name="description" content="{{ page_meta.meta_description }}">
        <title>{{ page_meta.html_title }}</title>
        {% if site_settings.favicon_src %}<link rel="shortcut icon" href="{{ site_settings.favicon_src }}" />{% endif %}
        {{ standard_header_includes }}
    </head>
    <body>
        ${stuff}
        {{ standard_footer_includes }}
    </body>
</html>
```
`hublblog`
```
{% if is_listing_view %}
    <!-- Markup for blog listing template -->
    {% for content in contents %}
        <h2><a href="{{content.absolute_url}}">{{ content.name }}</a></h2>
        {% if content.post_list_summary_featured_image %}
            <a href="{{content.absolute_url}}">
                <img src="{{ content.post_list_summary_featured_image }}" alt="{{ content.featured_image_alt_text }}">
            </a>
        {% endif %}
        {{ content.post_list_content|safe }}
    {% endfor %}
{% else %}
    <!-- Markup for blog post template -->
    <h1>{{ content.name }}</h1>
    <a href="{{ group.absolute_url }}/author/{{ content.blog_post_author.slug }}">{{ content.blog_post_author.display_name }}</a>
    {{ content.publish_date_localized }}
    {{ content.post_body }}
    {% for topic in content.topic_list %}
        <a href="{{ blog_tag_url(group.id, topic.slug) }}">{{ topic.name }}</a>{% if not loop.last %},{% endif %}
    {% endfor %}
    {% blog_comments "blog_comments" overrideable=False, label='Blog Comments' %}
{% endif %}
```
[`request.<variables>`](https://designers.hubspot.com/docs/hubl/hubl-supported-variables#http-request-variables)
```
{{ request.cookies }}
{{ request.domain }}
{{ request.full_url }}
etc.
```
[`Email Required Template Variables`](https://designers.hubspot.com/docs/hubl/hubl-supported-variables#required-email-template-variables)
```
{{ site_settings.company_city }}
{{ site_settings.company_name }}
{{ unsubscribe_link }}
{{ unsubscribe_link_all }}
etc.
```

__Custom Module Fields__
In effort to allow for more streamlined local development of custom modules, snippets have been added that can be added to the fields.json file within a custom module.
The snippet trigger roughly corresponds with the field names in the design manager.
For example:  to add a rich text field, you would type
```
field.richtext
```
To create a group, use
```
group.group
```
To create a repeater, use
```
group.repeater
```
all associated fields need to be added into the children array within the snippet output

_NOTE_: If you are having trouble getting IntelliSense suggestions when in snippet placeholders you may need to add the following to your [User Settings](https://code.visualstudio.com/docs/getstarted/settings) `"editor.suggest.snippetsPreventQuickSuggestions": false`. If parameter suggestions are not showing up, set `"editor.parameterHints": true`.
