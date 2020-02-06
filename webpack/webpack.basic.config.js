const path = require('path')
const HtmlWebPackPlugin = require("html-webpack-plugin");
const WebpackShellPlugin = require('webpack-shell-plugin');

const REACT_PATH = path.resolve(__dirname, '../src')
const BUILD_PATH = path.resolve(__dirname, '../dist')

module.exports = {
  entry: {
    root: path.resolve(REACT_PATH, 'App.js')
  },
  output: {
    path: BUILD_PATH,
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  target: 'web',
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        },
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: REACT_PATH,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react'
              ],
              plugins: [
                [
                  '@babel/plugin-proposal-class-properties',
                  {
                    'loose': true
                  }
                ],
                [
                  '@babel/plugin-syntax-dynamic-import'
                ]
              ]
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              outputPath: '../'
            }
          }
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: '10000',
              name: '[path][name].[ext]',
              outputPath: '../'
            }
          }
        ]
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
    ]
  },
  performance: {
    maxEntrypointSize: 400000,
    maxAssetSize: 100000,
    hints: 'warning'
  },
  plugins: [ 
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    new WebpackShellPlugin({
      onBuildEnd: ['npm run server']
    })
  ]
}
