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
        "src/incom/index": resolve(__dirname, "src/incom/index.html"),
      },
    },
  },
  server: {
    open: "./src/incom/index.html",
  },
  resolve: {
    alias: [
      { find: "@root", replacement: resolve(__dirname) },
      { find: "@popup", replacement: resolve(__dirname, "popup") },
      { find: "@assets", replacement: resolve(__dirname, "src/assets") },
      { find: "@incom", replacement: resolve(__dirname, "src/incom") },
    ],
  },
});
