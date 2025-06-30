module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@app': './packages/app',
          '@shared': './packages/shared',
          '@extension': './packages/extension',
          '@design': './packages/app/design',
          '@components': './packages/app/components',
          '@screens': './packages/app/screens',
          '@hooks': './packages/app/hooks',
          '@logic': './packages/app/logic',
          '@utils': './packages/app/utils',
        },
      },
    ],
  ],
}; 