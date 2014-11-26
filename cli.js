var ghlint = require('./ghlint');

ghlint.lintAll().each(function (linter) {
  console.log(linter.message + ': ' + linter.result);
});
