#!/usr/bin/env node
// The CLI for ghlint.

var colors = require('colors');
var ghlint = require('./index');
var util = require('util');

// Given the owner and name of a repo, and the results for a specific invocation of `lintRepo()`, this will print out the repo's full name and its results as a colored list with check marks next to passing linters.
function printResults(owner, repo, results) {
  console.log(owner + '/' + repo + ':');

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

// The query is the first argument of the ghlint command. The query can either represent a specific repo in the format "owner/repository", or an owner with just the name of the owner (which triggers the Linters for all of the owner's repositories).
if (process.argv[2]) {
  var query = process.argv[2].split('/');
  var owner = query[0];
  var repo = query[1];
}

if (owner) {
  // If a specific repo is given...
  if (repo) {
    ghlint.lintRepo(owner, repo, function (error, linters) {
      if (error) {
        console.error(error.message);
      } else {
        printResults(owner, repo, linters);
      }
    });
  } else {
    // If an owner is given...
    ghlint.lintReposByOwner(owner, function (error, repos) {
      if (error) {
        console.error(error.message);
      } else {
        repos.forEach(function (repoResults, index) {
          // Print a blank line between the results for multiple repos.
          if (index !== 0) {
            console.log();
          }
          printResults(repoResults.owner, repoResults.name, repoResults.results);
        });
      }
    });
  }
} else {
  // If the repo argument is missing, show usage.
  console.error('Usage: ghlint <repo>');
}
