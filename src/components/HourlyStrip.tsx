import type { WeatherTone, HourlyPoint, Unit } from '../types'
import { toneStyles } from '../utils/sky'
import { conv } from '../utils/temperature'
import { useT } from '../i18n/LocaleContext'
import { WeatherGlyph } from './WeatherScene'

function smoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1]
    const mx = (p0.x + p1.x) / 2
    d += ` C ${mx} ${p0.y} ${mx} ${p1.y} ${p1.x} ${p1.y}`
  }
  return d
}

function fmtHour(h: number): string {
  const am = h < 12
  let hr = h % 12
  if (hr === 0) hr = 12
  return `${hr}${am ? 'a' : 'p'}`
}

interface HourlyStripProps {
  hours: HourlyPoint[]
  tone: WeatherTone
  accent: string
  unit?: Unit
}

export default function HourlyStrip({ hours, tone, accent, unit = 'C' }: HourlyStripProps) {
  const t = toneStyles(tone)
  const tr = useT()
  if (!hours.length) return null  // nothing to render until data arrives
  const cellW = 62
  const H = 150
  const n = hours.length
  const totalW = n * cellW
  const temps = hours.map(h => h.temp)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  const span = Math.max(1, max - min)
  const top = 40
  const band = 40
  const BAR_MAX = 18  // max bar height px
  const pts = hours.map((h, i) => ({
    x: i * cellW + cellW / 2,
    y: top + (1 - (h.temp - min) / span) * band,
  }))
  const line = smoothPath(pts)
  const area = `${line} L ${pts[n - 1].x} ${H} L ${pts[0].x} ${H} Z`

  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden', margin: '0 -4px', paddingBottom: 4 }} className="hide-scroll">
      <div style={{ position: 'relative', width: totalW, height: H }}>
        <svg width={totalW} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="hourArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.34" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#hourArea)" />
          <path d={line} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          {pts.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r={hours[i].now ? 5 : 3}
              fill={hours[i].now ? accent : t.text}
              opacity={hours[i].now ? 1 : 0.5} />
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {hours.map((h, i) => (
            <div key={i} style={{
              width: cellW,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 8,
              paddingBottom: 10,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: h.now ? accent : t.dim }}>
                {h.now ? tr.now : fmtHour(h.hour)}
              </div>
              <div style={{ height: 30 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ transform: 'scale(0.92)' }}>
                  <WeatherGlyph kind={h.cond} size={26} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{conv(h.temp, unit)}°</div>
                {/* Precipitation bar */}
                <div style={{ display: 'flex', alignItems: 'flex-end', height: BAR_MAX + 2 }}>
                  <div style={{
                    width: 20, borderRadius: '3px 3px 0 0',
                    height: Math.max(3, (h.pop / 100) * BAR_MAX),
                    background: h.pop >= 10 ? accent : t.track,
                    opacity: h.pop >= 10 ? 0.7 + h.pop / 100 * 0.3 : 0.3,
                    transition: 'height .3s',
                  }} />
                </div>
                {h.pop >= 20 && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: accent, marginTop: -2 }}>
                    {h.pop}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
