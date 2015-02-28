require('./helpers');

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
      context('where all linters pass', function () {
        it('passes valid Results', function (done) {
          ghlint.lintRepo('mock_user', 'mock_repo', function (error, results) {
            assert.ifError(error);
            assert(results.length > 1);
            results.forEach(function (result) {
              assert(result.message);
              assert(typeof result.message, 'string');
              assert.equal(result.result, true);
            });
            done();
          });
        });
      });

      context('where all linters fail', function () {
        it('passes invalid Results', function (done) {
          ghlint.lintRepo('mock_user', 'mock_repo_2', function (error, results) {
            assert.ifError(error);
            assert(results.length > 1);
            results.forEach(function (result) {
              assert(result.message);
              assert(typeof result.message, 'string');
              assert.equal(result.result, false);
            });
            done();
          });
        });
      });

    });

    context('with a fake repo', function () {
      it('passes a "Not Found" error', function (done) {
        ghlint.lintRepo('mock_user', 'fake_repo', function (error) {
          assert(error);
          assert.equal(error.message, 'Not Found');
          done();
        });
      });
    });

    context('with a fake owner', function () {
      it('passes a "Not Found" error', function (done) {
        ghlint.lintRepo('fake_user', 'mock_repo', function (error) {
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
        ghlint.lintReposByOwner('mock_user', function (error, repoResults) {
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
        ghlint.lintReposByOwner('fake_user', function (error) {
          assert(error);
          assert.equal(error.message, 'Not Found');
          done();
        });
      });
    });
  });
});
