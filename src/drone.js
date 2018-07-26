const Wreck = require('wreck');
const qs = require('querystring');
const log = require('./logger');

class Client {
  constructor(config) {
    this._wreck = Wreck.defaults({
      baseUrl: config.url,
      headers: {
        Authorization: `Bearer ${config.token}`
      }
    });

    this._request = (method, url, options) =>
        this._wreck.request(method, url, options)
          .then(res => Wreck.read(res))
          .then(body => body.toString());
  };

  deploy(repo, build, env, params) {
    const query = Object.assign({}, params);
    query['event'] = 'deployment';
    query['deploy_to'] = env;

    const url = `/api/repos/${repo}/builds/${build}?${qs.stringify(query)}`;

    log.info(`POST: ${url}`);

    return this._request('post', url);
  }
}

module.exports = Client;