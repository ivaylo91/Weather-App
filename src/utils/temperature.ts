import type { Unit, WindUnit } from '../types'

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
