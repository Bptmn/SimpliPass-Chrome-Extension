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
    'src/content/popovers/PopoverCredentialPicker': './src/content/popovers/PopoverCredentialPicker.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  optimization: {
    minimize: false,
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
            options: { modules: true }
          }
        ]
      },
      {
        test: /(?<!\.module)\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { modules: false }
          }
        ]
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      'tokens.css': path.resolve(__dirname, 'src/styles/tokens.css'),
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
        { from: 'assets/icons', to: 'assets/icons' },
        { from: 'src/styles/tokens.css', to: '.' },
        // Only copy HTML and CSS for popover
        { from: 'src/content/popovers/PopoverCredentialPicker.html', to: 'src/content/popovers/PopoverCredentialPicker.html' },
        { from: 'src/content/popovers/PopoverCredentialPicker.css', to: 'src/content/popovers/PopoverCredentialPicker.css' },
      ],
    }),
  ],
};
