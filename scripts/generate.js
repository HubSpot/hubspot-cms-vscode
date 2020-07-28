const fetch = require("node-fetch");
const fs = require("fs-extra");
const path = require("path");

const PREFIX = {
  expTests: "",
  filters: "|",
  functions: "~",
  tags: "~",
};

// Skip snippet generation if format is incompatible
const SKIP_SNIPPET_GENERATION = ["set", "for", "if", "flip"];

const fetchHubldocs = async () => {
  const HUBLDOC_ENDPOINT = "https://api.hubspot.com/cos-rendering/v1/hubldoc";
  const response = await fetch(HUBLDOC_ENDPOINT);

  return response.json();
};

const buildSnippetBody = (
  { name, params, empty: isSelfClosing, snippets },
  type
) => {
  // If tag is block level, look for end tag in snippet
  let endTag = null;
  if (type === "tags" && !isSelfClosing && snippets.length > 0) {
    const endTags = snippets[0].code.match(/end[a-zA-Z_]+/gi);
    if (endTags) {
      endTag = endTags.pop();
    }
  }

  const prettyParams = () => {
    const formattedParams = params.map((param, index) => {
      const paramIndex = index + 1;

      if (param.type == "String") {
        return '"${' + paramIndex + ":" + param.name + '}"';
      } else if (type == "tags") {
        return (
          "\n\t" + param.name + '="${' + paramIndex + ":" + param.name + '}"'
        );
      } else {
        return "${" + paramIndex + ":" + param.name + "}";
      }
    });

    return formattedParams.join(", ");
  };

  switch (type) {
    case "expTests":
      return name;
    case "filters":
      return params.length > 0 ? `|${name}(${prettyParams()})` : `|${name}`;
    case "functions":
      return `${name}(${prettyParams()})`;
    case "tags":
      if (endTag) {
        return `{% ${name} "my_${name}" ${prettyParams()}%}\n\n{% ${endTag} %}`;
      } else {
        return `{% ${name} "my_${name}" ${prettyParams()}%}`;
      }
  }
};

const buildSnippetDescription = (docEntry) => {
  const { desc, params } = docEntry;
  let description = desc;

  if (params.length > 0) {
    description += "\nParameters:";

    for (param of params) {
      description += `\n- ${param.name.replace(" ", "_")}(${param.type}) ${
        param.desc
      }`;
    }
  }

  return description;
};

const getFirstDefaultSnippet = (docEntry) => {
  return docEntry.snippets.shift().code;
};

const createSnippet = (docEntry, type) => {
  let snippetEntry = {
    body: [
      SKIP_SNIPPET_GENERATION.includes(docEntry.name)
        ? getFirstDefaultSnippet(docEntry)
        : buildSnippetBody(docEntry, type),
    ],
    description: buildSnippetDescription(docEntry, type),
    prefix: PREFIX[type] + docEntry.name,
  };

  return snippetEntry;
};

const createFile = async (data, type) => {
  const docEntries = Object.values(data);

  let snippets = {};
  for (entry of docEntries) {
    snippets[entry["name"]] = createSnippet(entry, type);
  }

  try {
    const filepath = path.resolve(
      __dirname,
      `./snippets/auto_gen/hubl_${type}.json`
    );
    const snippetCount = Object.keys(snippets).length;

    fs.outputJSONSync(`./snippets/auto_gen/hubl_${type}.json`, snippets, {
      spaces: 2,
    });

    console.log(`Wrote ${filepath} with ${snippetCount} snippets`);
  } catch (e) {
    console.log(e);
  }
};

const createSnippetFiles = async () => {
  const data = await fetchHubldocs();
  const snippetTypes = Object.keys(data);

  for (type of snippetTypes) {
    createFile(data[type], type);
  }
};

createSnippetFiles();
