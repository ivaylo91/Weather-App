import type { CityData, Unit, WeatherCondition } from '../types'
import type { Translations } from '../i18n/translations'
import { conv } from './temperature'

const GRADIENTS: Record<WeatherCondition, [string, string]> = {
  'clear-day':           ['#f97316', '#9a3412'],
  'clear-night':         ['#1e1b4b', '#0c0a3e'],
  'partly-cloudy-day':   ['#1d4ed8', '#0369a1'],
  'partly-cloudy-night': ['#0f172a', '#312e81'],
  'cloudy':              ['#374151', '#6b7280'],
  'rain':                ['#0f172a', '#1e3a5f'],
  'thunderstorm':        ['#18181b', '#312e81'],
  'snow':                ['#334155', '#64748b'],
  'fog':                 ['#4b5563', '#9ca3af'],
}

const EMOJIS: Record<WeatherCondition, string> = {
  'clear-day':           '☀️',
  'clear-night':         '🌙',
  'partly-cloudy-day':   '⛅',
  'partly-cloudy-night': '🌤️',
  'cloudy':              '☁️',
  'rain':                '🌧️',
  'thunderstorm':        '⛈️',
  'snow':                '❄️',
  'fog':                 '🌫️',
}

function buildSVG(city: CityData, unit: Unit, tr: Translations): string {
  const [c1, c2] = GRADIENTS[city.cond] ?? ['#1d4ed8', '#38bdf8']
  const emoji = EMOJIS[city.cond] ?? '🌡️'
  const temp = conv(city.temp, unit)
  const hi = conv(city.hi, unit)
  const lo = conv(city.lo, unit)
  const cond = tr.cond[city.cond] ?? city.cond
  const name = city.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="420" viewBox="0 0 800 420">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="420" rx="32" fill="url(#bg)"/>
  <!-- Emoji -->
  <text x="160" y="245" font-size="150" text-anchor="middle">${emoji}</text>
  <!-- Temperature -->
  <text x="480" y="200" font-family="system-ui,-apple-system,sans-serif" font-size="140" font-weight="300" fill="white" text-anchor="middle" letter-spacing="-8">${temp}°</text>
  <!-- City name -->
  <text x="480" y="265" font-family="system-ui,-apple-system,sans-serif" font-size="32" font-weight="700" fill="white" text-anchor="middle">${name}</text>
  <!-- Condition + H/L -->
  <text x="480" y="310" font-family="system-ui,-apple-system,sans-serif" font-size="22" fill="rgba(255,255,255,0.7)" text-anchor="middle">${cond} · H:${hi}° L:${lo}°</text>
  <!-- Branding -->
  <text x="776" y="400" font-family="system-ui,-apple-system,sans-serif" font-size="16" fill="rgba(255,255,255,0.35)" text-anchor="end">Sora Weather</text>
</svg>`
}

async function svgToPngBlob(svgStr: string, w: number, h: number): Promise<Blob> {
  const blob = new Blob([svgStr], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w * 2   // 2× for retina
      canvas.height = h * 2
      const ctx = canvas.getContext('2d')!
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png')
    }
    img.onerror = reject
    img.src = url
  })
}

export async function shareWeatherImage(
  city: CityData,
  unit: Unit,
  tr: Translations,
  fallbackText: string,
  fallbackToast: (msg: string) => void,
): Promise<void> {
  try {
    const svgStr = buildSVG(city, unit, tr)
    const blob = await svgToPngBlob(svgStr, 800, 420)
    const file = new File([blob], `${city.name}-weather.png`, { type: 'image/png' })

    // Build a shareable deep-link URL (OG image served by /api/og on Vercel)
    const [c1, c2] = GRADIENTS[city.cond] ?? ['#1d4ed8', '#0ea5e9']
    const emoji = EMOJIS[city.cond] ?? '🌤️'
    const ogSearch = new URLSearchParams({
      city: city.name, temp: String(conv(city.temp, unit)),
      cond: tr.cond[city.cond] ?? city.cond, emoji, c1, c2,
    }).toString()
    const shareUrl = `${window.location.origin}/?city=${encodeURIComponent(city.name)}&${ogSearch}`

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `Weather in ${city.name}`, url: shareUrl })
      return
    }

    // Fallback: trigger download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
    fallbackToast('Image saved!')
  } catch {
    // Image share failed — fall back to text
    try {
      if (navigator.share) {
        await navigator.share({ title: `Weather in ${city.name}`, text: fallbackText, url: `${window.location.origin}/?city=${encodeURIComponent(city.name)}` })
      } else {
        await navigator.clipboard.writeText(fallbackText)
        fallbackToast(tr.copiedToClipboard)
      }
    } catch { /* user cancelled */ }
  }
}
