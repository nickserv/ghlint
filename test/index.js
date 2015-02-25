var assert = require('assert');
var ghlint = require('../index');

describe('ghlint', function () {
  describe('.linters', function () {
    it('has multiple linters', function () {
      assert(ghlint.linters.length > 1);
    });

    it('has linters with a String message', function () {
      ghlint.linters.forEach(function (linter) {
        assert(linter.message);
        assert.equal(typeof linter.message, 'string');
      });
    });

    it('has linters with a lint function', function () {
      ghlint.linters.forEach(function (linter) {
        assert(linter.lint);
        assert.equal(typeof linter.lint, 'function');
      });
    });
  });

  describe('.lintRepo()', function () {
    context('with a real repo', function () {
      it('passes valid Results', function (done) {
        ghlint.lintRepo('nicolasmccurdy', 'ghlint', function (error, results) {
          assert.ifError(error);
          assert(results.length > 1);
          results.forEach(function (result) {
            assert(result.message);
            assert(typeof result.message, 'string');
            assert(typeof result.result, 'boolean');
          });
          done();
        });
      });
    });

    context('with a fake repo', function () {
      it('passes a "Not Found" error', function (done) {
        ghlint.lintRepo('nicolasmccurdy', 'qwertyuiop', function (error) {
          assert(error);
          assert.equal(error.message, 'Not Found');
          done();
        });
      });
    });

    context('with a fake owner', function () {
      it('passes a "Not Found" error', function (done) {
        ghlint.lintRepo('login', 'repo', function (error) {
          assert(error);
          assert.equal(error.message, 'Not Found');
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
          assert(repoResults.length > 1);
          repoResults.forEach(function (result) {
            assert(typeof result.owner, 'string');
            assert(typeof result.name, 'string');
            assert(typeof result.results, 'object');
            assert(result.results.length);
          });
          done();
        });
      });
    });

    context('with a fake user', function () {
      it('passes a "Not Found" error', function (done) {
        ghlint.lintReposByOwner('login', function (error) {
          assert(error);
          assert.equal(error.message, 'Not Found');
          done();
        });
      });
    });
  });
});
