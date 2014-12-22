// The main module for ghlint. You can access this with `require('ghlint')`.

var async = require('async');
var https = require('https');
var linters = require('./linters');

// The query string for GitHub API requests. Includes ghlint's ID and secret, taken from the `$GHLINT_ID` and `$GHLINT_SECRET` environment variables. These should never be shared.
var queryString = '?client_id=' + process.env.GHLINT_ID + '&client_secret=' + process.env.GHLINT_SECRET;

// Performs a GET request on a GitHub API endpoint. repoURL must be the full path to a GitHub API endpoint, starting with /. The callback is passed an error (may include GitHub API errors and HTTP errors) and the full response body.
function githubRequest(repoURL, callback) {
  https.get({
    host: 'api.github.com',
    path: repoURL + queryString,
    headers: {
      Accept: 'application/vnd.github.v3',
      'User-Agent': 'ghlint'
    }
  }, function (res) {
    var data = '';

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function () {
      data = JSON.parse(data);

      // If there is an HTTP error, or a message field in the response, the callback is given an error.
      if (res.statusCode === 200) {
        callback(null, data);
      } else if (data.message) {
        callback(new Error(data.message));
      } else {
        callback(new Error('Error ' + res.statusCode));
      }
    });
  }).on('error', callback);
}

module.exports = {
  // Exposes the Array of Linters. See the `linters.js` documentation for more details.
  linters: linters,

  // Runs all Linters on a specific repo. repo must be a String in the form "username/repository". The callback is passed an error and an Array of Results. A Result is the same as a Linter (see `linters.js`), except that the lint function is replaced with the Boolean result of the Linter (true is passing, false is failing).
  lintRepo: function (repo, callback) {
    var repoURL = 'https://api.github.com/repos/' + repo;

    async.parallel([
      function (callback) {
        githubRequest(repoURL, callback);
      },
      function (callback) {
        githubRequest(repoURL + '/commits', callback);
      },
      function (callback) {
        githubRequest(repoURL + '/contents', callback);
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
    githubRequest('https://api.github.com/users/' + user + '/repos', function (error, body) {
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
