import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: "/src/popup",
  build: {
    rollupOptions: {
      input: {
        "src/popup/index": resolve(__dirname, "src/popup/index.html"),
      },
    },
  },
  server: {
    open: "./src/popup/index.html",
  },
  resolve: {
    alias: [
      { find: "@popup", replacement: resolve(__dirname, "src/popup") },
      { find: "@assets", replacement: resolve(__dirname, "src/assets") },
      { find: "@root", replacement: resolve(__dirname) },
    ],
  },
});
