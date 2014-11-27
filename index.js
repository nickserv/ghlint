var _ = require('underscore');
var async = require('async');
var request = require('request');

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
}

module.exports = {
  linters: [
    {
      message: 'has commits',
      lint: function (repoURL, callback) {
        request(_.extend(options, { url: repoURL + '/commits' }), function (err, body) {
          callback(err, body.length > 0);
        });
      }
    },
    {
      message: 'has a lowercase name',
      lint: function (repoURL, callback) {
        request(options, function (err, body) {
          callback(err, /^[a-z\-_]+$/.test(body.name));
        });
      }
    },
    {
      message: 'has a description',
      lint: function (repoURL, callback) {
        request(options, function (err, body) {
          callback(err, Boolean(body.full_name));
        });
      }
    },
    {
      message: 'default branch is master',
      lint: function (repoURL, callback) {
        request(options, function (err, body) {
          callback(err, body.default_branch === 'master');
        });
      }
    },
    {
      message: 'has issues',
      lint: function (repoURL, callback) {
        request(options, function (err, body) {
          callback(err, Boolean(body.has_issues));
        });
      }
    },
    {
      message: 'has a homepage if it is using GitHub Pages',
      lint: function (repoURL, callback) {
        request(options, function (err, body) {
          callback(err, body.has_pages ? Boolean(body.homepage) : true);
        });
      }
    }
  ],
  lintAll: function (callback) {
    async.map(module.exports.linters, function (linter, mapCallback) {
      linter.lint(repoURL, function (err, result) {
        mapCallback(err, {
          message: linter.message,
          result: result
        });
      });
    }, callback);
  }
};
