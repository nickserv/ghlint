// Exposes an Array of Linters, which can be accessed with `ghlint.linters`. Every Linter is an Object with a message field and a lint method.
//
// ## Linter Properties
// ### message (String)
// A short description of what the Linter asserts.
// ### lint (function)
// Must be given the reponse bodies of three GitHub API endpoints for a specific repository as parameters: [/repos/:owner](https://developer.github.com/v3/repos/#get), [/repos/:owner/:repo/commits](https://developer.github.com/v3/repos/commits/), and [/repos/:owner/:repo/contents](https://developer.github.com/v3/repos/contents/). These parameters are named repo, commits, and contents in the source respectively. Returns true if the Linter passes (if the repo satisfies the Linter's description) and false if it fails.
module.exports = [
  {
    message: 'has commits',
    lint: function (repo, commits) {
      return commits.length > 0;
    }
  },

  {
    message: 'has a lowercase name',
    lint: function (repo) {
      // Name should only contain lowercase letters, dashes, and underscores.
      return /^[a-z\-_]+$/.test(repo.name);
    }
  },

  {
    message: 'has a description',
    lint: function (repo) {
      return Boolean(repo.full_name);
    }
  },

  {
    message: 'default branch is master',
    lint: function (repo) {
      return repo.default_branch === 'master';
    }
  },

  {
    message: 'has issues',
    lint: function (repo) {
      return Boolean(repo.has_issues);
    }
  },

  {
    message: 'has a homepage if it is using GitHub Pages',
    lint: function (repo) {
      // This will always pass if the repo isn't using GitHub Pages.
      return repo.has_pages ? Boolean(repo.homepage) : true;
    }
  },

  {
    message: 'has a license file in the root directory',
    lint: function (repo, commits, contents) {
      // At least one file in the root directory should have "license" in its name (case insensitive).
      return contents.some(function (content) {
        return content.type === 'file' && /license/i.test(content.name);
      });
    }
  },

  {
    message: 'has a readme file in the root directory',
    lint: function (repo, commits, contents) {
      // At least one file in the root directory should have "readme" in its name (case insensitive).
      return contents.some(function (content) {
        return content.type === 'file' && /readme/i.test(content.name);
      });
    }
  }
];
