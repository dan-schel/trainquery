import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import viteSSR from "vite-ssr/plugin.js";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  ssr: { format: "cjs" },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ['**/*.{js,css}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'TrainQuery',
        short_name: 'TrainQuery',
        description: "Navigate Melbourne's train network",
        theme_color: '#000000',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
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
