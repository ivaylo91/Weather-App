import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // In dev, Vite would try to serve api/*.ts as modules — intercept /api/ routes instead
    {
      name: 'api-dev-stub',
      configureServer(server) {
        server.middlewares.use('/api/meteoalarm', (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end('[]')  // no MeteoAlarm in dev; prod uses the real Edge Function
        })
        server.middlewares.use('/api/og', (_req, res) => {
          res.writeHead(302, { Location: '/pwa-192.png' })
          res.end()
        })
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Времето днес',
        short_name: 'Времето',
        description: 'Времето на живо — почасова прогноза, качество на въздуха и 10-дневна прогноза',
        theme_color: '#1d4ed8',
        background_color: '#1e3a8a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        shortcuts: [
          {
            name: 'Времето днес',
            short_name: 'Времето',
            description: 'Текущо време',
            url: '/',
            icons: [{ src: '/pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Времето — джаджа',
            short_name: 'Джаджа',
            description: 'Компактна карта с времето',
            url: '/#widget',
            icons: [{ src: '/pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Weather forecast — covers both free and customer API subdomains
            urlPattern: /^https:\/\/(customer-)?api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 10 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Air quality — covers both free and customer API subdomains
            urlPattern: /^https:\/\/(customer-)?air-quality-api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'air-quality-api',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Geocoding — covers both free and customer API subdomains
            urlPattern: /^https:\/\/(customer-)?geocoding-api\.open-meteo\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'geo-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Historical archive — covers both free and customer API subdomains
            urlPattern: /^https:\/\/(customer-)?archive-api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'archive-api',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 6 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Reverse geocoding — CacheFirst
            urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'nominatim',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Weather icons CDN — CacheFirst with long TTL
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'weather-icons',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
