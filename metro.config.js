const { getDefaultConfig } = require('metro-config');
const path = require('path');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      alias: {
        '@app': path.resolve(__dirname, 'packages/app'),
        '@shared': path.resolve(__dirname, 'packages/shared'),
        '@extension': path.resolve(__dirname, 'packages/extension'),
      },
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
    },
    watchFolders: [
      path.resolve(__dirname, 'packages/app'),
      path.resolve(__dirname, 'packages/shared'),
    ],
  };
})(); 