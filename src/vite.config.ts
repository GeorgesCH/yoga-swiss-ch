import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "components": path.resolve(__dirname, "./components"),
      "utils": path.resolve(__dirname, "./utils"),
      "lib": path.resolve(__dirname, "./lib"),
      "styles": path.resolve(__dirname, "./styles"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
})