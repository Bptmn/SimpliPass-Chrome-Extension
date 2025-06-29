const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    background: './src/background/index.ts',
    popup: './src/popup/Popup.tsx',
    content: './src/content/content-script.ts',
    'src/content/popovers/PopoverCredentialPicker':
      './src/content/popovers/PopoverCredentialPicker.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: 'chunks/[name].[contenthash:8].js',
    clean: true,
    publicPath: '/',
  },
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
        },
        shared: {
          test: /[\\/]packages[\\/]shared[\\/]/,
          name: 'shared',
          chunks: 'all',
          priority: 15,
          minChunks: 2,
        },
        default: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
              },
            },
          },
        ],
      },
      {
        test: /(?<!\.module)\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { modules: false },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    plugins: [new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, 'tsconfig.json') })],
    alias: {
      '@simplipass/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  plugins: [
    new Dotenv({
      systemvars: true,
      safe: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'src/popup/popup.html', to: '.' },
        { from: 'src/popup/popup.css', to: '.' },
        { from: '../../assets/icons', to: 'assets/icons' },
        { from: '../shared/src/styles/tokens.css', to: '.' },
        {
          from: 'src/content/popovers/PopoverCredentialPicker.html',
          to: 'src/content/popovers/PopoverCredentialPicker.html',
        },
        {
          from: 'src/content/popovers/PopoverCredentialPicker.css',
          to: 'src/content/popovers/PopoverCredentialPicker.css',
        },
      ],
    }),
  ],
};