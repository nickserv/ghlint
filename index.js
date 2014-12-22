// The main module for ghlint. You can access this with `require('ghlint')`.

var async = require('async');
var GitHubApi = require('github');
var linters = require('./linters');

var github = new GitHubApi({ version: '3.0.0' });

// If the environment variables `$GHLINT_ID` and `$GHLINT_SECRET` are set with ghlint's ID and secret, GitHub API requests will be authenticated to increase the rate limit. The key and secret should never be shared.
if (process.env.GHLINT_ID && process.env.GHLINT_SECRET) {
  github.authenticate({
    type: 'oauth',
    key: process.env.GHLINT_ID,
    secret: process.env.GHLINT_SECRET
  });
}

module.exports = {
  // Exposes the Array of Linters. See the `linters.js` documentation for more details.
  linters: linters,

  // Runs all Linters on a specific repo. repo must be a String in the form "username/repository". The callback is passed an error and an Array of Results. A Result is the same as a Linter (see `linters.js`), except that the lint function is replaced with the Boolean result of the Linter (true is passing, false is failing).
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

  // Runs all Linters on all of a user's repos. user must be a String representing a username or organization on GitHub. The callback is passed an error and an Array of RepoResults. A RepoResult represents all Linter results for a specific repo. It is an Object with a String name representing its name (in the format "username/repository"), and a results property that exposes all Results for the repo (see documentation for `lintRepo()`).
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
              // Build an object in the RepoResult format.
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
