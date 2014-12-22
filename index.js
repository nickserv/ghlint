var async = require('async');
var GitHubApi = require('github');
var linters = require('./linters');

var github = new GitHubApi({ version: '3.0.0' });

if (process.env.GHLINT_ID && process.env.GHLINT_SECRET) {
  github.authenticate({
    type: 'oauth',
    key: process.env.GHLINT_ID,
    secret: process.env.GHLINT_SECRET
  });
}

module.exports = {
  linters: linters,
  lintRepo: function (repo, callback) {
    var parts = repo.split('/');
    var options = {
      user: parts[0],
      repo: parts[1],
      path: ''
    };

    async.parallel([
      function (callback) {
        github.repos.get(options, callback);
      },
      function (callback) {
        github.repos.getCommits(options, callback);
      },
      function (callback) {
        github.repos.getContent(options, callback);
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
  },
  lintUserRepos: function (user, callback) {
    github.repos.getFromUser({ user: user }, function (error, body) {
      if (error) {
        callback(error);
      } else {
        async.map(body, function (repo, callback) {
          module.exports.lintRepo(repo.full_name, function (error, body) {
            if (error) {
              callback(error);
            } else {
              callback(error, {
                name: repo.full_name,
                results: body
              });
            }
          });
        }, callback);
      }
    });
  }
};
