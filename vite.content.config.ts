import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    outDir: 'dist/assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        content: 'packages/extension/content.ts',
      },
      preserveEntrySignatures: 'strict',
      output: {
        entryFileNames: 'content.js',
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
      '@extension': '/packages/extension',
      '@utils': '/packages/app/utils',
    },
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  define: {
    global: 'globalThis',
  },
}); 