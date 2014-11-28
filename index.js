var _ = require('underscore');
var async = require('async');
var request = require('request');
var linters = require('./linters');

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
  lintAll: function (repo, callback) {
    var repoURL = 'https://api.github.com/repos/' + repo;
    async.parallel([
      function (callback) {
        githubRequest(repoURL, function (error, response, body) {
          if (!error && response.statusCode !== 200) {
            error = 'HTTP Error ' + response.statusCode;
          }
          callback(error, body);
        });
      },
      function (callback) {
        githubRequest(repoURL + '/commits', function (error, response, body) {
          if (!error && response.statusCode !== 200) {
            error = 'HTTP Error ' + response.statusCode;
          }
          callback(error, body);
        });
      }
    ], function (error, data) {
      if (error) {
        callback(error);
      } else {
        callback(null, linters.map(function (linter) {
          return {
            message: linter.message,
            result: linter.lint.apply(linter, data)
          };
        }));
      }
    });
  }
};
