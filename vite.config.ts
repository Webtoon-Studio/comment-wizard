import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    // rollupOptions: {
    //   input: {
    //     dashboard: "index.html"
    //   },
    //   output: {
    //     dir: "build/src/dashboard",
    //     assetFileNames: "assets/[name][extname]",
    //     entryFileNames: "assets/[name].js"
    //   }
    // }
  },
  server: {
    open: "./src/popup/index.html"
  },
  resolve: {
    alias: [
        { find: "@popup/", replacement: "/src/popup/"},
        { find: "@root/", replacement: "/"}
    ], 
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})
