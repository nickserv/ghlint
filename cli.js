#!/usr/bin/env node
var ghlint = require('./index');

function printResults(repo, results) {
  console.log(repo + ':');
  results.forEach(function (result) {
    var mark = result.result ? '✓' : '✖';
    console.log('  %s %s', mark, result.message);
  });
}

var repo = process.argv[2];
if (repo) {
  ghlint.lintAll(repo, function (err, linters) {
    if (err) {
      console.error(err);
    } else {
      printResults(repo, linters);
    }
  });
} else {
  console.error('Usage: ghlint <repo>');
}
