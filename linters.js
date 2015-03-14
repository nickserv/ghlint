// Returns true if at least one file in the root directory of `contents` has a name that matches `pattern`.
function matchingFileInRoot(contents, pattern) {
  return contents.some(function (content) {
    return content.type === 'file' && pattern.test(content.name);
  });
}

// Exposes an Array of Linters, which can be accessed with `ghlint.linters`. Every Linter is an Object with a message field and a lint method.
//
// ## Linter Properties
// ### message (String)
// A short description of what went wrong (assuming the linter fails).
// ### lint (function)
// Must be given the reponse bodies of three GitHub API endpoints for a specific repository as parameters: [/repos/:owner](https://developer.github.com/v3/repos/#get), [/repos/:owner/:repo/commits](https://developer.github.com/v3/repos/commits/), and [/repos/:owner/:repo/contents](https://developer.github.com/v3/repos/contents/). These parameters are named repo, commits, and contents in the source respectively. Returns true if the Linter passes (if the repo satisfies the Linter's description) and false if it fails.
module.exports = [
  {
    message: 'missing commits',
    lint: function (repo, commits) {
      return commits.length > 0;
    }
  },

  {
    message: 'repository name should be lowercased',
    lint: function (repo) {
      // Name should only contain lowercase letters, numbers, dashes, and underscores.
      return /^[a-z\d\-_]+$/.test(repo.name);
    }
  },

  {
    message: 'missing description',
    lint: function (repo) {
      return Boolean(repo.description);
    }
  },

  {
    message: 'default branch should be master',
    lint: function (repo) {
      return repo.default_branch === 'master';
    }
  },

  {
    message: 'missing issues',
    lint: function (repo) {
      return Boolean(repo.has_issues);
    }
  },

  {
    message: 'uses GitHub Pages and is missing a homepage',
    lint: function (repo) {
      // This will always pass if the repo isn't using GitHub Pages.
      return repo.has_pages ? Boolean(repo.homepage) : true;
    }
  },

  {
    message: 'missing license',
    lint: function (repo, commits, contents) {
      return matchingFileInRoot(contents, /license/i);
    }
  },

  {
    message: 'missing readme',
    lint: function (repo, commits, contents) {
      return matchingFileInRoot(contents, /readme/i);
    }
  }
];
