import { defineConfig, rollupVersion } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: "/src/popup",
  build: {
    rollupOptions: {
      input: {
        "popup/index": resolve(__dirname, "popup/index.html"),
      },
    }
  },
  server: {
    open: "./src/popup/index.html"
  },
  resolve: {
    alias: [
        { find: "@popup", replacement: resolve(__dirname, "popup")},
        { find: "@root", replacement: resolve(__dirname)}
    ], 
  },
})
