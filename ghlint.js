var _ = require('underscore');
var Promise = require('bluebird');
var request = require('request-promise');

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

var linters = [
  {
    message: 'has commits',
    lint: function (repoURL) {
      return request(_.extend(options, { url: repoURL + '/commits' })).then(function (body) {
        return body.length > 0;
      });
    }
  },
  {
    message: 'has a lowercase name',
    lint: function (repoURL) {
      return request(options).then(function (body) {
        return /^[a-z\-_]+$/.test(body.name);
      });
    }
  },
  {
    message: 'has a description',
    lint: function (repoURL) {
      return request(options).then(function (body) {
        return Boolean(body.full_name);
      });
    }
  },
  {
    message: 'default branch is master',
    lint: function (repoURL) {
      return request(options).then(function (body) {
        return body.default_branch === 'master';
      });
    }
  },
  {
    message: 'has issues',
    lint: function (repoURL) {
      return request(options).then(function (body) {
        return Boolean(body.has_issues);
      });
    }
  },
  {
    message: 'has a homepage if it is using GitHub Pages',
    lint: function (repoURL) {
      return request(options).then(function (body) {
        return body.has_pages ? Boolean(body.homepage) : true;
      });
    }
  }
];

function lintAll() {
  return Promise.map(linters, function (linter) {
    return linter.lint(repoURL).then(function (result) {
      return {
        message: linter.message,
        result: result
      };
    });
  });
}

lintAll().each(function (linter) {
  console.log(linter.message + ': ' + linter.result);
});
