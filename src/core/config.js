let _config;

const setConfig = (config) => {
  _config = config;
};

const getConfig = () => {
  return _config;
};

const getAccountConfig = (accountId) => {
  return _config.portals.find((portal) => portal.portalId === accountId);
};

const validateConfig = () => {
  if (!_config) {
    console.error('Config file is empty');
    return false;
  }

  if (!_config.defaultPortal) {
    console.error('This extension requires a "defaultPortal"');
    return false;
  }

  if (!Array.isArray(_config.portals)) {
    console.error('This extension requires at least one configured account');
    return false;
  }
  return true;
};

export { getConfig, getAccountConfig, setConfig, validateConfig };
