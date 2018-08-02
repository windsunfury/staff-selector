const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const config = require('./webpack.base.config');

config.devtool = '#source-map';

config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: '"test"'
        }
    }),

    new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
            warnings: false
        }
    }),

    // extract css into its own file(需要在webpack.base.config.js中修改相应的rules)
    new ExtractTextPlugin({
      filename: 'static/css/style.css',
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: process.env.NODE_ENV == 'production'
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),

    //可以通过这个插件配置全局/共享的加载器配置，使所有的加载器都能收到这些配置
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),

    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),

    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    // 个人理解：因为限制了minChunks，所以暂时没有生成vendor-async.js
    new webpack.optimize.CommonsChunkPlugin({
      name: 'main',
      async: 'vendor-async',
      children: true
    }),

    //默认启用：无需加上
    //new webpack.optimize.OccurrenceOrderPlugin(),

    new HtmlWebpackPlugin({
        template: './index.html', //相对根目录而言
        filename: 'index.html', //相对dist而言
        inject: true,
        hash: true,
        minify: {
            removeComments: true,
            collapseWhitespace: false
        }
    }),

    new CopyWebpackPlugin([
        {
            from: './static',
            to: 'static'
        }
    ])
]);

//在npm run test后面加上--report既可以执行
if (process.env.npm_config_report) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  config.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = config;
