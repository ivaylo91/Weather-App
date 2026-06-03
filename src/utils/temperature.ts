import type { Unit } from '../types'

export function conv(celsius: number, unit: Unit): number {
  return unit === 'C' ? celsius : Math.round(celsius * 9 / 5 + 32)
}
