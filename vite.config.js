import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['avatar.png', 'robots.txt'],
      manifest: {
        name: 'ប្រព័ន្ធគ្រប់គ្រងវត្តអារាម (Pagoda Management)',
        short_name: 'វត្តអារាម',
        description: 'ប្រព័ន្ធគ្រប់គ្រងវត្តអារាម និងព្រះសង្ឃ/និស្សិត',
        theme_color: '#f59e0b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/avatar.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/avatar.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('primevue') || id.includes('@primeuix')) {
              return 'vendor-primevue';
            }
            if (id.includes('chart.js') || id.includes('vue-chartjs')) {
              return 'vendor-chartjs';
            }
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vendor-vue-core';
            }

            if (id.includes('@lucide')) {
              return 'vendor-lucide';
            }
            return 'vendor-general';
          }
        }
      }
    }
  }
})
