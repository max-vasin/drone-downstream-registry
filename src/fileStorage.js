const path = require('path');
const fs = require('fs');
const log = require('./logger');
const sanitize = require('sanitize-filename');

module.exports = (registryPath) => {
  const getEntryPath = (name, version) => {
    return path.resolve(registryPath, sanitize(`${name}@${version}`));
  };

  return {
    getEntry: (name, version) => {
      const entryPath = getEntryPath(name, version);
      log.info(`file-storage: reading entry file ${entryPath}`)
      return JSON.parse(fs.readFileSync(entryPath));
    },
    setEntry: (name, version, payload) => {
      const entryPath = getEntryPath(name, version);
      log.info(`file-storage: writing payload to entry file ${entryPath}`);
      fs.writeFileSync(entryPath, JSON.stringify(payload, null, 2));
    }
  };
};