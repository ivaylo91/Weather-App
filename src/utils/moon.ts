// Julian day of a known new moon (2000-01-06 18:14 UTC)
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0)
const SYNODIC_MONTH = 29.53059 // days

export type MoonPhaseName =
  | 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous'
  | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent'

export interface MoonPhase {
  phase: number        // 0–1, 0 = new moon, 0.5 = full moon
  illumination: number // 0–1
  name: MoonPhaseName
}

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const daysSince = (date.getTime() - KNOWN_NEW_MOON_MS) / 86_400_000
  const phase = ((daysSince % SYNODIC_MONTH) / SYNODIC_MONTH + 1) % 1
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2

  let name: MoonPhaseName
  if (phase < 0.03 || phase >= 0.97)   name = 'new'
  else if (phase < 0.22)               name = 'waxing-crescent'
  else if (phase < 0.28)               name = 'first-quarter'
  else if (phase < 0.47)               name = 'waxing-gibbous'
  else if (phase < 0.53)               name = 'full'
  else if (phase < 0.72)               name = 'waning-gibbous'
  else if (phase < 0.78)               name = 'last-quarter'
  else                                  name = 'waning-crescent'

  return { phase, illumination, name }
}

/**
 * Returns an SVG path `d` attribute tracing the lit portion of the moon.
 * Northern-hemisphere convention: right side lit while waxing, left while waning.
 *
 * How it works:
 *   - Main arc:  a full semicircle on the lit side
 *   - Terminator: an elliptical arc back across the face
 *     rx = R·cos(t·π), where t maps 0→new/full and 1→the opposite quarter.
 *     When rx > 0 the ellipse bulges outward (gibbous); when rx < 0 it curves
 *     inward (crescent) and the sweep flag flips to keep the area correct.
 */
export function moonSVGPath(phase: number, R: number, cx: number, cy: number): string {
  phase = ((phase % 1) + 1) % 1

  const waxing = phase < 0.5
  const t = waxing ? phase * 2 : (phase - 0.5) * 2 // 0 at new/full, 1 at opposite quarter

  const rx     = R * Math.cos(t * Math.PI)
  const absRx  = Math.abs(rx)
  const termSweep = rx >= 0 ? 0 : 1 // CCW = gibbous bulge; CW = crescent concave

  const T = `${cx} ${cy - R}` // top of circle
  const B = `${cx} ${cy + R}` // bottom of circle

  if (waxing) {
    // Right side lit: main arc goes T→B clockwise (sweep=1, large-arc=1)
    return `M ${T} A ${R} ${R} 0 1 1 ${B} A ${absRx} ${R} 0 0 ${termSweep} ${T}`
  } else {
    // Left side lit: main arc goes T→B counterclockwise (sweep=0, large-arc=1)
    return `M ${T} A ${R} ${R} 0 1 0 ${B} A ${absRx} ${R} 0 0 ${termSweep} ${T}`
  }
}
