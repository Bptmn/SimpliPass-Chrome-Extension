import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
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
        {
          src: 'packages/extension/public/manifest.json',
          dest: '.',
        },
      ],
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: 'packages/extension/popup/index.tsx',
      },
      external: ['chrome'],
      output: {
        entryFileNames: chunk => {
          if (chunk.name === 'popup') return 'assets/index.js';
          return 'assets/[name]-[hash].js';
        },
        format: 'es',
        preserveModules: false,
      }
    },
    minify: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    emptyOutDir: false, // Don't empty the dist directory to preserve content.js
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
  envPrefix: 'VITE_',
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-native-web'],
    exclude: ['chrome', 'react-native'],
  },
  define: {
    global: 'globalThis',
  },
}) 