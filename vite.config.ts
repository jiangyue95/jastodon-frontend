import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const backend = 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  base: '/compose/',
  plugins: [react()],
  server: {
    proxy: {
      '/csrf': { target: backend, changeOrigin: true },
      '/notes': { target: backend, changeOrigin: true },
      '/oauth2': { target: backend, changeOrigin: true },
    }
  }
})
