const path = require('path');
const joi = require('joi');

if (process.env['PLUGIN_PARAMS'])
  require('dotenv').config({ path: path.resolve(process.cwd(), process.env['PLUGIN_PARAMS'])});

const parseEnv = require('parse-env');

const toArray = (p, name) => {
  p[name] = !p[name].trim() ? [] : p[name].split(',').map((item) => item.trim());
};

const toObject = (p, name) => {
  p[name] = !p[name].trim() ? {} : JSON.parse(p[name]);
};

let params = parseEnv(process.env, {
  plugin: {
    action: '',
    repositories: '',
    registryPath: '',
    success: '',
    failure: '',
    server: ''
  },
  registry: {
    downstream: 'false',
    package: '',
    version: ''
  },
  drone: {
    build: {
      status: '',
      number: 0
    },
    repo: ''
  },
  secret: {
    serverToken: ''
  }
});

params.registry.downstream = params.registry.downstream.toLowerCase() === 'true';
toArray(params.plugin, 'repositories');
toObject(params.plugin, 'success');
toObject(params.plugin, 'failure');

// Skip verification if no downstream build flag
if (params.registry.downstream) {
  const schema = joi.object().keys({
    plugin: joi.object().keys({
      action: joi.string().valid('package-build', 'downstream-build').required(),
      repositories: joi.array().when('action', { is: 'package-build', then: joi.array().min(1).required() }),
      registryPath: joi.string().trim().required(),
      server: joi.string().uri({ scheme: ['http', 'https']}),
      success: joi.object().keys({
        repository: joi.string().trim().default(joi.ref('$currentRepo')),
        environment: joi.string().trim().default('downstream-success')
      }).when('action', { is: 'package-build', then: joi.object().required() }),
      failure: joi.object().keys({
        repository: joi.string().trim().default(joi.ref('$currentRepo')),
        environment: joi.string().trim().default('downstream-failure')
      }).when('action', { is: 'package-build', then: joi.object().required() })
    }),
    registry: joi.object().keys({
      downstream: joi.boolean().required(),
      package: joi.string().trim().required(),
      version: joi.string().trim().required()
    }).required(),
    drone: joi.object().keys({
      build: joi.object().keys({
        status: joi.string().required(),
        number: joi.number().min(1).required()
      }),
      repo: joi.string().required()
    }).required(),
    secret: joi.object().keys({
      serverToken: joi.string().required()
    }).required()
  });

  const result = joi.validate(params, schema, {
    abortEarly: false,
    context: {
      currentRepo: params.drone.repo
    }
  });

  if (result.error)
    throw result.error;

  params = result.value;
}

module.exports = params;



