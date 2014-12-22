#!/usr/bin/env node
// The CLI for ghlint.

var colors = require('colors');
var ghlint = require('./index');
var util = require('util');

// Given a repo (a String in the format "username/repository") and the results for a specific invocation of `lintRepo()`, this will print out the repo and its results as a colored list with check marks next to passing linters.
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

// If `--no-color` has been used, colors.js has already processed it at this point. Remove `--no-color` from the args if it is still there.
process.argv = process.argv.filter(function (arg) {
  return arg !== '--no-color';
});

// The repo is the first argument of the ghlint command, in the format "username/repository". repo can also just be a "username", which triggers the Linters for all of the user's repositories.
var repo = process.argv[2];

if (repo) {
  // If a specific repo is given...
  if (repo.indexOf('/') > -1) {
    ghlint.lintRepo(repo, function (err, linters) {
      if (err) {
        console.error(err.message);
      } else {
        printResults(repo, linters);
      }
    });
  } else {
    // If a username is given...
    ghlint.lintUserRepos(repo, function (err, repos) {
      if (err) {
        console.error(err.message);
      } else {
        repos.forEach(function (repoResults, index) {
          // Print a blank line between the results for multiple repos.
          if (index !== 0) {
            console.log();
          }
          printResults(repoResults.name, repoResults.results);
        });
      }
    });
  }
} else {
  // If the repo argument is missing, show usage.
  console.error('Usage: ghlint <repo>');
}
