/* global process */
'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');

console.log('development' ? "source-map" : null);

module.exports = {
    "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
        "noLib": false,
        "sourceMap": true,
        "noImplicitAny": true,
        "removeComments": true
    },
    entry: "./src/scripts/app.ts",
    output: {
        filename: "./src/scripts/app.js",
        library: "home"
    },
    watch: NODE_ENV === 'development',
    devtool: NODE_ENV === 'development' ? "source-map" : null,
    // plugins: [
    //     new webpack.DefinePlugin({
    //         NODE_ENV: JSON.stringify(NODE_ENV),
    //         LANG: JSON.stringify('en')
    //         // USER:    
    //     })
    // ],
    resolve: {
        extensions: ['', '.ts', '.js']
    },
    module: {
        loaders: [{
        //     test: /\.js$/,
        //     exclude: /node_modules/,
        //     loader: 'babel-loader?presets[]=es2015'
        // },{
            test: /\.ts$/,
            exclude: /node_modules/,
            loader: 'webpack-typescript?module=commonjs'
        }]
    }
}