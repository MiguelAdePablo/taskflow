import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://taskflow-api-852f.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://taskflow-api-852f.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  },
  preview: {
    proxy: {
      '/api': {
        target: 'https://taskflow-api-852f.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://taskflow-api-852f.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})
