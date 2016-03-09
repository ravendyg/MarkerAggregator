/* global process, __dirname */
'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');

console.log('development' ? "source-map" : null);

module.exports = {
    entry: {
        app: "./src/scripts/app.ts"   
    },
    output: {
        path: __dirname + '/build/scripts/',
        filename: "[name].min.js",
        library: "[name]"
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js', '.tsx', '.jsx', '.html']
    },
    watch: NODE_ENV === 'development',
    devtool: NODE_ENV === 'development' ? "source-map" : null,
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader' },
            { test: /\.tsx?$/, loader: 'babel!ts-loader' }
        ]
    },
    // plugins: NODE_ENV === 'development' ? [] : [
    //     new webpack.DefinePlugin({
    //         'process.env': {
    //         'NODE_ENV': JSON.stringify('production')
    //         }
    //     }),
    //     new webpack.optimize.DedupePlugin(),
    //     new webpack.optimize.OccurenceOrderPlugin(),
    //     new webpack.optimize.UglifyJsPlugin({
    //         mangle: true,
    //         sourcemap: false,
    //         compress: {
    //             warnings: false,
    //             dead_code: true,
    //             drop_debugger: true,
    //             conditionals: true,
    //             unused: true,
    //             drop_console: true
    //         }            
    //     }),
    // ]
}