const path = require('path');
const fs = require('fs-extra');
const { JsType, camelCased } = require('./utils');

/**
 * Configure webpack for various JavaScript flavour.
 * output.libraryTarget is required to output the library in appropriate format
 * where it can be loaded.
 *
 * @param {*} jsType
 * @param {*} willUseInBrowser
 * @param {*} root
 * @param {*} packageName
 */

function configureWebpack(jsType, willUseInBrowser, root, packageName) {
  const writeStream = fs.createWriteStream(
    path.join(root, 'webpack.config.js')
  );
  const camelCasedPackageName = camelCased(packageName);
  writeStream.write(`const path = require('path');\n`);
  writeStream.write(
    `const CleanWebpackPlugin = require('clean-webpack-plugin');\n`
  );
  if (willUseInBrowser) {
    writeStream.write(
      `const HtmlWebpackPlugin = require('html-webpack-plugin');\n`
    );
  }

  let entryFile, rules, plugins;

  // Set up rules
  if (jsType === JsType.ES6) {
    entryFile = './src/index.js';
    rules = `[
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]`;
  } else if (jsType === JsType.TypeScript) {
    entryFile = './src/index.ts';
    rules = `[
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader'
        }
      }
    ]`;
  }

  // Set up plugins
  if (willUseInBrowser) {
    plugins = `[
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: '${camelCasedPackageName}',
      template: 'index.html'
    })
  ]`;
  } else {
    plugins = `[
    new CleanWebpackPlugin(),
  ]`;
  }

  writeStream.write(`
module.exports = {
  entry: '${entryFile}',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '${packageName}.js',
    library: '${camelCasedPackageName}',`);

  if (willUseInBrowser) {
    writeStream.write(`
    libraryTarget: 'umd',
    globalObject: 'this'
  },`);
  } else {
    writeStream.write(`
    libraryTarget: 'commonjs2'
  },`);
  }
  writeStream.write(`
  module: {
    rules: ${rules}
  },
  plugins: ${plugins}
};
`);
  writeStream.end();
  writeStream.close();
}

exports.configureWebpack = configureWebpack;
