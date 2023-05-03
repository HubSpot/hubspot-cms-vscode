const uneval = require('un-eval');
const yaml = require('js-yaml');
const packageLockJSON = require('../package-lock.json');
const fetch = require("node-fetch");

module.exports = function (source) {
    const res = yaml.load(source);
    return `export default ${uneval(res)}`;
}