// The main module for ghlint. You can access this with `require('ghlint')`.

var async = require('async');
var fs = require('fs');
var https = require('https');
var linters = require('./linters');
var path = require('path');

// Authenticate to the GitHub API with OAuth2 (if possible).
var tokenPath = path.join(process.env.HOME, '.ghlint_token');
var queryString = '';
if (fs.existsSync(tokenPath)) {
  // Use a personal access token stored in `~/.ghlint_token`. Note that ghlint only uses public access for now, so you won't need to enable any scopes.
  queryString = '?access_token=' + fs.readFileSync(tokenPath, { encoding: 'utf-8' }).trim();
} else if (process.env.GHLINT_ID && process.env.GHLINT_SECRET) {
  // Use ghlint's ID and secret, stored in the `$GHLINT_ID` and `$GHLINT_SECRET` environment variables. These should never be shared.
  queryString = '?client_id=' + process.env.GHLINT_ID + '&client_secret=' + process.env.GHLINT_SECRET;
}

// Performs a GET request on a GitHub API endpoint. repoURL must be the full path to a GitHub API endpoint, starting with /. The callback is passed an error (may include GitHub API errors and HTTP errors) and the full response body.
function githubRequest(url, callback) {
  https.get({
    hostname: 'api.github.com',
    path: url + queryString,
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

  // Runs all Linters on a specific repo. owner must be a String representing the owner (user or organization) of the repo, and repo must be a String representing its name. The callback is passed an error and an Array of Results representing each failing Linter. A Result is the same as its Linter's message (see `linters.js`).
  lintRepo: function (owner, repo, callback) {
    var url = '/repos/' + owner + '/' + repo;

    async.parallel([
      function (callback) {
        githubRequest(url, callback);
      },
      function (callback) {
        githubRequest(url + '/commits', callback);
      },
      function (callback) {
        githubRequest(url + '/contents', callback);
      }
    ], function (error, data) {
      if (error) {
        callback(error);
      } else {
        callback(null, linters.filter(function (linter) {
          return !linter.lint.apply(linter, data);
        }).map(function (linter) {
          return linter.message;
        }));
      }
    });
  },

  // Runs all Linters on all of an owner's repos. owner must be a String representing a user or organization on GitHub. The callback is passed an error and an Array of RepoResults. A RepoResult represents all Linter results for a specific repo. It is an Object with a String owner representing its owner, a string name representing its name, and a results property that exposes all Results for the repo's failing Linters (see documentation for `lintRepo()`).
  lintReposByOwner: function (owner, callback) {
    githubRequest('/users/' + owner + '/repos', function (error, body) {
      if (error) {
        callback(error);
      } else {
        async.map(body, function (repo, callback) {
          module.exports.lintRepo(repo.owner.login, repo.name, function (error, body) {
            if (error) {
              callback(error);
            } else {
              // Build an object in the RepoResult format.
              callback(error, {
                owner: repo.owner.login,
                name: repo.name,
                results: body
              });
            }
          });
        }, callback);
      }
    });
  }
};
