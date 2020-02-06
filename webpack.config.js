const merge = require('webpack-merge');
const baseConfig = require('./webpack/webpack.basic.config.js');

module.exports = (env) => {
  if (!env) {
    throw new Error('Environment Error');
  }

  return merge(baseConfig,  require(`./webpack/webpack.${env}.config.js`))
};