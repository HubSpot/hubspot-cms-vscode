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
            descParams = ''
            bodyParams = ''
            snippet = {}
            snippet['prefix'] = f'{prefixChar}{name}'
            desc = hublObjects[hublObject]['desc']
            params = hublObjects[hublObject]['params']
            for i, param in enumerate(params):
                descParams += f'- {param["name"].replace(" ","_")}({param["type"]}) {param["desc"]}\n'
                if i == 0 and hublType == 'filters':
                    continue
                bodyParams += paramify(param["type"], param["name"].replace(" ","_"), hublType) + ', '
            bodyParams = bodyParams.strip()[:-1]
            snippet['body'] = [buildBody(bodyParams, hublType, name)]
            snippet['description'] = f'{desc}{f"{nl}Parameters:{nl}{descParams}" if descParams else ""}'
            snippets[name] = snippet
    writePrettySnippetJson(f'hubl_{hublType}', snippets)

buildHubLSnippets('filters', '|')
buildHubLSnippets('functions', '~')
buildHubLSnippets('tags', '~')
buildHubLSnippets('expTests', '')
