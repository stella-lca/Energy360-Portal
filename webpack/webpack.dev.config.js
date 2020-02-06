module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
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
  }
}
