const Wreck = require('wreck');

class Client {
  constructor(config) {
    this._wreck = Wreck.defaults({
      baseUrl: config.url,
      headers: {
        Authorization: `Bearer ${config.token}`
      }
    });

    this._request = (method, url, options) => {

      return new Promise((resolve, reject) => {

        this._wreck.request(method, url, options, (err, res) => {

          if (err) {
            return reject(err);
          }

          if (res.statusCode < 200 ||
            res.statusCode >= 300) {

            const e = new Error('Invalid response code: ' + res.statusCode);
            e.statusCode = res.statusCode;
            e.headers = res.headers;
            return reject(e);
          }

          this._wreck.read(res, { json: true }, (err, payload) => {

            if (err) {
              return reject(err);
            }

            return resolve(payload);
          });
        });
      });
    };
  };

  deploy(repo, build, env) {
    return this._request('post', `/api/repos/${repo}/builds/${build}?event=deployment&deploy_to=${env}`);
  }
}

module.exports = Client;