import { defineConfig } from "vite";
export default defineConfig({
  base: "/No-More-Scrolling/",
  build: {
    target: "es2022",
    rollupOptions: { output: { manualChunks: { math: ["katex"] } } },
  },
});
