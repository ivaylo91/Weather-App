import type { ReactNode } from 'react'
import type { WeatherTone, CityData } from '../types'
import { toneStyles } from '../utils/sky'
import { Card } from './Card'
import Icon from './Icon'

// ---- Detail metric card ----
interface DetailCardProps {
  tone: WeatherTone
  accent: string
  icon: string
  label: string
  value: string | number
  unit?: string
  sub?: string
  children?: ReactNode
}

export function DetailCard({ tone, accent: _accent, icon, label, value, unit, sub, children }: DetailCardProps) {
  const t = toneStyles(tone)
  return (
    <Card tone={tone} pad={16} style={{ borderRadius: 22, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 116 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: t.dim, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        <Icon name={icon} size={15} stroke={2.2} />{label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.5 }}>{value}</span>
        {unit && <span style={{ fontSize: 14, fontWeight: 600, color: t.dim }}>{unit}</span>}
      </div>
      {children}
      {sub && <div style={{ fontSize: 12.5, color: t.dim, fontWeight: 500, marginTop: 'auto' }}>{sub}</div>}
    </Card>
  )
}

// ---- Sun arc ----
interface SunArcProps {
  city: CityData
  tone: WeatherTone
  accent: string
}

function parseHour(timeStr: string): number {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(timeStr || '')
  if (!m) return 13
  let h = parseInt(m[1], 10) % 12
  if (/PM/i.test(m[3])) h += 12
  return h + parseInt(m[2], 10) / 60
}

export function SunArc({ city, tone, accent }: SunArcProps) {
  const t = toneStyles(tone)
  const cur = parseHour(city.time)
  const isNight = cur < city.sunrise || cur > city.sunset
  const frac = Math.max(0, Math.min(1, (cur - city.sunrise) / Math.max(1, city.sunset - city.sunrise)))
  const W = 280, H = 96, pad = 16
  const ax = pad + frac * (W - pad * 2)
  const baseline = H - 20, arcH = 58
  const ay = baseline - Math.sin(Math.PI * frac) * arcH

  const pathPts: string[] = []
  for (let i = 0; i <= 40; i++) {
    const f = i / 40
    pathPts.push(`${pad + f * (W - pad * 2)},${baseline - Math.sin(Math.PI * f) * arcH}`)
  }

  return (
    <Card tone={tone} pad={16} style={{ borderRadius: 22, gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: t.dim, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
        <Icon name="sunUp" size={15} stroke={2.2} />Sun
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <line x1={pad} y1={baseline} x2={W - pad} y2={baseline} stroke={t.track} strokeWidth="1.5" strokeDasharray="2 5" />
        <polyline points={pathPts.join(' ')} fill="none" stroke={t.faint} strokeWidth="2" strokeDasharray="3 5" />
        {!isNight && (
          <polyline
            points={pathPts.slice(0, Math.round(frac * 40) + 1).join(' ')}
            fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        )}
        <circle cx={ax} cy={isNight ? baseline : ay} r={isNight ? 5 : 8} fill={isNight ? t.faint : accent} />
        {!isNight && <circle cx={ax} cy={ay} r="14" fill={accent} opacity="0.25" />}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 13 }}>
        <div>
          <div style={{ color: t.dim, fontSize: 11, fontWeight: 700 }}>SUNRISE</div>
          <div style={{ fontWeight: 700 }}>{city.det.sunriseT}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: t.dim, fontSize: 11, fontWeight: 700 }}>SUNSET</div>
          <div style={{ fontWeight: 700 }}>{city.det.sunsetT}</div>
        </div>
      </div>
    </Card>
  )
}

// ---- UV card ----
interface UVCardProps {
  city: CityData
  tone: WeatherTone
  accent: string
}

export function UVCard({ city, tone, accent }: UVCardProps) {
  const uv = city.det.uv
  const frac = Math.min(1, uv / 11)
  return (
    <DetailCard tone={tone} accent={accent} icon="today" label="UV Index" value={uv} sub={city.det.uvLabel}>
      <div style={{ height: 6, borderRadius: 3, background: 'linear-gradient(90deg, oklch(0.8 0.15 150), oklch(0.85 0.16 95), oklch(0.78 0.18 55), oklch(0.65 0.22 25))', position: 'relative', marginTop: 2 }}>
        <div style={{ position: 'absolute', top: -3, left: `calc(${frac * 100}% - 6px)`, width: 12, height: 12, borderRadius: 6, background: '#fff', border: '2px solid ' + accent, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
    </DetailCard>
  )
}

// ---- Wind card ----
interface WindCardProps {
  city: CityData
  tone: WeatherTone
  accent: string
}

export function WindCard({ city, tone, accent }: WindCardProps) {
  const t = toneStyles(tone)
  const dirs: Record<string, number> = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315, WNW: 292, ENE: 67, ESE: 112, WSW: 247, NNE: 22, SSE: 157, SSW: 202, NNW: 337 }
  const deg = dirs[city.det.windDir] ?? 0
  return (
    <DetailCard tone={tone} accent={accent} icon="wind" label="Wind" value={city.det.wind} unit="km/h" sub={`Gusts ${city.det.gust} km/h`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: -2 }}>
        <div style={{ position: 'relative', width: 42, height: 42, borderRadius: 21, border: `1.5px solid ${t.track}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 2, fontSize: 8, fontWeight: 800, color: t.dim }}>N</span>
          <div style={{ transform: `rotate(${deg}deg)`, color: accent, display: 'grid', placeItems: 'center' }}>
            <Icon name="chevron" size={16} stroke={3} style={{ transform: 'rotate(-90deg)' }} />
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.dim }}>{city.det.windDir}</div>
      </div>
    </DetailCard>
  )
}
