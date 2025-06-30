const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    background: './packages/extension/background.ts',
    popup: './packages/extension/index.ts',
    content: './packages/extension/content.ts',
    'src/content/popovers/PopoverCredentialPicker': './packages/extension/PopoverCredentialPicker.tsx',
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
        use: 'babel-loader',
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
    extensions: ['.web.ts', '.web.tsx', '.ts', '.tsx', '.js', '.json'],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      'react-native$': 'react-native-web',
      '@app': path.resolve(__dirname, 'packages/app'),
      '@design': path.resolve(__dirname, 'packages/app/design'),
      '@components': path.resolve(__dirname, 'packages/app/components'),
      '@screens': path.resolve(__dirname, 'packages/app/screens'),
      '@hooks': path.resolve(__dirname, 'packages/app/hooks'),
      '@utils': path.resolve(__dirname, 'packages/app/utils'),
      '@logic': path.resolve(__dirname, 'packages/app/logic'),
      '@shared': path.resolve(__dirname, 'packages/shared'),
      '@extension': path.resolve(__dirname, 'packages/extension'),
      '@mobile': path.resolve(__dirname, 'packages/mobile'),
    },
  },
  plugins: [
    new Dotenv({
      systemvars: true,
      safe: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'packages/extension/public/manifest.json', to: '.' },
        { from: 'packages/extension/popup/popup.html', to: '.' },
        { from: 'packages/extension/popup/popup.css', to: '.' },
        { from: 'packages/extension/public/icons', to: 'assets/icons' },
        { from: 'packages/extension/PopoverCredentialPicker.html', to: 'src/content/popovers/PopoverCredentialPicker.html' },
        { from: 'packages/extension/PopoverCredentialPicker.css', to: 'src/content/popovers/PopoverCredentialPicker.css' },
      ],
    }),
  ],
};
