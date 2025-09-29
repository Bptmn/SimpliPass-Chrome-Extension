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
      external: ['chrome', 'expo', 'expo-modules-core', 'expo-secure-store'],
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
      // Drop RNW aliases for extension UI
      'react-native': '/packages/extension/shims/reactNative.ts',
      'expo': '/packages/extension/shims/empty.ts',
      'expo-modules-core': '/packages/extension/shims/empty.ts',
      '@unimodules/core': '/packages/extension/shims/empty.ts',
      '@app': '/packages/app',
      '@design': '/packages/app/design',
      '@components': '/packages/app/components',
      '@screens': '/packages/app/screens',
      '@hooks': '/packages/app/hooks',
      '@utils': '/packages/app/utils',
      '@logic': '/packages/app/core/logic',
      '@shared': '/packages/shared',
      '@extension': '/packages/extension',
      // Prevent accidental mobile imports in extension build
      '@mobile': '/packages/extension/shims/empty.ts',
    },
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  envPrefix: 'VITE_',
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['chrome', 'react-native', 'expo', 'expo-modules-core', '@unimodules/core'],
  },
  define: {
    global: 'globalThis',
  },
})


