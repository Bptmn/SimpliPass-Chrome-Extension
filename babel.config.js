const path = require('path');

module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: 'commonjs' // Ensure CommonJS output for Jest
    }],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
      helpers: true,
      useESM: false
    }],
    // Add plugin to handle import.meta syntax
    ['@babel/plugin-syntax-import-meta', { loose: true }],
  ],
  env: {
    test: {
      plugins: [
        ['@babel/plugin-transform-modules-commonjs', { loose: true }],
        // Handle import.meta in test environment
        ['@babel/plugin-syntax-import-meta', { loose: true }],
      ]
    }
  }
}; 