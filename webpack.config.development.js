const { merge } = require('webpack-merge')
const path = require('path')

const config = require('./webpack.config')

module.exports = merge(config, {
  mode: 'development',
  devtool: 'inline-source-map',

    devServer:{
      devMiddleware: { //Carlos of the future, be careful for future updates here
        writeToDisk: true
      }
    },

    output: {
      path: path.resolve(__dirname, 'public'),
    },
});