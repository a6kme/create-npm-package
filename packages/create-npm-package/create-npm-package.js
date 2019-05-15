#!/usr/bin/env node
const os = require('os');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
var spawn = require('cross-spawn');
const inquirer = require('inquirer');
const commander = require('commander');
const execSync = require('child_process').execSync;
const validateProjectName = require('validate-npm-package-name');
const { validateUsername, JsType, camelCased } = require('./utils');
const { configureWebpack } = require('./configure-webpack');

/******* Below code snippets are taken from https://github.com/facebook/create-react-app/ *******/

// These files should be allowed to remain on a failed install,
// but then silently removed during the next create.
const errorLogFilePatterns = [
  'npm-debug.log',
  'yarn-error.log',
  'yarn-debug.log'
];

// If project only contains files generated by GH, it’s safe.
// Also, if project contains remnant error logs from a previous
// installation, lets remove them now.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebook/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root, name) {
  const validFiles = [
    '.DS_Store',
    'Thumbs.db',
    '.git',
    '.gitignore',
    '.idea',
    'README.md',
    'LICENSE',
    '.hg',
    '.hgignore',
    '.hgcheck',
    '.npmignore',
    'mkdocs.yml',
    'docs',
    '.travis.yml',
    '.gitlab-ci.yml',
    '.gitattributes'
  ];
  console.log();

  const conflicts = fs
    .readdirSync(root)
    .filter(file => !validFiles.includes(file))
    // IntelliJ IDEA creates module files before CRA is launched
    .filter(file => !/\.iml$/.test(file))
    // Don't treat log files from previous installation as conflicts
    .filter(
      file => !errorLogFilePatterns.some(pattern => file.indexOf(pattern) === 0)
    );

  if (conflicts.length > 0) {
    console.log(
      `The directory ${chalk.green(name)} contains files that could conflict:`
    );
    console.log();
    for (const file of conflicts) {
      console.log(`  ${file}`);
    }
    console.log();
    console.log(
      'Either try using a new directory name, or remove the files listed above.'
    );

    return false;
  }

  // Remove any remnant files from a previous installation
  const currentFiles = fs.readdirSync(path.join(root));
  currentFiles.forEach(file => {
    errorLogFilePatterns.forEach(errorLogFilePattern => {
      // This will catch `(npm-debug|yarn-error|yarn-debug).log*` files
      if (file.indexOf(errorLogFilePattern) === 0) {
        fs.removeSync(path.join(root, file));
      }
    });
  });
  return true;
}

/****************************** Code snippets end ******************************/

function isInGitRepository(appPath) {
  try {
    execSync('git rev-parse --is-inside-work-tree', {
      cwd: appPath,
      stdio: 'ignore'
    });
    return true;
  } catch (e) {
    return false;
  }
}

function isInMercurialRepository(appPath) {
  try {
    execSync('hg --cwd . root', { cwd: appPath, stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function tryGitInit(appPath, repositoryPath) {
  let didInit = false;
  let options = { cwd: appPath, stdio: 'ignore' };
  try {
    execSync('git --version', options);

    if (isInGitRepository(appPath) || isInMercurialRepository(appPath)) {
      return false;
    }

    execSync('git init', options);
    didInit = true;

    execSync(`git remote add origin ${repositoryPath}`, options);

    execSync('git add -A', options);
    execSync('git commit -m "Initial commit from Create Npm Package"', options);
    return true;
  } catch (e) {
    if (didInit) {
      // If we successfully initialized but couldn't commit,
      // maybe the commit author config is not set.
      // In the future, we might supply our own committer
      // like Ember CLI does, but for now, let's just
      // remove the Git files to avoid a half-done state.
      try {
        // unlinkSync() doesn't work on directories.
        fs.removeSync(path.join(appPath, '.git'));
      } catch (removeErr) {
        // Ignore.
      }
    }
    return false;
  }
}

function createNpmPackage() {
  // TODO: Also used commander, and skip prompts if configurations are given.
  // A user of CLI can also invoke it using a script

  let packageName;
  const packageJson = require('./package.json');
  const program = new commander.Command('create-npm-package')
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
      packageName = name;
    })
    .parse(process.argv);

  if (typeof packageName === 'undefined') {
    console.error('Please specify the package directory:');
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('<package-directory>')}`
    );
    console.log();
    console.log('For example:');
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('my-npm-package')}`
    );
    console.log();
    console.log(
      `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  const validationResult = validateProjectName(packageName);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${packageName}"`
      )} because of npm naming restrictions:`
    );
    process.exit(1);
  }

  inquirer
    .prompt([
      {
        type: 'list',
        name: 'jsType',
        message: 'What JavaScript flavour you want?',
        choices: [JsType.ES5, JsType.ES6, JsType.TypeScript]
      },
      {
        type: 'input',
        name: 'npmUsername',
        message: 'What is your npmjs.com username?',
        validate: function(value) {
          if (!value) {
            return 'username can not be empty';
          }
          if (validateUsername(value)) {
            return true;
          }
          return `Please check the username ${chalk.red(`"${value}"`)}`;
        }
      },
      {
        type: 'input',
        name: 'githubUsername',
        message: 'What is your github.com username?',
        validate: function(value) {
          if (!value) {
            return 'username can not be empty';
          }
          if (validateUsername(value)) {
            return true;
          }
          return `Please check the username ${chalk.red(`"${value}"`)}`;
        }
      },
      {
        type: 'confirm',
        name: 'willUseInBrowser',
        message: `Are you creating this package to be used as a ${chalk.magenta(
          `"<script>"`
        )} tag in Browser?`
      }
    ])
    .then(answeres => {
      run({
        packageName: packageName,
        ...answeres
      });
    });
}

createNpmPackage();

/**
 * Run after taking prompts from user for creating the package
 *
 * @param {*} { packageName, npmUsername, githubUsername, jsType }
 */
function run({
  packageName,
  npmUsername,
  githubUsername,
  jsType,
  willUseInBrowser
}) {
  const root = path.resolve(packageName);
  const appName = path.basename(root);

  // Create a directory with package-name
  fs.ensureDirSync(appName);

  // If there are conflicting files in the directory, which we might override,
  // do not proceed
  if (!isSafeToCreateProjectIn(root, appName)) {
    process.exit(1);
  }

  // Start creating package.json at the destination
  const packageJson = {
    name: `@${npmUsername}/${appName}`, // Creating scoped package to reduce name conflicts
    version: '0.1.0',
    private: true,
    repository: {
      type: 'git',
      url: `https://github.com/${githubUsername}/${appName}.git`
    },
    author: npmUsername,
    engines: {
      node: '>=8.10'
    }
  };
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );

  // configure package.json scripts
  configurePackageJsonScripts(willUseInBrowser, root);

  // configure webpack
  configureWebpack(jsType, willUseInBrowser, root, packageName);

  // Copy template files to new package folder
  copyTemplateFilesToRoot(jsType, root);

  // Create template index.html file
  if (willUseInBrowser) {
    const source = fs.readFileSync(
      path.join(__dirname, '/templates/index.html'),
      { encoding: 'UTF-8' }
    );
    const compiled = _.template(source);
    fs.writeFileSync(
      path.join(root, 'index.html'),
      compiled({ packageName: camelCased(packageName) })
    );
  }

  // Run npm install in the directory to install the packages
  installDevDependencies(jsType, willUseInBrowser, root);

  // configure eslint
  configureEslintrc(jsType, root);

  // Initialize a git repository
  if (tryGitInit(root, packageJson.repository.url)) {
    console.log();
    console.log(chalk.green('Initialized a git repository.'));
  }
}

function copyTemplateFilesToRoot(jsType, root) {
  // Name of template directory from jsType es5/ es6/ typescript
  const templateDir = `/template-${jsType.toLowerCase()}`;

  // Copy the template files to root
  fs.copySync(path.join(__dirname, '/templates', templateDir), root);

  // Copy common linting and config files
  fs.copySync(path.join(__dirname, '/templates/common'), root);
}

/**
 * Get devDependencies for appropriate JavaScript flavour
 *
 * @param {*} jsType
 * @returns devDependencies
 */
function installDevDependencies(jsType, willUseInBrowser, root) {
  const devDependencies = [
    'eslint',
    'eslint-config-prettier',
    'eslint-plugin-prettier',
    'jest',
    'prettier',
    'webpack',
    'webpack-cli',
    'clean-webpack-plugin'
  ];

  if (jsType === JsType.ES6) {
    devDependencies.push(
      '@babel/core',
      '@babel/preset-env',
      'babel-eslint',
      'babel-loader'
    );
  } else if (jsType === 'TypeScript') {
    devDependencies.push('typescript');
  }

  if (willUseInBrowser) {
    devDependencies.push('webpack-dev-server', 'html-webpack-plugin');
  }

  const command = 'npm';
  const args = ['install', '--save-dev'];
  devDependencies.forEach(function(value) {
    args.push(value);
  });
  devDependencies.forEach(function(value) {
    args.push(value);
  });

  console.log(chalk.green('Installing dependencies...'));
  console.log();

  const proc = spawn.sync(command, args, { cwd: root, stdio: 'inherit' });
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`);
    return;
  }
}

function configureEslintrc(jsType, root) {
  // "parser": "babel-eslint", in eslintrc if jsType = ES6
  if (jsType === JsType.ES6) {
    const eslintrcJson = JSON.parse(
      fs.readFileSync(path.join(root, '.eslintrc'))
    );
    eslintrcJson.parser = 'babel-eslint';
    fs.writeFileSync(
      path.join(root, '.eslintrc'),
      JSON.stringify(eslintrcJson, null, 2) + os.EOL
    );
  }
}

function configurePackageJsonScripts(willUseInBrowser, root) {
  const packageJson = require(path.join(root, 'package.json'));
  packageJson.scripts = {
    test: 'jest',
    build: 'webpack'
  };
  if (willUseInBrowser) {
    packageJson.scripts.start = 'webpack-dev-server';
  }
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );
}
