const path = require('path');

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    'react-native-web',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@app': path.resolve(__dirname, './packages/app'),
          '@design': path.resolve(__dirname, './packages/app/design'),
          '@components': path.resolve(__dirname, './packages/app/components'),
          '@screens': path.resolve(__dirname, './packages/app/screens'),
          '@hooks': path.resolve(__dirname, './packages/app/hooks'),
          '@utils': path.resolve(__dirname, './packages/app/utils'),
          '@logic': path.resolve(__dirname, './packages/app/core/logic'),
          '@core': path.resolve(__dirname, './packages/app/core'),
          '@shared': path.resolve(__dirname, './packages/shared'),
          '@extension': path.resolve(__dirname, './packages/extension'),
          '@mobile': path.resolve(__dirname, './packages/mobile'),
        },
      },
    ],
  ],
}; 