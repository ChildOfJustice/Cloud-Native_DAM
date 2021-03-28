const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.tsx',
    // externals: [{'aws-sdk': 'commonjs aws-sdk'}],
    //externals: [nodeExternals( { whitelist: [ 'le-challenge-s3', 'le-store-s3' ]  } ) ],
    //devtool: 'source-map',//'inline-source-map'
    output: {
        filename: 'bundle.js',
        publicPath: '/',
        path: path.resolve(__dirname, 'build'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [ "css-loader" ]
                })
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            }
        ],
    },
    resolve: {
        extensions: ['*', '.tsx', '.ts', '.mjs', '.js', '.vue', '.json', '.gql', '.graphql']
    },
    devServer: {
        contentBase: path.join(__dirname, 'build'),
        overlay: true,
        hot: true,
        compress: true,
        port: 9000,
    },
    plugins: [
        // new CopyWebpackPlugin({//just copies some files to the build dir
        //     patterns: ['public/index.html']
        // }),
        new CopyWebpackPlugin({//just copies some files to the build dir
            patterns: ['public/favicon.ico', 'public/manifest.json', 'public/logo192.png']
        }),
        new ExtractTextPlugin({ filename: "[name].css" }),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public', 'index.html')
        })
    ]
};