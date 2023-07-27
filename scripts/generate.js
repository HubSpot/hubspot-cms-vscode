const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const SNIPPET_TYPES = ['expTests', 'filters', 'functions', 'tags'];

const PREFIX = {
  expTests: '',
  filters: '|',
  functions: '~',
  tags: '~',
};

const OMIT_SNIPPET = [
  'dnd_area',
  'dnd_section',
  'dnd_row',
  'dnd_column',
  'dnd_module',
];

const HUBLDOC_ENDPOINT = 'https://api.hubspot.com/cos-rendering/v1/hubldoc';

const fetchHubldocs = async () => {
  try {
    const res = await fetch(HUBLDOC_ENDPOINT);
    return await res.json();
  } catch (err) {
    console.error(chalk.red(`Error: ${err.message}`));
  }
};

const buildSnippetBody = (
  { name, params, empty: isSelfClosing, snippets },
  type
) => {
  // If tag is block level, look for end tag in snippet
  let endTag = null;
  if (type === 'tags' && !isSelfClosing && snippets.length > 0) {
    const endTags = snippets[0].code.match(/end[a-zA-Z_]+/gi);
    if (endTags) {
      endTag = endTags.pop();
    }
  }

  const prettyParams = () => {
    const formattedParams = params.map((param, index) => {
      const paramIndex = index + 1;

      if (type == 'tags') {
        return (
          '\n\t' + param.name + "='${" + paramIndex + ':' + param.name + "}'"
        );
      } else if (param.type == 'String') {
        return "'${" + paramIndex + ':' + param.name + "}'";
      } else {
        return '${' + paramIndex + ':' + param.name + '}';
      }
    });

    return formattedParams.join(', ');
  };

  switch (type) {
    case 'expTests':
      return name;
    case 'filters':
      return params.length > 0 ? `|${name}(${prettyParams()})` : `|${name}`;
    case 'functions':
      return `${name}(${prettyParams()})`;
    case 'tags':
      if (endTag) {
        return `{% ${name} 'my_${name}' ${prettyParams()}%}\n\n{% ${endTag} %}`;
      } else {
        return `{% ${name} 'my_${name}' ${prettyParams()}%}`;
      }
  }
};

const buildSnippetDescription = (docEntry) => {
  const { desc, params = [] } = docEntry;
  let description = desc;

  if (params.length > 0) {
    description += '\nParameters:';

    for (let param of params) {
      description += `\n- ${param.name.replace(' ', '_')}(${param.type}) ${
        param.desc
      }`;
    }
  }

  return description;
};

const createSnippet = (docEntry, type, existingSnippet) => {
  if (OMIT_SNIPPET.includes(docEntry.name)) {
    return;
  }

  return {
    body: [
      existingSnippet ? existingSnippet : buildSnippetBody(docEntry, type),
    ],
    description: buildSnippetDescription(docEntry, type),
    prefix: PREFIX[type] + docEntry.name,
  };
};

const createFile = async (data, type) => {
  const snippetData = data[type];
  const docEntries = Object.values(snippetData);

  let snippets = {};
  for (let entry of docEntries) {
    if (type === 'tags' && data.codeSnippets[entry['name']]) {
      snippets[entry['name']] = createSnippet(
        entry,
        type,
        data.codeSnippets[entry['name']]
      );
    } else {
      snippets[entry['name']] = createSnippet(entry, type);
    }
  }

  try {
    const filepath = path.resolve(
      process.cwd(),
      `./snippets/auto_gen/hubl_${type}.json`
    );
    const snippetCount = Object.keys(snippets).length;
    fs.outputJSONSync(filepath, snippets, {
      spaces: 2,
    });

    console.log(`Wrote ${filepath} with ${snippetCount} snippets`);
  } catch (err) {
    console.error(chalk.red(`Error: ${err.message}`));
  }
};

const createSnippetFiles = async () => {
  const data = await fetchHubldocs();

  for (let type of SNIPPET_TYPES) {
    createFile(data, type);
  }
};

createSnippetFiles();
