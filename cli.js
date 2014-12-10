#!/usr/bin/env node
var colors = require('colors');
var ghlint = require('./index');
var util = require('util');

function printResults(repo, results) {
  console.log(repo + ':');
  results.forEach(function (result) {
    var mark = result.result ? '✓' : '✖';
    var output = util.format('  %s %s', mark, result.message);
    if (colors.enabled) {
      output = output[result.result ? 'green' : 'red'];
    }
    console.log(output);
  });
}

// Remove --no-color from the args if it is there.
process.argv = process.argv.filter(function (arg) {
  return arg !== '--no-color';
});

var repo = process.argv[2];
if (repo) {
  if (repo.indexOf('/') > -1) {
    ghlint.lintRepo(repo, function (err, linters) {
      if (err) {
        console.error(err);
      } else {
        printResults(repo, linters);
      }
    });
  } else {
    ghlint.lintUserRepos(repo, function (err, repos) {
      if (err) {
        console.error(err);
      } else {
        repos.forEach(function (repoResults) {
          printResults(repoResults.name, repoResults.results);
        });
      }
    });
  }
} else {
  console.error('Usage: ghlint <repo>');
}
