const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const WebpackShellPlugin = require('webpack-shell-plugin');

const {
  NODE_ENV = 'production',
} = process.env;

module.exports = {
  entry: {
    server: './server.js',
  },
  mode: NODE_ENV,
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  node: {
    __dirname: false,
    __filename: false, 
  },
  watch: NODE_ENV === 'development',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildEnd: ['npm run dev']
    })
  ]
}