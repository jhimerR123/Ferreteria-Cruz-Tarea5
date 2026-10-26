import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  server: {
    proxy: {
      '/api': {
        target: 'https://ferreteria-cruz-tarea5.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})