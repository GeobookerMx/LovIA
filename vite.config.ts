import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'LovIA! — Parejas de Calidad',
        short_name: 'LovIA!',
        description: 'Herramienta de ingeniería relacional fundamentada en ciencia. Compatibilidad basada en 15+ estudios publicados.',
        theme_color: '#0E0B2A',
        background_color: '#0E0B2A',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/?source=pwa',
        scope: '/',
        lang: 'es-MX',
        categories: ['lifestyle', 'social', 'health'],
        iarc_rating_id: '',
        icons: [
          { src: '/icons/icon-72.png',  sizes: '72x72',   type: 'image/png' },
          { src: '/icons/icon-96.png',  sizes: '96x96',   type: 'image/png' },
          { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        ],
        shortcuts: [
          {
            name: 'Mis Matches',
            short_name: 'Matches',
            description: 'Ver tus matches activos',
            url: '/matches?source=shortcut',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Radar',
            short_name: 'Radar',
            description: 'Buscar personas cercanas',
            url: '/radar?source=shortcut',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Mi Perfil',
            short_name: 'Perfil',
            description: 'Ver y editar tu perfil',
            url: '/profile?source=shortcut',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — cached long-term, rarely changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts — only loaded when user views graphs
          'vendor-charts': ['recharts'],
          // Animations — loaded on first animated page
          'vendor-motion': ['framer-motion'],
          // WebRTC — only loaded for video calls
          'vendor-rtc': ['peerjs'],
          // Data layer
          'vendor-data': ['zustand', '@tanstack/react-query', '@supabase/supabase-js'],
          // i18n (for future use)
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
  },
})
