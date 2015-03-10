#!/usr/bin/env node
// The CLI for ghlint.

var chalk = require('chalk');
var program = require('commander');
var util = require('util');
var ghlint = require('./index');
var pkg = require('./package.json');

// Given the owner and name of a repo, and the results for a specific invocation of `lintRepo()`, this will print out the repo's full name (which is color coded and given an icon based on its status) and a list of its failing results (if any).
function printResults(owner, repo, results) {
  var mark = results.length ? '✖' : '✓';
  var output = util.format('%s %s/%s', mark, owner, repo);
  var color = results.length ? 'red' : 'green';
  console.log(chalk[color](output));

  results.forEach(function (result) {
    console.log('  %s', result);
  });
}

program
  .version(pkg.version)
  .description(pkg.description)
  .usage('[repos...]')
  .option('--color', 'Forcibly enable colors')
  .option('--no-color', 'Forcibly disable colors')
  .parse(process.argv);

if (program.args.length) {
  program.args.forEach(function (arg) {
    // The query is the first argument of the ghlint command. The query can either represent a specific repo in the format "owner/repository", or an owner with just the name of the owner (which triggers the Linters for all of the owner's repositories).
    var query = arg.split('/');
    var owner = query[0];
    var repo = query[1];

    if (repo) {
      // If a specific repo is given...
      ghlint.lintRepo(owner, repo, function (error, linters) {
        if (error) {
          console.error(error.message);
        } else {
          printResults(owner, repo, linters);
        }
      });
    } else if (owner) {
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
  });
} else {
  // If the repo argument is missing, show usage.
  program.help();
}
