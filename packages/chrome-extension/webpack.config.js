const path = require('path')
const { join } = require('path')
const webpack = require('webpack')
const fg = require('fast-glob')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ExtensionReloader = require('webpack-extension-reloader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Dotenv = require('dotenv-webpack')

// eslint-disable-next-line
function configFunc(env, argv) {
  const isDevMode = env.NODE_ENV === 'development'
  const config = {
    devtool: isDevMode ? 'eval-source-map' : false,
    context: path.resolve(__dirname, './src'),
    entry: {
      options: './options/index.js',
      popup: './popup/index.ts',
      background: './background/index.js',
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      publicPath: './',
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: { appendTsSuffixTo: [/\.vue$/] },
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            extractCSS: !isDevMode,
          },
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /(node_modules|bower_components)/,
        },
        {
          test: /\.scss$/,
          use: [
            isDevMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.sass$/,
          use: [
            isDevMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              // eslint-disable-next-line
              options: { implementation: require('sass') },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            isDevMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]',
            esModule: false,
          },
        },
      ],
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.runtime.esm.js',
        bulma$: 'bulma/css/bulma.css',
      },
      extensions: ['.js', '.ts'],
    },
    plugins: [
      new VueLoaderPlugin(),
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'assets', to: 'assets' },
          { from: 'manifest.json', to: 'manifest.json', flatten: true },
          { from: 'content-scripts/**/*' },
        ],
      }),
      new HtmlWebpackPlugin({
        title: 'Options',
        template: './index.html',
        filename: 'options.html',
        chunks: ['options'],
      }),
      new HtmlWebpackPlugin({
        title: 'Popup',
        template: './index.html',
        filename: 'popup.html',
        chunks: ['popup'],
      }),
      new Dotenv({ path: join(__dirname, '../frontend/.env') }),
    ],
  }

  /**
   * Adjust rendererConfig for production settings
   */
  if (isDevMode) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new ExtensionReloader({
        contentScript: 'contentScripts',
        background: 'background',
        extensionPage: 'popup',
        options: 'options',
      })
    )
  } else {
    config.plugins.push(
      new ScriptExtHtmlWebpackPlugin({
        async: [/runtime/],
        defaultAttribute: 'defer',
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      })
      // new CopyWebpackPlugin({
      // patterns: [
      //   {
      //     from: path.join(__dirname, '../src/data'),
      //     to: path.join(__dirname, '../dist/data'),
      //   },
      // ]})
    )
  }
  return config
}

module.exports = configFunc
