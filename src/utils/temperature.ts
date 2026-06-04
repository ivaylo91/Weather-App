import type { Unit, WindUnit } from '../types'
import type { Locale } from '../i18n/translations'

/** Format a local ISO time string ("2024-06-04T15:30") per locale.
 *  Bulgarian → 24 h ("15:30"), others → 12 h ("3:30 PM"). */
export function formatLocalTime(isoTime: string | undefined, fallback: string, locale: Locale): string {
  if (!isoTime) return fallback
  const timePart = isoTime.split('T')[1]
  if (!timePart) return fallback
  const h = parseInt(timePart.split(':')[0] ?? '0', 10)
  const m = parseInt(timePart.split(':')[1] ?? '0', 10)
  const mm = m.toString().padStart(2, '0')
  if (locale === 'bg') return `${h.toString().padStart(2, '0')}:${mm}`
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${mm} ${ampm}`
}

export function conv(celsius: number, unit: Unit): number {
  return unit === 'C' ? celsius : Math.round(celsius * 9 / 5 + 32)
}

export function convWind(kmh: number, unit: WindUnit): number {
  if (unit === 'mph') return Math.round(kmh * 0.621371)
  if (unit === 'ms')  return Math.round(kmh * 0.277778)
  return Math.round(kmh)
}

export function windUnitLabel(unit: WindUnit): string {
  if (unit === 'mph') return 'mph'
  if (unit === 'ms')  return 'm/s'
  return 'km/h'
}
