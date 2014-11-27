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
};
var commitOptions = _.extend(options, { url: repoURL + '/commits' });

module.exports = {
  linters: [
    {
      message: 'has commits',
      lint: function (_, commits) {
        return commits.length > 0;
      }
    },
    {
      message: 'has a lowercase name',
      lint: function (repo) {
        return /^[a-z\-_]+$/.test(repo.name);
      }
    },
    {
      message: 'has a description',
      lint: function (repo) {
        return Boolean(repo.full_name);
      }
    },
    {
      message: 'default branch is master',
      lint: function (repo) {
        return repo.default_branch === 'master';
      }
    },
    {
      message: 'has issues',
      lint: function (repo) {
        return Boolean(repo.has_issues);
      }
    },
    {
      message: 'has a homepage if it is using GitHub Pages',
      lint: function (repo) {
        return repo.has_pages ? Boolean(repo.homepage) : true;
      }
    }
  ],
  lintAll: function (callback) {
    request(options, function (err, repo) {
      request(commitOptions, function (err, commits) {
        callback(err, module.exports.linters.map(function (linter) {
          return {
            message: linter.message,
            result: linter.lint(repo, commits)
          };
        }));
      });
    });
  }
};
