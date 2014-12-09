#!/usr/bin/env node
var ghlint = require('./index');
var Table = require('cli-table');

function printResults(results) {
  var table = new Table({ head: ['Linter', 'Status'] });
  results.forEach(function (result) {
    table.push([result.message, result.result]);
  });
  console.log(table.toString());
}

var repo = process.argv[2];
if (repo) {
  ghlint.lintAll(repo, function (err, linters) {
    if (err) {
      console.error(err);
    } else {
      printResults(linters);
    }
  });
} else {
  console.error('Usage: ghlint <repo>');
}
