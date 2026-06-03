export type Unit = 'C' | 'F'

export type Location =
  | { type: 'city'; name: string }
  | { type: 'coords'; lat: number; lon: number; displayName: string; country?: string }
