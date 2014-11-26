#!/usr/bin/env node
var ghlint = require('./index');

ghlint.lintAll().each(function (linter) {
  console.log(linter.message + ': ' + linter.result);
});
