let _config;

const setConfig = (config) => {
  _config = config;
};

const getConfig = () => {
  return _config;
};

export { getConfig, setConfig };
