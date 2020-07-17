const fetch = require("node-fetch");
const fs = require("fs-extra");

const PREFIX = {
  expTests: "",
  filters: "|",
  functions: "~",
  tags: "~",
};

const fetchHubldocs = async () => {
  const HUBLDOC_ENDPOINT = "https://api.hubspot.com/cos-rendering/v1/hubldoc";
  const response = await fetch(HUBLDOC_ENDPOINT);

  return response.json();
};

const getSnippetBody = (
  { name, params, empty: isSelfClosing, snippets },
  type
) => {
  // Special handling for block tags to find end tag
  let endTag = null;
  if (type === "tags" && !isSelfClosing && snippets.length > 0) {
    const endTags = snippets[0].code.match(/end[a-zA-Z_]+/gi);
    if (endTags) {
      endTag = endTags.pop();
    }
  }

  const prettyParams = () => {
    const formattedParams = params.map((param) => {
      if (param.type == "String") {
        return '"${' + param.name + '}"';
      } else if (type == "tags") {
        return "\n\t" + param.name + '="${' + param.name + '}"';
      } else {
        return "${" + param.name + "}";
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
const getSnippetDescription = (docEntry) => {
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

const createSnippet = (docEntry, type) => {
  let snippetEntry = {
    body: [getSnippetBody(docEntry, type)],
    description: getSnippetDescription(docEntry, type),
    prefix: PREFIX[type] + docEntry.name,
  };

  return snippetEntry;
};

const createFile = async (data, type, prefix) => {
  const docEntries = Object.values(data);

  let snippets = {};
  for (let entry of docEntries) {
    snippets[entry["name"]] = createSnippet(entry, type);
  }

  fs.outputJSONSync(`./snippets/auto_gen/hubl_${type}.json`, snippets, { spaces: 2 });
};

const createSnippetFiles = async () => {
  const data = await fetchHubldocs();
  const snippetTypes = Object.keys(data);

  for (let type of snippetTypes) {
    createFile(data[type], type);
  }
};

createSnippetFiles();
