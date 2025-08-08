import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    viteStaticCopy({
      targets: [
        {
          src: 'packages/extension/popovers/components/CredentialPicker/CredentialPickerPopover.html',
          dest: 'src/content/popovers',
        },
        {
          src: 'packages/extension/popovers/components/LoginPrompt/LoginPromptPopover.html',
          dest: 'src/content/popovers',
        },
        {
          src: 'packages/extension/popovers/components/PasswordGenerator/PasswordGeneratorPopover.html',
          dest: 'src/content/popovers',
        },
        {
          src: 'packages/extension/popovers/components/SaveCredential/SaveCredentialPopover.html',
          dest: 'src/content/popovers',
        },
        {
          src: 'packages/extension/popovers/components/UpdateCredential/UpdateCredentialPopover.html',
          dest: 'src/content/popovers',
        },
        {
          src: 'packages/extension/public/manifest.json',
          dest: '.',
        },
        {
          src: 'packages/extension/popup/popup.html',
          dest: '.',
        },
        {
          src: 'packages/extension/popup/popup.css',
          dest: '.',
        },
        {
          src: 'packages/extension/public/icons/*',
          dest: 'assets/icons',
        },
      ],
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        background: 'packages/extension/background.ts',
      },
      external: ['chrome'],
      output: {
        entryFileNames: 'background.js',
        format: 'iife',
        inlineDynamicImports: true,
        exports: 'none',
        manualChunks: undefined,
      },
    },
    minify: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native': 'react-native-web',
      '@app': '/packages/app',
      '@design': '/packages/app/design',
      '@components': '/packages/app/components',
      '@screens': '/packages/app/screens',
      '@hooks': '/packages/app/hooks',
      '@utils': '/packages/app/utils',
      '@logic': '/packages/app/core/logic',
      '@shared': '/packages/shared',
      '@extension': '/packages/extension',
      '@mobile': '/packages/mobile',
    },
    extensions: ['.web.ts', '.web.tsx', '.ts', '.tsx', '.js', '.json'],
  },
  define: {
    global: 'globalThis',
    __DEV__: 'false',
  },
}); 