const webpack = require("webpack");
const dotenv = require("dotenv");

// Load .env safely (won't crash if missing)
const envResult = dotenv.config();
const env = envResult.parsed || {};

// Reduce to a DefinePlugin-friendly object
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: false }
          }
        ]
      }
    ]
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 600,
    poll: 1000
  },
  plugins: [
    new webpack.DefinePlugin(envKeys)

  ]
};
