#!/usr/bin/env node
var ghlint = require('./index');
var Table = require('cli-table');

ghlint.lintAll(function (err, linters) {
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
