import { useQuery } from '@tanstack/react-query'
import type { WeatherTone, Unit } from '../types'
import { toneStyles } from '../utils/sky'
import { conv } from '../utils/temperature'
import { fetchHistoricalWeather } from '../api/weather'
import { Card, SectionLabel } from './Card'

interface Props {
  lat: number
  lon: number
  tone: WeatherTone
  accent: string
  unit: Unit
}

function smoothPath(pts: Array<{ x: number; y: number }>) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2
    d += ` C ${mx} ${pts[i].y} ${mx} ${pts[i + 1].y} ${pts[i + 1].x} ${pts[i + 1].y}`
  }
  return d
}

export default function HistorySparkline({ lat, lon, tone, accent, unit }: Props) {
  const t = toneStyles(tone)

  const { data, isLoading } = useQuery({
    queryKey: ['history', lat, lon],
    queryFn: () => fetchHistoricalWeather(lat, lon),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    retry: 1,
  })

  if (isLoading || !data?.length) return null

  const W = 340, H = 72, PAD = 4
  const maxTemps = data.map(d => conv(d.max, unit))
  const minTemps = data.map(d => conv(d.min, unit))
  const allTemps = [...maxTemps, ...minTemps]
  const lo = Math.min(...allTemps)
  const hi = Math.max(...allTemps)
  const span = Math.max(1, hi - lo)
  const n = data.length

  const toY = (v: number) => PAD + (1 - (v - lo) / span) * (H - PAD * 2)
  const toX = (i: number) => (i / (n - 1)) * W

  const maxPts = maxTemps.map((v, i) => ({ x: toX(i), y: toY(v) }))
  const minPts = minTemps.map((v, i) => ({ x: toX(i), y: toY(v) }))
  const maxLine = smoothPath(maxPts)
  const minLine = smoothPath(minPts)

  // Band fill between max and min
  const band = `${maxLine} L ${toX(n - 1)} ${toY(minTemps[n - 1])} ` +
    minPts.slice().reverse().map((p, i) =>
      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    ).join(' ')

  // Today's temp range
  const todayMax = maxTemps[n - 1]
  const todayMin = minTemps[n - 1]

  return (
    <Card tone={tone}>
      <SectionLabel tone={tone} icon="forecast">30-day temperature</SectionLabel>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Band between max and min */}
        <path d={`${maxLine} L ${toX(n - 1)} ${toY(minTemps[n - 1])} ${minLine.replace('M', 'L')} Z`}
          fill="url(#bandFill)" />
        {/* Max temp line */}
        <path d={maxLine} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        {/* Min temp line */}
        <path d={minLine} fill="none" stroke={t.faint} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
        {/* Today dot */}
        <circle cx={toX(n - 1)} cy={toY(todayMax)} r="4" fill={accent} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11.5, fontWeight: 600, color: t.dim }}>
        <span>{data[0].date.slice(5)} – {data[n - 1].date.slice(5)}</span>
        <span style={{ color: t.text }}>Today {todayMax}° / {todayMin}°</span>
      </div>
    </Card>
  )
}
