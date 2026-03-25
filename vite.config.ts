import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub project Pages: set VITE_BASE_PATH in CI (e.g. /horse-math-kids/)
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'pwa-icon.svg',
        'smiling-horse.png',
        'jamie-horse.png',
        'happy-horse.png',
      ],
      manifest: {
        name: 'Hästmatte',
        short_name: 'Hästmatte',
        description:
          'Öva addition, subtraktion, multiplikation och division — hästtema.',
        lang: 'sv',
        theme_color: '#5c4033',
        background_color: '#f5edd9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,webp,woff2}'],
      },
    }),
  ],
})
