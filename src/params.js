const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), process.env['PLUGIN_PARAMS'])});
const parseEnv = require('parse-env');

const template = {
  plugin: {
    action: '',
    repositories: '',
    registryPath: '',
    success: '',
    failure: ''
  },
  registry: {
    downstream: 'false',
    package: '',
    version: '',
    buildStatus: '',
    buildRepo: '',
    buildNumber: ''
  }
};

const params = parseEnv(process.env, template);

params.registry.downstream = params.registry.downstream.toLowerCase() === 'true';
params.plugin.repositories =
  params.plugin.repositories !== '' ?
    params.plugin.repositories.split(',').map((item) => item.trim()) :
    [];

// Skip verification if no downstream build flag
if (params.registry.downstream) {
  if (!params.plugin.registryPath)
    throw new Error('Registry path not specified');

  if (!params.registry.package)
    throw new Error('Package not specified');

  if (!params.registry.version)
    throw new Error('Version not specified');

  switch (params.plugin.action) {
    case 'package-build':
      if (!params.plugin.repositories.length)
        throw new Error('No downstream repositories specified');
      break;

    case 'downstream-build':
      if (!params.registry.buildRepo)
        throw new Error('downstream-build should provide self repository name');
      if (!params.registry.buildStatus)
        throw new Error('downstream-build should provide build status (success, failure)');
      if (!params.registry.buildNumber)
        throw new Error('downstream-build should provide build number');
      break;

    default:
      throw new Error(`Unknown plugin action (${params.plugin.action})`);
  }
}

module.exports = params;



