# CLI tool to create npm package
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)


## Why?
Often I had to create NPM packages, and I found myself creating the same boilerplate code again and again. For very simple and tiny CommonJS modules, I had to configure `webpack` differently than a library which I had to compile for `UMD`. `TypeScript` configuration and devDependencies were different than that of `ES6`. So, I figured better to create a CLI, which takes care of all that out of the box. Just answer few propmts, and the initial setup is done. 

NOTE: You might not need it altogether, if you do not plan to use `TypeScript` or unsupported NodeJs features, like `ES6 import`. You can simply create your files in `JavaScript`, and publish it directly to NPM, without using any bundler or compiler. 

It is needed when you are planning to expose the library as a `<script>` tag in browser, since you would want to use bundler to output one file which you can include in your HTML file. Or using experimental NodeJs features, and would want to use Babel compiler to convert it into more widely supported JavaScript. 

## How?
- `npm install -g @a6kme/create-npm-package`
- Run `create-npm-package <YOUR_PACKAGE_NAME>` command, and answer some prompts to create a folder with your package name.

After doing `npm login` in the terminal window, you can directly run `npm publish --access public`. It will test and build the package, and publish it on npm repository. 

## What?
Currently, the CLI tool is highly opinionated about the choice of tools it uses. It uses `webpack` for bundling, `jest` for testing, `eslint` for linting. It does the following for you
- Sets up the package directory with name of your package
- Creates `package.json`, with standard fields, like repository path, package name, and scripts for testing, linting etc.
- Initializes the git repository with `.gitignore` file
- Sets git remote origin with `https://github.com/<YOUR_GIT_USERNAME>/<YOUR_PACKAGE_NAME>.git`
- Adds `eslint` configuration file with appropriate parser
- Adds `webpack` builder configuration file

Check out my blog post about how to use this CLI at https://a6k.me/articles/how-to-create-and-publish-an-npm-package/
