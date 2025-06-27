const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    background: './src/app/background/index.ts',
    popup: './src/app/popup/Popup.tsx',
    content: './src/app/content/content-script.ts',
    'src/app/content/popovers/PopoverCredentialPicker':
      './src/app/content/popovers/PopoverCredentialPicker.tsx',
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
        // Vendor chunk for node_modules
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
        },
        // Shared components chunk
        shared: {
          test: /[\\/]src[\\/]shared[\\/]/,
          name: 'shared',
          chunks: 'all',
          priority: 15,
          minChunks: 2,
        },
        // Feature chunks
        auth: {
          test: /[\\/]src[\\/]features[\\/]auth[\\/]/,
          name: 'feature-auth',
          chunks: 'all',
          priority: 10,
        },
        credentials: {
          test: /[\\/]src[\\/]features[\\/]credentials[\\/]/,
          name: 'feature-credentials',
          chunks: 'all',
          priority: 10,
        },
        generator: {
          test: /[\\/]src[\\/]features[\\/]generator[\\/]/,
          name: 'feature-generator',
          chunks: 'all',
          priority: 10,
        },
        settings: {
          test: /[\\/]src[\\/]features[\\/]settings[\\/]/,
          name: 'feature-settings',
          chunks: 'all',
          priority: 10,
        },
        // Services chunk
        services: {
          test: /[\\/]src[\\/]services[\\/]/,
          name: 'services',
          chunks: 'all',
          priority: 10,
        },
        // Default chunk
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
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      'tokens.css': path.resolve(__dirname, 'src/shared/styles/tokens.css'),
      shared: path.resolve(__dirname, 'src/shared'),
      features: path.resolve(__dirname, 'src/features'),
      services: path.resolve(__dirname, 'src/services'),
      app: path.resolve(__dirname, 'src/app'),
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
        { from: 'src/app/popup/popup.html', to: '.' },
        { from: 'src/app/popup/popup.css', to: '.' },
        { from: 'assets/icons', to: 'assets/icons' },
        { from: 'src/shared/styles/tokens.css', to: '.' },
        // Only copy HTML and CSS for popover
        {
          from: 'src/app/content/popovers/PopoverCredentialPicker.html',
          to: 'src/app/content/popovers/PopoverCredentialPicker.html',
        },
        {
          from: 'src/app/content/popovers/PopoverCredentialPicker.css',
          to: 'src/app/content/popovers/PopoverCredentialPicker.css',
        },
      ],
    }),
  ],
};
