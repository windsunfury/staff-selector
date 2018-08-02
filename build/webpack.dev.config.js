const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./webpack.base.config');

config.devtool = 'inline-source-map';

let port = '8008';

config.output.publicPath = '/';
config.devServer = {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    port: port,
    contentBase: './',
    proxy: {
        "/ss": {
            target: "http://localhost:" + port,
            secure: false,
            pathRewrite: {
                // '^/PostRequire': '',
                '^/ss/.*': 'index.html'
            }
        }
    }
};

config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: '"development"'
        }
    }),

    new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        inject: true,
        hash: true,
        minify: {
            removeComments: true,
            collapseWhitespace: false
        },
        path: config.output.publicPath,
        chunks: ['index']
    })
]);

module.exports = config;
