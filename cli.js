#!/usr/bin/env node
var ghlint = require('./index');

ghlint.lintAll(function (err, linters) {
  if (err) {
    console.error(err);
  } else {
    linters.forEach(function (linter) {
      console.log(linter.message + ': ' + linter.result);
    });
  }
});
