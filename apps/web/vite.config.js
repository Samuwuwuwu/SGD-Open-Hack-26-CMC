import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  root: repositoryRoot,
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(repositoryRoot, 'node_modules/react'),
      'react-dom': path.resolve(repositoryRoot, 'node_modules/react-dom'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [repositoryRoot],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
