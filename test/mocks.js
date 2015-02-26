var nock = require('nock');
var githubMock = nock('https://api.github.com')
                   .filteringPath(/\?.*$/, '')
                   .persist();

// GitHub Responses
githubMock.get('/repos/mock_user/mock_repo')
          .reply(200, {});
githubMock.get('/repos/mock_user/mock_repo/commits')
          .reply(200, []);
githubMock.get('/repos/mock_user/mock_repo/contents')
          .reply(200, [1, 2, 3]);
githubMock.get('/repos/mock_user/mock_repo_2')
          .reply(200, {});
githubMock.get('/repos/mock_user/mock_repo_2/commits')
          .reply(200, {});
githubMock.get('/repos/mock_user/mock_repo_2/contents')
          .reply(200, {});
githubMock.get('/users/mock_user/repos')
          .reply(200, [
            {
              name: 'mock_repo',
              owner: { login: 'mock_user' }
            },
            {
              name: 'mock_repo_2',
              owner: { login: 'mock_user' }
            }
          ]);

// GitHub 404s
[
  '/repos/fake_user/mock_repo',
  '/repos/fake_user/mock_repo/commits',
  '/repos/fake_user/mock_repo/contents',
  '/repos/mock_user/fake_repo',
  '/repos/mock_user/fake_repo/commits',
  '/repos/mock_user/fake_repo/contents',
  '/users/fake_user/repos'
].forEach(function (path) {
  githubMock.get(path).reply(404, {
    message: 'Not Found',
    documentation_url: 'https://developer.github.com/v3'
  });
});
