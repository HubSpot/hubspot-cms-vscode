import json
import requests

hubl = requests.get('https://api.hubspot.com/cos-rendering/v1/hubldoc').json()

hubl_filters = hubl['filters']
filters_snippets = {}
for hubl_filter in hubl_filters:
    filter_json = {}
    filter_name = hubl_filters[hubl_filter]['name']
    filter_json['prefix'] = f'|{filter_name}'
    params_list_desc = ''
    params_list_body = ''
    filter_desc = hubl_filters[hubl_filter]['desc']
    filter_params = hubl_filters[hubl_filter]['params']
    for i, param in enumerate(filter_params):
        params_list_desc += f'- {param["name"]}({param["type"]}) {param["desc"]}\n'
        if i > 0:
            if i == 1 and param == filter_params[-1]:
                params_list_body += f'(${{{param["name"]}}})'
            elif i == 1 and param != filter_params[-1]:
                params_list_body += f'(${{{param["name"]}}},'
            elif i > 1 and param != filter_params[-1]:
                params_list_body += f' ${{{param["name"]}}},'
            elif i > 1 and param == filter_params[-1]:
                params_list_body += f' ${{{param["name"]}}})'
    filter_json['description'] = f'{filter_desc}\nParameters:\n{params_list_desc}'
    filter_json['body'] = [f'|{filter_name}' + params_list_body]
    filters_snippets[filter_name] = filter_json
with open('./snippets/hubl_filters.json', 'w') as outfile:
    json.dump(filters_snippets, outfile)

hubl_tags = hubl['tags']
tags_snippets = {}
for hubl_tag in hubl_tags:
    if hubl_tags[hubl_tag]['name'] != 'for' and hubl_tags[hubl_tag]['name'] != 'if':
        tag_json = {}
        tag_name = hubl_tags[hubl_tag]['name']
        tag_json['prefix'] = f'%{tag_name}'
        params_list_desc = ''
        params_list_body = ''
        tag_desc = hubl_tags[hubl_tag]['desc']
        tag_params = hubl_tags[hubl_tag]['params']
        for i, param in enumerate(tag_params):
            params_list_desc += f'- {param["name"]}({param["type"]}) {param["desc"]}\n'
            if param["type"] == 'String':
                params_list_body += f' {param["name"]}="${{{param["name"]}}}",'
            else:
                params_list_body += f' {param["name"]}=${{{param["name"]}}},'
        params_list_body = params_list_body[:-1]
        tag_json['description'] = f'{filter_desc}\nParameters:\n{params_list_desc}'
        tag_json['body'] = [f'{{% {tag_name} "my_{tag_name}"' + params_list_body + ' %}']
        tags_snippets[tag_name] = tag_json
with open('./snippets/hubl_tags.json', 'w') as outfile:
    json.dump(tags_snippets, outfile)

hubl_functions = hubl['functions']
functions_snippets = {}
for hubl_function in hubl_functions:
    function_json = {}
    function_name = hubl_functions[hubl_function]['name']
    function_json['prefix'] = f'%{function_name}'
    params_list_desc = ''
    params_list_body = ''
    function_desc = hubl_functions[hubl_function]['desc']
    function_params = hubl_functions[hubl_function]['params']
    for i, param in enumerate(function_params):
        params_list_desc += f'- {param["name"]}({param["type"]}) {param["desc"]}\n'
        if param["type"] == 'String':
            params_list_body += f'"${{{param["name"]}}}",'
        else:
            params_list_body += f'${{{param["name"]}}},'
    params_list_body = params_list_body[:-1]
    function_json['description'] = f'{function_desc}\nParameters:\n{params_list_desc}'
    function_json['body'] = [f'{function_name}(' + params_list_body + ')']
    functions_snippets[function_name] = function_json
with open('./snippets/hubl_functions.json', 'w') as outfile:
    json.dump(functions_snippets, outfile)


# {
#     "hubdb_table_rows": {
#         "prefix": "hubdb_table_rows",
#         "body": [
#             "hubdb_table_rows(${tableId}, ${filterQuery})"
#         ],
#         "description": "Returns a sequence of data table rows based on the query."
#      },
     
# }