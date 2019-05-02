# CLI tool to create npm package
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Why?
Often I had to create NPM packages, and I found myself creating the same boilerplate code again and again. For very simple and tiny CommonJS modules, I had to configure `webpack` differently than a library which I had to compile for `UMD`. `TypeScript` configuration and devDependencies were different than that of `ES6`. So, I figured better to create a CLI, which takes care of all that out of the box. Just answer few propmts, and the initial setup is done. 