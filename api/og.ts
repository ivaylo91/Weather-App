/**
 * Vercel Edge Function — generates a 1200×630 OG image for social sharing.
 *
 * Usage:
 *   /api/og                              — branded default card
 *   /api/og?city=Tokyo&temp=19&cond=Rain&emoji=%F0%9F%8C%A7%EF%B8%8F&c1=%230f172a&c2=%231e3a5f
 *
 * The client builds this URL when calling navigator.share() so that
 * WhatsApp / Telegram / Slack / Discord previews show a live weather card.
 * Twitter/X requires PNG which @vercel/og provides via Satori + resvg-wasm.
 */

import { ImageResponse } from '@vercel/og'
import React from 'react'

export const config = { runtime: 'edge' }

// Decode a URL-encoded emoji string safely
function safeEmoji(raw: string | null): string {
  if (!raw) return '🌤️'
  try { return decodeURIComponent(raw) } catch { return '🌤️' }
}

export default function handler(request: Request): ImageResponse {
  const { searchParams } = new URL(request.url)

  const city  = searchParams.get('city')  ?? 'Времето днес'
  const temp  = searchParams.get('temp')  ?? ''
  const cond  = searchParams.get('cond')  ?? 'Прогноза на времето'
  const emoji = safeEmoji(searchParams.get('emoji'))
  const c1    = searchParams.get('c1')    ?? '#1d4ed8'
  const c2    = searchParams.get('c2')    ?? '#0ea5e9'

  return new ImageResponse(
    React.createElement('div', {
      style: {
        width: '100%', height: '100%',
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
      },
    }, [
      // Emoji
      React.createElement('div', {
        key: 'emoji',
        style: { fontSize: 130, lineHeight: 1, marginBottom: 8 },
      }, emoji),
      // Temperature
      temp && React.createElement('div', {
        key: 'temp',
        style: { fontSize: 96, fontWeight: 300, color: '#fff', letterSpacing: -6, lineHeight: 1 },
      }, `${temp}°`),
      // City name
      React.createElement('div', {
        key: 'city',
        style: { fontSize: 44, fontWeight: 700, color: '#fff', marginTop: 12 },
      }, city),
      // Condition
      React.createElement('div', {
        key: 'cond',
        style: { fontSize: 28, color: 'rgba(255,255,255,0.7)', marginTop: 10 },
      }, cond),
      // Branding
      React.createElement('div', {
        key: 'brand',
        style: {
          position: 'absolute', bottom: 36, right: 52,
          fontSize: 20, color: 'rgba(255,255,255,0.35)', fontWeight: 600,
        },
      }, 'Времето днес'),
    ]),
    { width: 1200, height: 630 },
  )
}
