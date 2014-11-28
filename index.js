var _ = require('underscore');
var async = require('async');
var request = require('request');
var linters = require('./linters');

var repoURL = 'https://api.github.com/repos/nicolasmccurdy/repos';
var options = {
  headers: {
    Accept: 'application/vnd.github.v3',
    'User-Agent': 'ghlint'
  },
  qs: {
    client_id: process.env.GHLINT_ID,
    client_secret: process.env.GHLINT_SECRET
  },
  url: repoURL
};
var commitOptions = _.extend(options, { url: repoURL + '/commits' });

module.exports = {
  linters: linters,
  lintAll: function (callback) {
    request(options, function (err, repo) {
      request(commitOptions, function (err, commits) {
        callback(err, linters.map(function (linter) {
          return {
            message: linter.message,
            result: linter.lint(repo, commits)
          };
        }));
      });
    });
  }
};
