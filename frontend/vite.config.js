import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'   // 👈 importante

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 👈 ahora "@/..." apunta a /src
    },
  },
})
