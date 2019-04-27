#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const validateProjectName = require('validate-npm-package-name');

function createNpmPackage() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'packageName',
        message: 'What package name do you want?',
        validate: function(value) {
          if (validateProjectName(value).validForNewPackages) {
            return true;
          }
          return `Can not create a project called ${chalk.red(
            `"${value}"`
          )} because of npm naming restrictions:`;
        }
      }
    ])
    .then(answeres => {
      console.log('Answeres are ', answeres);
    });
}

createNpmPackage();
