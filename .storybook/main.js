const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: [
    '../packages/**/*.stories.@(js|jsx|ts|tsx)',
    '../packages/**/*.stories.mdx',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    // Add TypeScript and JSX loader
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              ['@babel/plugin-proposal-private-methods', { loose: true }],
              ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
            ],
          },
        },
      ],
    });

    // Add React Native Web alias
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
      '@app': require('path').resolve(__dirname, '../packages/app'),
      '@design': require('path').resolve(__dirname, '../packages/app/design'),
      '@components': require('path').resolve(__dirname, '../packages/app/components'),
      '@screens': require('path').resolve(__dirname, '../packages/app/screens'),
      '@hooks': require('path').resolve(__dirname, '../packages/app/hooks'),
      '@utils': require('path').resolve(__dirname, '../packages/app/utils'),
      '@logic': require('path').resolve(__dirname, '../packages/app/logic'),
      '@shared': require('path').resolve(__dirname, '../packages/shared'),
      '@extension': require('path').resolve(__dirname, '../packages/extension'),
      '@mobile': require('path').resolve(__dirname, '../packages/mobile'),
    };
    
    // Add web extensions
    config.resolve.extensions = [
      '.web.ts',
      '.web.tsx',
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.json',
    ];
    
    return config;
  },
  typescript: {
    reactDocgen: false,
  },
  preview: './preview.tsx',
}; 