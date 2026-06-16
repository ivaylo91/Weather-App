import type { WeatherCondition, WeatherTone } from '../types'

// Large emoji displayed in the hero card
export const CONDITION_EMOJI: Record<WeatherCondition, string> = {
  'clear-day':           '☀️',
  'clear-night':         '🌙',
  'partly-cloudy-day':   '⛅',
  'partly-cloudy-night': '🌛',
  'cloudy':              '☁️',
  'rain':                '🌧️',
  'thunderstorm':        '⛈️',
  'snow':                '❄️',
  'fog':                 '🌫️',
}

// Per-condition gradient used as the hero card background
export const HERO_GRADIENT: Record<WeatherCondition, string> = {
  'clear-day':           'linear-gradient(145deg, #FFB347 0%, #FF7043 100%)',
  'clear-night':         'linear-gradient(145deg, #1E2E62 0%, #0D1740 100%)',
  'partly-cloudy-day':   'linear-gradient(145deg, #5BA8F0 0%, #3272CC 100%)',
  'partly-cloudy-night': 'linear-gradient(145deg, #263B70 0%, #142254 100%)',
  'cloudy':              'linear-gradient(145deg, #6B82C4 0%, #485A9E 100%)',
  'rain':                'linear-gradient(145deg, #3A74BC 0%, #1A4A8C 100%)',
  'thunderstorm':        'linear-gradient(145deg, #2D2B6E 0%, #181642 100%)',
  'snow':                'linear-gradient(145deg, #80AACC 0%, #5080AA 100%)',
  'fog':                 'linear-gradient(145deg, #8898BB 0%, #6575A0 100%)',
}

export interface ConditionDef {
  label: string
  particle: string
  L1: number
  L2: number
  C: number
  H: number
  accentH: number
}

export interface ThemeDef {
  name: string
  mode: 'natural' | 'fixed'
  h1?: number
  h2?: number
  cScale?: number
  cMin?: number
  accentL?: number
  accentC?: number
  accentH?: number
}

export interface SkyResult {
  gradient: string
  accent: string
  tone: WeatherTone
  c1: string
  c2: string
  particle: string
  avgL: number
}

export const CONDITIONS: Record<WeatherCondition, ConditionDef> = {
  'clear-day':           { label: 'Clear',         particle: 'sun',   L1: 0.80, L2: 0.90, C: 0.105, H: 240, accentH: 78 },
  'clear-night':         { label: 'Clear',         particle: 'stars', L1: 0.34, L2: 0.22, C: 0.075, H: 268, accentH: 78 },
  'partly-cloudy-day':   { label: 'Partly cloudy', particle: 'pcd',   L1: 0.76, L2: 0.87, C: 0.080, H: 242, accentH: 78 },
  'partly-cloudy-night': { label: 'Partly cloudy', particle: 'pcn',   L1: 0.34, L2: 0.24, C: 0.060, H: 264, accentH: 78 },
  'cloudy':              { label: 'Cloudy',        particle: 'cloud', L1: 0.74, L2: 0.82, C: 0.032, H: 250, accentH: 78 },
  'rain':                { label: 'Rain',          particle: 'rain',  L1: 0.58, L2: 0.68, C: 0.045, H: 246, accentH: 200 },
  'thunderstorm':        { label: 'Storms',        particle: 'storm', L1: 0.36, L2: 0.26, C: 0.055, H: 284, accentH: 78 },
  'snow':                { label: 'Snow',          particle: 'snow',  L1: 0.87, L2: 0.94, C: 0.020, H: 250, accentH: 230 },
  'fog':                 { label: 'Fog',           particle: 'fog',   L1: 0.79, L2: 0.85, C: 0.014, H: 250, accentH: 200 },
}

export const THEMES: Record<string, ThemeDef> = {
  Sky:    { name: 'Sky',    mode: 'natural' },
  Sunset: { name: 'Sunset', mode: 'fixed', h1: 42,  h2: 348, cScale: 1.5, cMin: 0.07, accentL: 0.80, accentC: 0.15, accentH: 58 },
  Aurora: { name: 'Aurora', mode: 'fixed', h1: 176, h2: 296, cScale: 1.4, cMin: 0.06, accentL: 0.82, accentC: 0.14, accentH: 168 },
  Mono:   { name: 'Mono',   mode: 'fixed', h1: 248, h2: 248, cScale: 0.12, cMin: 0,   accentL: 0.72, accentC: 0.16, accentH: 28 },
}

export function skyFor(conditionKey: WeatherCondition, themeKey: string): SkyResult {
  const c = CONDITIONS[conditionKey] || CONDITIONS['clear-day']
  const th = THEMES[themeKey] || THEMES.Sky
  let h1 = c.H, h2 = c.H, chroma = c.C
  let accent: string

  if (th.mode === 'fixed' && th.h1 !== undefined && th.h2 !== undefined) {
    h1 = th.h1
    h2 = th.h2
    chroma = Math.max(th.cMin ?? 0, c.C * (th.cScale ?? 1))
    accent = `oklch(${th.accentL} ${th.accentC} ${th.accentH})`
  } else {
    // natural sky — accent keyed to condition
    accent = `oklch(0.78 0.15 ${c.accentH})`
  }

  const c1 = `oklch(${c.L1} ${chroma} ${h1})`
  const c2 = `oklch(${c.L2} ${chroma} ${h2})`
  const avgL = (c.L1 + c.L2) / 2
  const tone: WeatherTone = avgL < 0.52 ? 'light' : 'dark'
  const gradient = `linear-gradient(165deg, ${c1} 0%, ${c2} 100%)`

  return { gradient, accent, tone, c1, c2, particle: c.particle, avgL }
}

export function toneStyles(tone: WeatherTone) {
  if (tone === 'light') return {
    // White text on a colored (hero card) background
    text: '#ffffff',
    dim: 'rgba(255,255,255,0.74)',
    faint: 'rgba(255,255,255,0.50)',
    cardBg: 'rgba(255,255,255,0.18)',
    cardBorder: 'rgba(255,255,255,0.28)',
    chip: 'rgba(255,255,255,0.22)',
    track: 'rgba(255,255,255,0.25)',
    shadow: '0 4px 20px rgba(0,0,0,0.18)',
  }
  // Dark navy text on a white card / light app background
  return {
    text: '#1A2952',
    dim: 'rgba(26,41,82,0.55)',
    faint: 'rgba(26,41,82,0.35)',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(26,41,82,0.07)',
    chip: '#EEF2FF',
    track: 'rgba(26,41,82,0.08)',
    shadow: '0 2px 20px rgba(26,41,82,0.09)',
  }
}
