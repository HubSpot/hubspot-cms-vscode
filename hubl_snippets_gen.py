import json
import requests

hubl = requests.get('https://api.hubspot.com/cos-rendering/v1/hubldoc').json()
skips = {'for', 'if', 'block', 'widget_block'}
nl = "\n"

def writePrettySnippetJson(filePath, snippetJson):
    with open(f'./snippets/auto_gen/{filePath}.json', 'w') as outfile:
        json.dump(snippetJson, outfile, indent=4, sort_keys=True) 

def paramify(paramType, param, hublType):
    if paramType == 'String':
        builtParam = f'"${{{param}}}"'
    else:
        builtParam = f'${{{param}}}'
    if hublType == 'tags':
        builtParam = f'\n\t{param}={builtParam}'
    return builtParam

def buildBody(bodyParams, hublType, name):
    if hublType == 'functions':
        body = f'{name}(' + bodyParams + ')'
    elif hublType == 'filters':
        body = f'|{name}{f"({bodyParams})" if bodyParams else ""}'
    elif hublType == 'tags':
        body = f'{{% {name} "my_{name}"\n\t' + bodyParams + '\n%}'
    elif hublType == 'expTests':
        body = name
    return body

def buildHubLSnippets(hublType, prefixChar):
    snippets = {}
    hublObjects = hubl[hublType]
    for hublObject in hublObjects:
        name = hublObjects[hublObject]['name']
        if name not in skips:
            desc_params = ''
            body_params = ''
            snippet = {}
            snippet['prefix'] = f'{prefixChar}{name}'
            desc = hublObjects[hublObject]['desc']
            params = hublObjects[hublObject]['params']
            for i, param in enumerate(params):
                desc_params += f'- {param["name"]}({param["type"]}) {param["desc"]}\n'
                if i == 0 and hublType == 'filters':
                    continue
                body_params += paramify(param["type"], param["name"], hublType) + ', '
            body_params = body_params.strip()[:-1]
            snippet['body'] = [buildBody(body_params, hublType, name)]
            snippet['description'] = f'{desc}{f"{nl}Parameters:{nl}{desc_params}" if desc_params else ""}'
            snippets[name] = snippet
    writePrettySnippetJson(f'hubl_{hublType}', snippets)

buildHubLSnippets('filters', '|')
buildHubLSnippets('functions', '~')
buildHubLSnippets('tags', '~')
buildHubLSnippets('expTests', '')
