import path from "path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer"
import type { EasyDocPluginOptions } from "./src/types/vite-plugin"
import { vitePluginEasyDoc } from "./src/plugins/vite-plugin-easydoc"

const easyDocOptions: EasyDocPluginOptions = {
  docsRoot: "docs/",
  locales: ["en", "zh"],
  defaultLocale: "en",
}

// https://vite.dev/config/
export default defineConfig({
  base: '/easydoc/',
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-router')) return 'vendor-router'
          if (
            id.includes('react-dom') ||
            id.includes('react/') ||
            id.includes('@radix-ui') ||
            id.includes('@floating-ui')
          ) return 'vendor-react'
        }
      }
    }
  }, 
  plugins: [
    vitePluginEasyDoc(easyDocOptions),
    react(),
    tailwindcss(),
    visualizer({
      open: false,
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
