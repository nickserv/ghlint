var assert = require('assert');
var ghlint = require('../index');

describe('ghlint', function () {
  describe('.linters', function () {
    it('has multiple linters', function () {
      assert(ghlint.linters.length);
    });

    it('has linters with a String message', function () {
      ghlint.linters.every(function (linter) {
        return linter.message && typeof linter.message === 'string';
      });
    });

    it('has linters with a lint function', function () {
      ghlint.linters.every(function (linter) {
        return linter.message && typeof linter.message === 'function';
      });
    });
  });

  describe('.lintRepo()', function () {
    context('with a real repo', function () {
      it('passes valid Results', function (done) {
        ghlint.lintRepo('nicolasmccurdy', 'ghlint', function (error, results) {
          assert.ifError(error);
          assert(results.length);
          assert(results.every(function (result) {
            return result.message &&
                   typeof result.message === 'string' &&
                   typeof result.result === 'boolean';
          }));
          done();
        });
      });
    });

    context('with a fake repo', function () {
      it('passes a "Not Found" error', function (done) {
        ghlint.lintRepo('nicolasmccurdy', 'qwertyuiop', function (error) {
          assert(error && error.message === 'Not Found');
          done();
        });
      });
    });

    context('with a fake owner', function () {
      it('passes a "Not Found" error', function (done) {
        ghlint.lintRepo('login', 'repo', function (error) {
          assert(error && error.message === 'Not Found');
          done();
        });
      });
    });
  });

  describe('.lintReposByOwner()', function () {
    context('with a real owner', function () {
      it('passes valid RepoResults', function (done) {
        this.timeout(10000);

        ghlint.lintReposByOwner('nicolasmccurdy', function (error, repoResults) {
          assert.ifError(error);
          assert(repoResults.length);
          assert(repoResults.every(function (result) {
            return typeof result.owner === 'string' &&
                   typeof result.name === 'string' &&
                   typeof result.results === 'object' &&
                   result.results.length;
          }));
          done();
        });
      });
    });

    context('with a fake user', function () {
      it('passes a "Not Found" error', function (done) {
        ghlint.lintReposByOwner('login', function (error) {
          assert(error && error.message === 'Not Found');
          done();
        });
      });
    });
  });
});
