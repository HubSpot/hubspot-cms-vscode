//@ts-check

'use strict';

const { IgnorePlugin } = require('webpack');
const path = require('path');
const optionalPlugins = [];

// This prevents an error when compiling on Windows
// See https://github.com/paulmillr/chokidar/issues/828#issuecomment-854474603
if (process.platform !== 'darwin') {
  optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^fsevents$/ }));
}

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  devtool: 'source-map',
  externals: [
    {
      vscode: 'commonjs vscode',
    },
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
    ],
  },
  plugins: [...optionalPlugins],
};
module.exports = config;
