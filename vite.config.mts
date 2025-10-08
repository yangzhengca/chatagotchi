import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({}) => ({
  plugins: [tailwindcss(), react()],
  server: {
    port: 4444,
    strictPort: true,
    cors: true,
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    target: 'es2022',
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    minify: 'esbuild',
    outDir: 'assets',
    assetsDir: '.',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // pizzaz: resolve(__dirname, 'src/pizzaz/index.html'),
        // pizzaz_albums: resolve(__dirname, 'src/pizzaz-albums/index.html'),
        // pizzaz_carousel: resolve(__dirname, 'src/pizzaz-carousel/index.html'),
        // pizzaz_list: resolve(__dirname, 'src/pizzaz-list/index.html'),
        pet: resolve(__dirname, 'src/pet/index.html'),
      },
      preserveEntrySignatures: 'strict',
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
}));
