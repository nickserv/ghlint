var _ = require('underscore');
var async = require('async');
var request = require('request');
var linters = require('./linters');

var repoURL = 'https://api.github.com/repos/nicolasmccurdy/repos';
var githubRequest = request.defaults({
  headers: {
    Accept: 'application/vnd.github.v3',
    'User-Agent': 'ghlint'
  },
  json: true,
  qs: {
    client_id: process.env.GHLINT_ID,
    client_secret: process.env.GHLINT_SECRET
  }
});

module.exports = {
  linters: linters,
  lintAll: function (callback) {
    async.parallel([
      function (callback) {
        githubRequest(repoURL, function (error, response, body) {
          callback(error, body);
        });
      },
      function (callback) {
        githubRequest(repoURL + '/commits', function (error, response, body) {
          callback(error, body);
        });
      }
    ], function (err, data) {
      callback(err, linters.map(function (linter) {
        return {
          message: linter.message,
          result: linter.lint.apply(linter, data)
        };
      }));
    });
  }
};
