const fetch = require("node-fetch");

const PREFIX = {
  "expTests": "",
  "filters":"|",
  "functions":"~",
  "tags":"~",
}

const fetchHubldocs = async () => {
  const HUBLDOC_ENDPOINT = "https://api.hubspot.com/cos-rendering/v1/hubldoc";
  const response = await fetch(HUBLDOC_ENDPOINT);

  return response.json();
};

const getSnippetBody = (docEntry, type) => {
  const {name, params} = docEntry;

  const prettyParams = () => {
    return params.map((param) =>{
      if (param.type == "String") {
        return '"${' + param.name + '}"';
      } else if (type == "tags") {
        return param.name+ '="${' + param.name + '}"';
      } else {
        return '${' + param.name + '}';
      }

    })
  }

  switch (type) {
    case "expTests":
      return name
    case "filters":
      return params ? `|${name}(${prettyParams()})` : ""
    case "functions":
      return `${name}(${prettyParams()})`
    case "tags":
      return `{% ${name} "my_${ name }"
        ${prettyParams()}
        %}`
  }
}

const createSnippet = (docEntry, type) => {
  let snippetEntry = {
    prefix: PREFIX[type] + docEntry.name,
    description: docEntry.desc,
    body: getSnippetBody(docEntry, type)
  };

  return snippetEntry;
};

const createFile = async (data, type, prefix) => {
  const docEntries = Object.values(data);

  let snippets = {};
  for (let entry of docEntries) {
    snippets[entry['name']] = createSnippet(entry, type);
  }

  // console.log(snippets);
};

const createSnippetFiles = async () => {
  const data = await fetchHubldocs();
  const snippetTypes = Object.keys(data);

  for (let type of snippetTypes) {
    createFile(data[type], type);
  }
};

createSnippetFiles();
