// Using this example as a template: https://github.com/HubSpot/serverless-function-examples/tree/master/cms/hubdb-module-data-persist
const axios = require('axios');
// const dayjs = require('dayjs');
// var relativeTime = require('dayjs/plugin/relativeTime');
// dayjs.extend(relativeTime);
const { ACCESS_TOKEN, HUBDB_TABLE_NAME } = process.env;
const HUBDB_API_PATH = `https://api.hubspot.com/cms/v3/hubdb`;

const addTableRow = async (rowData) => {
  return axios({
    method: 'POST',
    url: `${HUBDB_API_PATH}/tables/${HUBDB_TABLE_NAME}/rows`,
    data: {
      values: rowData,
    },
    headers: {
      authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
};

const publishTable = async () => {
  return axios({
    method: 'POST',
    url: `${HUBDB_API_PATH}/tables/${HUBDB_TABLE_NAME}/draft/push-live`,
    data: {},
    headers: {
      authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
};

// Body Example:
// {
//   'vs-code-version': '1.74.2',
//   'hubspot-extension-version': '1.0.0',
//   'machine-id':
//     '5471bb7dbd45f67c909994d9ea2f63a72a19efe098bd1849d313c5ff2371b404',
//   'operating-system': 'darwin 21.6.0',
//   shell: '/bin/zsh',
//   language: 'en',
//   'experience-rating': '5',
//   'reason-for-rating': 'Some reason',
//   name: 'Test User',
//   email: 'testing@example.com',
// };
exports.main = async (context, sendResponse) => {
  console.log('context: ', context);
  const { body } = context;

  // TODO - Send body to S3 bucket as JSON file

  // Send body to HubDB table row and publish it

  try {
    await addTableRow(body);
    await publishTable();

    return sendResponse({
      statusCode: 200,
    });
  } catch (error) {
    console.log('error: ', error);
    return sendResponse({
      statusCode: 500,
      body: error,
    });
  }
};
