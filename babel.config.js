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
          '@app': './packages/app',
          '@design': './packages/app/design',
          '@components': './packages/app/components',
          '@screens': './packages/app/screens',
          '@hooks': './packages/app/hooks',
          '@utils': './packages/app/utils',
          '@logic': './packages/app/logic',
          '@shared': './packages/shared',
          '@extension': './packages/extension',
          '@mobile': './packages/mobile',
        },
      },
    ],
  ],
}; 