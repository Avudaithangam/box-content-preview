const path = require('path');
const I18nPlugin = require('i18n-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BannerPlugin, DefinePlugin, NormalModuleReplacementPlugin } = require('webpack');
const license = require('./license');
const pkg = require('../package.json');

/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
module.exports = language => {
    const langJson = require(`${path.resolve('src/i18n/json')}/${language}.json`);
    const locale = language ? language.substr(0, language.indexOf('-')) : 'en';

    return {
        bail: true,
        module: {
            rules: [
                {
                    test: /\.(js|ts|tsx)$/,
                    loader: 'babel-loader',
                    include: [path.resolve('src/lib')],
                },
                {
                    test: /\.s?css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
                    include: [
                        path.resolve('src/lib'),
                        path.resolve('node_modules/box-annotations'),
                        path.resolve('node_modules/box-ui-elements'),
                    ],
                },
                {
                    test: /\.(svg|html)$/,
                    loader: 'raw-loader',
                    include: [path.resolve('src/lib')],
                },
                {
                    test: /\.(jpe?g|png|gif|woff2|woff)$/,
                    loader: 'file-loader',
                    include: [path.resolve('src/lib')],
                    options: {
                        name: '[name].[ext]',
                    },
                },
            ],
        },
        plugins: [
            new BannerPlugin(license),
            new DefinePlugin({
                __LANGUAGE__: JSON.stringify(language),
                __NAME__: JSON.stringify(pkg.name),
                __VERSION__: JSON.stringify(pkg.version),
                'process.env': {
                    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                    BABEL_ENV: JSON.stringify(process.env.BABEL_ENV),
                },
            }),
            new I18nPlugin(langJson),
            new MiniCssExtractPlugin({
                filename: '[name].css',
            }),
            new NormalModuleReplacementPlugin(/\/iconv-loader$/),
        ],
        resolve: {
            alias: {
                'box-elements-messages': path.resolve(`node_modules/box-ui-elements/i18n/${language}`),
                'react-intl-locale-data': path.resolve(`node_modules/react-intl/locale-data/${locale}`),
            },
            extensions: ['.tsx', '.ts', '.js'],
        },
        stats: {
            assets: true,
            children: false,
            chunkModules: false,
            chunks: false,
            colors: true,
            hash: false,
            timings: true,
            version: false,
        },
    };
};
