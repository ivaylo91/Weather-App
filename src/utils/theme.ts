import type { CSSProperties } from 'react'

export const DEFAULT_BG: CSSProperties = {
  background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #38bdf8 100%)',
}

export function getBackgroundStyle(weathercode: number, isDay: boolean): CSSProperties {
  // Clear sky
  if (weathercode === 0) {
    return isDay
      ? { background: 'linear-gradient(135deg, #f97316 0%, #dc2626 45%, #9a3412 100%)' }
      : { background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0c0a3e 100%)' }
  }
  // Mainly clear / partly cloudy
  if (weathercode <= 2) {
    return isDay
      ? { background: 'linear-gradient(135deg, #1d4ed8 0%, #0369a1 50%, #38bdf8 100%)' }
      : { background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #312e81 100%)' }
  }
  // Overcast
  if (weathercode === 3) {
    return { background: 'linear-gradient(135deg, #374151 0%, #4b5563 55%, #6b7280 100%)' }
  }
  // Fog / haze
  if (weathercode <= 49) {
    return { background: 'linear-gradient(135deg, #4b5563 0%, #6b7280 55%, #9ca3af 100%)' }
  }
  // Drizzle
  if (weathercode <= 59) {
    return { background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #334155 100%)' }
  }
  // Rain
  if (weathercode <= 69) {
    return { background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e293b 100%)' }
  }
  // Snow
  if (weathercode <= 79) {
    return { background: 'linear-gradient(135deg, #334155 0%, #475569 50%, #64748b 100%)' }
  }
  // Rain showers
  if (weathercode <= 82) {
    return { background: 'linear-gradient(135deg, #1e293b 0%, #1e3a5f 50%, #0f172a 100%)' }
  }
  // Snow showers
  if (weathercode <= 86) {
    return { background: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #7dd3fc 100%)' }
  }
  // Thunderstorm
  return { background: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #312e81 100%)' }
}
