import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        sw: './public/sw.js'
      }
    }
  }
})
