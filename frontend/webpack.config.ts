const fs = require('fs')
const path = require('path');
const config = require('config');

fs.writeFileSync(path.resolve(__dirname, 'build/config-bundle.json'), JSON.stringify(config))

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: [path.resolve(__dirname, 'src', 'index.tsx')],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    static: path.resolve(__dirname, 'build'),
    historyApiFallback: true, // It only needs in webpack-dev-server. See https://ui.dev/react-router-cannot-get-url-refresh/#webpack--development
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.md$|\.png$|\.jpe?g$|\.gif$|\.ttf$|\.eot$|\.woff$|\.woff2$/,
        loader: 'url-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css'],
    alias: {
      configBundle: path.resolve(__dirname, 'build/config-bundle.json'),
      '@src': path.resolve(__dirname, 'src'),
      '@test': path.resolve(__dirname, 'test'),
      '@common': path.resolve(__dirname, '..', 'common')
    },
  },
};
