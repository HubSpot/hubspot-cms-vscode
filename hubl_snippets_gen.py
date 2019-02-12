import json
import requests

hubl = requests.get('https://api.hubspot.com/cos-rendering/v1/hubldoc').json()
skips = {'for', 'if'}
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
        descParams = ''
        bodyParams = ''
        snippet = {}
        snip = {}
        desc = hublObjects[hublObject]['desc']
        if name not in skips:
            
            # TODO all of this try,catch and snipExists is to solve for https://github.com/williamspiro/HubL-Language-Extension/issues/6
            # Look into if there is somehow a better way to do this
            try: 
                snip = hublObjects[hublObject]['snippets'][0]
                snipExists = True
            except:
                snipExists = False

            if snipExists == True and f"end{name}" in snip['code']:
                print(f"Creating snippet for snippet for closing HubL: {name}")
                snip = hublObjects[hublObject]['snippets'][0]
                snippet['prefix'] = f'{prefixChar}{name}'
                snippet['body'] = snip['code']
                snippet['description'] = f'{desc}{f"{nl}Parameters:{nl}{descParams}" if descParams else ""}'
                snippets[name] = snippet
            else:
                print(f"Creating snippet for self closing HubL: {name}")
                snippet['prefix'] = f'{prefixChar}{name}'
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
