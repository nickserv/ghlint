#!/usr/bin/env node
var ghlint = require('./index');
var Table = require('cli-table');

var repo = process.argv[2];
if (repo) {
  ghlint.lintAll(repo, function (err, linters) {
    if (err) {
      console.error(err);
    } else {
      var table = new Table({ head: ['Linter', 'Status'] });
      linters.forEach(function (linter) {
        table.push([linter.message, linter.result]);
      });
      console.log(table.toString());
    }
  });
} else {
  console.error('Usage: ghlint <repo>');
}
