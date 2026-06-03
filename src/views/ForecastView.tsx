import { useState, useMemo } from 'react'
import type { WeatherTone, CityData } from '../types'
import { toneStyles, CONDITIONS } from '../utils/sky'
import { mulberry } from '../utils/mulberry'
import { WeatherScene } from '../components/WeatherScene'
import { WeatherGlyph } from '../components/WeatherScene'
import { Card, SectionLabel } from '../components/Card'
import HourlyStrip from '../components/HourlyStrip'
import DailyList from '../components/DailyList'
import Icon from '../components/Icon'
import type { HourlyPoint } from '../types'

interface PrecipChartProps {
  hours: HourlyPoint[]
  tone: WeatherTone
  accent: string
}

function PrecipChart({ hours, tone, accent }: PrecipChartProps) {
  const t = toneStyles(tone)
  const cellW = 30
  return (
    <div style={{ overflowX: 'auto', margin: '0 -4px' }} className="hide-scroll">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, height: 96, width: hours.length * cellW }}>
        {hours.map((h, i) => (
          <div key={i} style={{ width: cellW, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: t.dim, height: 12 }}>{h.pop >= 30 ? h.pop : ''}</div>
            <div style={{ width: 11, height: Math.max(3, (h.pop / 100) * 56), borderRadius: 6, background: h.pop >= 30 ? accent : t.track, opacity: h.pop >= 30 ? 1 : 0.7 }} />
            <div style={{ fontSize: 9.5, fontWeight: 600, color: t.faint }}>
              {i % 3 === 0 ? fmtHour(h.hour) : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function fmtHour(h: number): string {
  const am = h < 12
  let hr = h % 12
  if (hr === 0) hr = 12
  return `${hr}${am ? 'a' : 'p'}`
}

interface ForecastViewProps {
  city: CityData
  tone: WeatherTone
  accent: string
}

export default function ForecastView({ city, tone, accent }: ForecastViewProps) {
  const t = toneStyles(tone)
  const [sel, setSel] = useState(0)
  const day = city.daily[sel]

  const stats = useMemo(() => {
    const r = mulberry(sel * 31 + 5)
    return {
      pop: day.pop,
      wind: Math.round(8 + r() * 28),
      humidity: Math.round(50 + r() * 40),
      uv: Math.max(0, Math.round((1 - sel * 0.05) * city.det.uv + (r() - 0.5) * 2)),
    }
  }, [sel, day.pop, city.det.uv])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* day chips */}
      <div style={{ overflowX: 'auto', margin: '0 -4px', padding: '0 4px' }} className="hide-scroll">
        <div style={{ display: 'flex', gap: 8 }}>
          {city.daily.map((dd, i) => {
            const active = i === sel
            return (
              <button key={i} onClick={() => setSel(i)} className="press" style={{
                flexShrink: 0, width: 64, padding: '12px 6px', borderRadius: 20,
                border: `1px solid ${active ? 'transparent' : t.cardBorder}`,
                background: active ? accent : t.cardBg,
                color: active ? '#fff' : t.text,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 800 }}>{dd.day === 'Today' ? 'Today' : dd.day}</span>
                <WeatherGlyph kind={dd.cond} size={26} />
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{dd.hi}°</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* selected day summary */}
      <Card tone={tone} pad={22}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <WeatherScene kind={day.cond} size={120} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {day.day === 'Today' ? 'Today' : day.day}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, margin: '2px 0 6px' }}>{CONDITIONS[day.cond].label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: -2 }}>{day.hi}°</span>
              <span style={{ fontSize: 22, fontWeight: 500, color: t.dim }}>{day.lo}°</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 14 }}>
          {[
            ['umbrella', 'Precip', `${stats.pop}%`],
            ['wind', 'Wind', `${stats.wind}`],
            ['drop', 'Humidity', `${stats.humidity}%`],
            ['today', 'UV', `${stats.uv}`],
          ].map(([ic, lb, vl]) => (
            <div key={lb} style={{ textAlign: 'center', padding: '10px 4px', borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
              <div style={{ display: 'grid', placeItems: 'center', color: accent, marginBottom: 4 }}>
                <Icon name={ic} size={18} stroke={2.2} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{vl}</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: t.dim, textTransform: 'uppercase', letterSpacing: 0.4 }}>{lb}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* hourly curve */}
      <Card tone={tone}>
        <SectionLabel tone={tone} icon="today">Hourly temperature</SectionLabel>
        <HourlyStrip hours={city.hourly} tone={tone} accent={accent} />
      </Card>

      {/* precip */}
      <Card tone={tone}>
        <SectionLabel tone={tone} icon="umbrella">Chance of precipitation</SectionLabel>
        <PrecipChart hours={city.hourly} tone={tone} accent={accent} />
      </Card>

      {/* full 7-day */}
      <Card tone={tone}>
        <SectionLabel tone={tone} icon="forecast">Next 7 days</SectionLabel>
        <DailyList days={city.daily} tone={tone} accent={accent} />
      </Card>
    </div>
  )
}
