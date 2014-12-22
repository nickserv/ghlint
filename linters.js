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
      return repo.has_pages ? Boolean(repo.homepage) : true;
    }
  },
  {
    message: 'has a license file in the root directory',
    lint: function (repo, commits, contents) {
      return contents.some(function (content) {
        return content.type === 'file' && /license/i.test(content.name);
      });
    }
  }
];
