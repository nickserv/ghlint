var async = require('async');
var https = require('https');
var linters = require('./linters');

var queryString = '?client_id=' + process.env.GHLINT_ID + '&client_secret=' + process.env.GHLINT_SECRET;

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
  linters: linters,
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
