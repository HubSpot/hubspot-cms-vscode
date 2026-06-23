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

  // processFieldsJs is bundled as a second entry so it is available in dist/
  // when handleFieldsJS.js forks it at runtime (node_modules is not shipped).
  entry: {
    extension: './src/extension.ts',
    processFieldsJs: path.resolve(
      __dirname,
      'node_modules/@hubspot/local-dev-lib/lib/cms/processFieldsJs.js'
    ),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  devtool: 'source-map',
  externals: [
    {
      vscode: 'commonjs vscode',
      '@aws-sdk/client-s3': 'commonjs @aws-sdk/client-s3',
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
            options: {
              // Only type-check files webpack actually bundles, not the full
              // TypeScript project — keeps test files out of the webpack build.
              onlyCompileBundledFiles: true,
            },
          },
        ],
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
      {
        // Replaces import.meta.url with a runtime expression so webpack does
        // not bake in the build machine's absolute path, which crashes on
        // Windows with "File URL path must be absolute".
        test: /\.js$/,
        include: path.resolve(__dirname, 'node_modules'),
        loader: path.resolve(__dirname, 'scripts/patchImportMetaUrl.js'),
        enforce: 'pre',
      },
      {
        // Prevents webpack from transforming the dynamic import() in
        // processFieldsJs.js so Node.js loads user fields.js files natively.
        test: /processFieldsJs\.js$/,
        loader: path.resolve(__dirname, 'scripts/patchProcessFieldsJs.js'),
        enforce: 'pre',
      },
    ],
  },
  plugins: [...optionalPlugins],
};
module.exports = config;
