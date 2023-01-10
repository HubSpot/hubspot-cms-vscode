const axios = require('axios');
const {
  VSCODE_EXTENSION_FEEDBACK_ACCESS_TOKEN,
  VSCODE_EXTENSION_FEEDBACK_HUBDB_TABLE_NAME,
} = process.env;
const HUBDB_API_PATH = `https://api.hubspot.com/cms/v3/hubdb`;

const addTableRow = async (rowData) => {
  return axios({
    method: 'POST',
    url: `${HUBDB_API_PATH}/tables/${VSCODE_EXTENSION_FEEDBACK_HUBDB_TABLE_NAME}/rows`,
    data: {
      values: rowData,
    },
    headers: {
      authorization: `Bearer ${VSCODE_EXTENSION_FEEDBACK_ACCESS_TOKEN}`,
    },
  });
};

const publishTable = async () => {
  return axios({
    method: 'POST',
    url: `${HUBDB_API_PATH}/tables/${VSCODE_EXTENSION_FEEDBACK_HUBDB_TABLE_NAME}/draft/push-live`,
    data: {},
    headers: {
      authorization: `Bearer ${VSCODE_EXTENSION_FEEDBACK_ACCESS_TOKEN}`,
    },
  });
};

exports.main = async (context, sendResponse) => {
  const { body } = context;

  try {
    await addTableRow(body);
    await publishTable();

    return sendResponse({
      statusCode: 200,
    });
  } catch (error) {
    return sendResponse({
      statusCode: 500,
      body: error,
    });
  }
};
