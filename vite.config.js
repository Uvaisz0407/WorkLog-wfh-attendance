import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'vite.svg'],

      manifest: {
        name: 'WorkLog WFH',
        short_name: 'WorkLog',
        description: 'Employee Attendance Management System',

        theme_color: '#0f172a',
        background_color: '#0f172a',

        display: 'standalone',
        start_url: '/',

        icons: [
          {
            src: '/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          pdf: ['jspdf', 'jspdf-autotable']
        }
      }
    }
  }
})