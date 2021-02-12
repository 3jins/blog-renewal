const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: [path.resolve(__dirname, 'src', 'index.tsx')],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'build'),
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
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css'],
  },
};
