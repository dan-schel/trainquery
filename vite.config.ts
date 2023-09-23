import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import viteSSR from "vite-ssr/plugin.js";
import vueJsx from "@vitejs/plugin-vue-jsx";
// import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  ssr: { format: "cjs" },
  plugins: [
    //VitePWA({ registerType: "autoUpdate" }),
    viteSSR(),
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "shared": fileURLToPath(new URL("./shared", import.meta.url))
    }
  }
});
