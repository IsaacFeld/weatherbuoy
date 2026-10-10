import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
      proxy: {
        // String shorthand: http://localhost:5173/api -> http://localhost:3002/api
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      '/subscribe': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
      },
      '/subscribe/manage': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
      },
    },
})