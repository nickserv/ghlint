Deprecated
==========
Use [GitHub Community Profile](https://help.github.com/articles/viewing-your-community-profile/).

ghlint
======
[![npm version](https://badge.fury.io/js/ghlint.svg)](http://badge.fury.io/js/ghlint)
[![Build Status](https://travis-ci.org/nicolasmccurdy/ghlint.svg?branch=master)](https://travis-ci.org/nicolasmccurdy/ghlint)
[![Dependency Status](https://gemnasium.com/nicolasmccurdy/ghlint.svg)](https://gemnasium.com/nicolasmccurdy/ghlint)
[![Code Climate](https://codeclimate.com/github/nicolasmccurdy/ghlint/badges/gpa.svg)](https://codeclimate.com/github/nicolasmccurdy/ghlint)

A linter for GitHub projects.

ghlint focuses on improving your GitHub project for its users and contributors. It's kind of like [flint](https://github.com/pengwynn/flint), except it knows about GitHub features and doesn't require your repository to be cloned locally.

ghlint can be used as a command line tool or a library. There is also a [web app](https://github.com/nicolasmccurdy/ghlint-web) in development.

Usage
-----
It is recommended that you register a GitHub application to increase your rate limits. Please register a GitHub application and set the `GHLINT_ID` and `GHLINT_SECRET` environment variables to your app's ID and secret.

### Command Line
Please note that the command line is experimental, still requires a client ID and secret, and may be removed in the future.

1. Install [Node](http://nodejs.org/download/).
2. `npm install -g ghlint`
3. `ghlint`

### Library
1. Install [Node](http://nodejs.org/download/).
2. `npm install --save ghlint`

API Documentation
-----------------
There's no online copy of the docs yet, but they can be generated locally by installing [docco](http://jashkenas.github.io/docco/) and running `docco *.js` in the root of the repo. Then just open `docs/index.html`.
