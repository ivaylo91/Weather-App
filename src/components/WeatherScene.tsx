import { useMemo, type CSSProperties } from 'react'
import { mulberry } from '../utils/mulberry'
import type { WeatherCondition } from '../types'

// ---- Cloud primitive ----
interface CloudProps {
  cx?: number
  cy?: number
  s?: number
  fill?: string
  opacity?: number
  stroke?: string
}

function Cloud({ cx = 100, cy = 90, s = 1, fill = '#ffffff', opacity = 1, stroke = 'none' }: CloudProps) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={opacity}>
      <ellipse cx="0" cy="14" rx="46" ry="20" fill={fill} stroke={stroke} strokeWidth={0} />
      <circle cx="-26" cy="6" r="20" fill={fill} />
      <circle cx="2" cy="-6" r="26" fill={fill} />
      <circle cx="28" cy="4" r="19" fill={fill} />
      <rect x="-46" y="8" width="92" height="20" rx="10" fill={fill} />
    </g>
  )
}

// ---- Sun disc ----
interface SunDiscProps {
  cx?: number
  cy?: number
  r?: number
  color?: string
  glow?: string
}

function SunDisc({ cx = 100, cy = 80, r = 30, color = '#FFC93C', glow = '#FFE08A' }: SunDiscProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 22} fill={glow} opacity="0.35" className="sun-glow" />
      <g className="sun-rays" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={cx - 2.5} y={cy - r - 20} width="5" height="14" rx="2.5" fill={color}
            transform={`rotate(${i * 30} ${cx} ${cy})`} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={r} fill={color} />
    </g>
  )
}

// ---- Moon ----
interface MoonProps {
  cx?: number
  cy?: number
  r?: number
}

function Moon({ cx = 110, cy = 74, r = 26 }: MoonProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 16} fill="#E9EEFF" opacity="0.20" className="sun-glow" />
      <circle cx={cx} cy={cy} r={r} fill="#EAF0FF" />
      <circle cx={cx + 11} cy={cy - 7} r={r} fill="rgba(255,255,255,0.0)" />
      <circle cx={cx + 12} cy={cy - 6} r={r - 1} fill="#C9D6F5" opacity="0.55" style={{ mixBlendMode: 'multiply' as const }} />
    </g>
  )
}

// ---- Stars ----
interface StarsProps {
  seed?: number
  n?: number
}

function Stars({ seed = 1, n = 22 }: StarsProps) {
  const stars = useMemo(() => {
    const r = mulberry(seed)
    const out: Array<{ x: number; y: number; s: number; d: number; dur: number }> = []
    for (let i = 0; i < n; i++) {
      out.push({ x: 8 + r() * 184, y: 6 + r() * 110, s: 0.6 + r() * 1.7, d: r() * 3, dur: 2 + r() * 2.5 })
    }
    return out
  }, [seed, n])

  return (
    <g>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#FFFFFF" className="twinkle"
          style={{ animationDelay: `${s.d}s`, animationDuration: `${s.dur}s` }} />
      ))}
    </g>
  )
}

// ---- Rain ----
interface RainProps {
  n?: number
  color?: string
  area?: number
  top?: number
}

function Rain({ n = 16, color = '#BFE0FF', area = 130, top = 96 }: RainProps) {
  const drops = useMemo(() => {
    const r = mulberry(99)
    const out: Array<{ x: number; d: number; dur: number; len: number }> = []
    for (let i = 0; i < n; i++) {
      out.push({ x: 36 + r() * area, d: r() * 1.1, dur: 0.7 + r() * 0.5, len: 10 + r() * 8 })
    }
    return out
  }, [n, area])

  return (
    <g>
      {drops.map((d, i) => (
        <rect key={i} x={d.x} y={top} width="2.6" height={d.len} rx="1.3" fill={color} className="raindrop"
          style={{ animationDelay: `${d.d}s`, animationDuration: `${d.dur}s` }} />
      ))}
    </g>
  )
}

// ---- Snow ----
interface SnowProps {
  n?: number
}

function Snow({ n = 16 }: SnowProps) {
  const flakes = useMemo(() => {
    const r = mulberry(42)
    const out: Array<{ x: number; d: number; dur: number; s: number; sway: string }> = []
    for (let i = 0; i < n; i++) {
      out.push({
        x: 32 + r() * 138,
        d: r() * 3,
        dur: 2.4 + r() * 2.4,
        s: 1.8 + r() * 2.4,
        sway: r() > 0.5 ? 'snow-sway-a' : 'snow-sway-b',
      })
    }
    return out
  }, [n])

  return (
    <g>
      {flakes.map((f, i) => (
        <circle key={i} cx={f.x} cy="100" r={f.s} fill="#FFFFFF" className={`snowflake ${f.sway}`}
          style={{ animationDelay: `${f.d}s`, animationDuration: `${f.dur}s` }} />
      ))}
    </g>
  )
}

// ---- Hero scene: full animated illustration ----
interface WeatherSceneProps {
  kind: string
  size?: number
}

export function WeatherScene({ kind, size = 200 }: WeatherSceneProps) {
  const vb = '0 0 200 160'
  const wrapStyle: CSSProperties = { overflow: 'visible', display: 'block' }

  const wrap = (children: React.ReactNode) => (
    <svg viewBox={vb} width={size} height={size * 0.8} style={wrapStyle}>
      {children}
    </svg>
  )

  switch (kind) {
    case 'sun':
      return wrap(<g className="float-slow"><SunDisc cx={100} cy={78} r={32} /></g>)
    case 'stars':
      return wrap(<g><Stars seed={7} n={26} /><g className="float-slow"><Moon cx={108} cy={70} r={28} /></g></g>)
    case 'pcd':
      return wrap(<g><g className="float-slow"><SunDisc cx={70} cy={56} r={24} /></g><g className="drift-a"><Cloud cx={118} cy={92} s={1.05} fill="#FDFEFF" /></g></g>)
    case 'pcn':
      return wrap(<g><Stars seed={3} n={16} /><g className="float-slow"><Moon cx={66} cy={54} r={22} /></g><g className="drift-a"><Cloud cx={120} cy={92} s={1.05} fill="#E7EDFB" /></g></g>)
    case 'cloud':
      return wrap(<g><g className="drift-b"><Cloud cx={78} cy={70} s={0.82} fill="#F2F6FC" opacity={0.9} /></g><g className="drift-a"><Cloud cx={112} cy={94} s={1.12} fill="#FFFFFF" /></g></g>)
    case 'rain':
      return wrap(<g><Rain n={16} /><g className="drift-a"><Cloud cx={100} cy={74} s={1.12} fill="#EAF0F7" /></g></g>)
    case 'storm':
      return wrap(<g><Rain n={10} color="#9FC6F0" /><g className="lightning"><path d="M96 96 L86 122 L98 122 L88 150 L114 116 L101 116 L110 96 Z" fill="#FFD23C" /></g><g className="drift-a"><Cloud cx={100} cy={72} s={1.16} fill="#D9DEEC" /></g></g>)
    case 'snow':
      return wrap(<g><Snow n={16} /><g className="drift-a"><Cloud cx={100} cy={74} s={1.12} fill="#FFFFFF" /></g></g>)
    case 'fog':
      return wrap(
        <g>
          <g className="float-slow" opacity="0.55"><SunDisc cx={108} cy={56} r={20} /></g>
          {[0, 1, 2, 3].map(i => (
            <rect key={i} x={26} y={86 + i * 14} width={148} height="6" rx="3"
              fill="#FFFFFF" opacity={0.5 - i * 0.05}
              className={i % 2 ? 'fog-a' : 'fog-b'}
              style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </g>
      )
    default:
      return wrap(<g className="float-slow"><SunDisc cx={100} cy={78} r={32} /></g>)
  }
}

// ---- Compact glyph for lists (smaller, lighter animation) ----
interface WeatherGlyphProps {
  kind: WeatherCondition | string
  size?: number
}

export function WeatherGlyph({ kind, size = 40 }: WeatherGlyphProps) {
  const k: string =
    kind === 'clear-day' ? 'sun'
    : kind === 'clear-night' ? 'stars-g'
    : kind === 'partly-cloudy-day' ? 'pcd'
    : kind === 'partly-cloudy-night' ? 'pcn'
    : kind === 'cloudy' ? 'cloud'
    : kind === 'rain' ? 'rain'
    : kind === 'thunderstorm' ? 'storm'
    : kind === 'snow' ? 'snow'
    : kind === 'fog' ? 'fog'
    : 'sun'

  const vb = '0 0 200 160'
  const wrapStyle: CSSProperties = { overflow: 'visible', display: 'block' }
  const w = (c: React.ReactNode) => (
    <svg viewBox={vb} width={size} height={size} style={wrapStyle}>{c}</svg>
  )

  switch (k) {
    case 'sun': return w(<SunDisc cx={100} cy={80} r={42} />)
    case 'stars-g': return w(<Moon cx={104} cy={78} r={40} />)
    case 'pcd': return w(<g><SunDisc cx={66} cy={56} r={30} /><Cloud cx={118} cy={98} s={1.1} fill="#FDFEFF" /></g>)
    case 'pcn': return w(<g><Moon cx={62} cy={54} r={28} /><Cloud cx={120} cy={98} s={1.1} fill="#E7EDFB" /></g>)
    case 'cloud': return w(<Cloud cx={100} cy={86} s={1.4} fill="#FFFFFF" />)
    case 'rain': return w(
      <g>
        <Cloud cx={100} cy={70} s={1.3} fill="#EAF0F7" />
        {[60, 92, 124].map((x, i) => (
          <rect key={i} x={x} y={108} width="6" height="20" rx="3" fill="#BFE0FF"
            className="raindrop" style={{ animationDuration: '0.9s', animationDelay: `${i * 0.2}s` }} />
        ))}
      </g>
    )
    case 'storm': return w(
      <g>
        <Cloud cx={100} cy={66} s={1.3} fill="#D9DEEC" />
        <path d="M96 96 L86 122 L98 122 L88 150 L114 116 L101 116 L110 96 Z" fill="#FFD23C" />
      </g>
    )
    case 'snow': return w(
      <g>
        <Cloud cx={100} cy={70} s={1.3} fill="#FFFFFF" />
        {[60, 92, 124].map((x, i) => (
          <circle key={i} cx={x + 3} cy={116} r="5" fill="#fff"
            className="snowflake" style={{ animationDuration: '2.6s', animationDelay: `${i * 0.4}s` }} />
        ))}
      </g>
    )
    case 'fog': return w(
      <g>
        <Cloud cx={100} cy={62} s={1.1} fill="#F2F6FC" />
        {[0, 1, 2].map(i => (
          <rect key={i} x={44} y={98 + i * 16} width={112} height="7" rx="3.5"
            fill="#fff" opacity={0.7 - i * 0.15} />
        ))}
      </g>
    )
    default: return w(<SunDisc cx={100} cy={80} r={42} />)
  }
}
