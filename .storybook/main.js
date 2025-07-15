const path = require('path');

module.exports = {
  stories: [
    '../packages/**/*.stories.@(js|jsx|ts|tsx)',
    '../packages/**/*.stories.mdx',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-viewport',
    '@storybook/addon-measure',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    // Add React Native Web alias
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
      '@app': path.resolve(__dirname, '../packages/app'),
      '@design': path.resolve(__dirname, '../packages/app/design'),
      '@components': path.resolve(__dirname, '../packages/app/components'),
      '@screens': path.resolve(__dirname, '../packages/app/screens'),
      '@hooks': path.resolve(__dirname, '../packages/app/hooks'),
      '@utils': path.resolve(__dirname, '../packages/app/utils'),
      '@logic': path.resolve(__dirname, '../packages/app/core/logic'),
      '@core': path.resolve(__dirname, '../packages/app/core'),
      '@shared': path.resolve(__dirname, '../packages/shared'),
      '@extension': path.resolve(__dirname, '../packages/extension'),
      '@mobile': path.resolve(__dirname, '../packages/mobile'),
      '@ui': path.resolve(__dirname, '../packages/common/ui'),
      '@common': path.resolve(__dirname, '../packages/common'),
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

    // Add babel-loader for TypeScript and JSX files
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, '../babel.config.js'),
        },
      },
    });

    // Ensure CSS files are handled properly
    config.module.rules = config.module.rules.map(rule => {
      if (rule.test && rule.test.toString().includes('css')) {
        return {
          ...rule,
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        };
      }
      return rule;
    });

    return config;
  },
  typescript: {
    reactDocgen: false,
  },
  preview: './preview.tsx',
}; 