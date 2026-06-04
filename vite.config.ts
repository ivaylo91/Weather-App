import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Weather App',
        short_name: 'Weather',
        description: 'Real-time weather with hourly forecasts and air quality',
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
            name: "Today's Weather",
            short_name: 'Today',
            description: 'Open current weather',
            url: '/',
            icons: [{ src: '/pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Weather Widget',
            short_name: 'Widget',
            description: 'Compact weather card',
            url: '/#widget',
            icons: [{ src: '/pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Weather data — NetworkFirst: fresh if online, cached if offline
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 10 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Air quality — NetworkFirst with longer cache
            urlPattern: /^https:\/\/air-quality-api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'air-quality-api',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Geocoding — CacheFirst: city names rarely change
            urlPattern: /^https:\/\/geocoding-api\.open-meteo\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'geo-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
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
