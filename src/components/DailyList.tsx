import type { WeatherTone, DailyDay, Unit } from '../types'
import { toneStyles } from '../utils/sky'
import { conv } from '../utils/temperature'
import { useT } from '../i18n/LocaleContext'
import { WeatherGlyph } from './WeatherScene'

interface DailyListProps {
  days: DailyDay[]
  tone: WeatherTone
  accent: string
  unit?: Unit
}

export default function DailyList({ days, tone, accent, unit = 'C' }: DailyListProps) {
  const t = toneStyles(tone)
  const tr = useT()
  const his = days.map(d => d.hi)
  const los = days.map(d => d.lo)
  const gMax = Math.max(...his)
  const gMin = Math.min(...los)
  const span = Math.max(1, gMax - gMin)

  return (
    <div>
      {days.map((d, i) => {
        const left = ((d.lo - gMin) / span) * 100
        const right = ((d.hi - gMin) / span) * 100
        return (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '54px 34px 30px 1fr 30px',
            alignItems: 'center',
            gap: 10,
            padding: '11px 4px',
            borderTop: i === 0 ? 'none' : `1px solid ${t.track}`,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{d.isToday ? tr.today : tr.days[d.dayIndex]}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WeatherGlyph kind={d.cond} size={26} />
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: accent,
              textAlign: 'right',
              visibility: d.pop >= 30 ? 'visible' : 'hidden',
            }}>
              {d.pop}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: t.dim, width: 26, textAlign: 'right' }}>{conv(d.lo, unit)}°</span>
              <div style={{ position: 'relative', flex: 1, height: 6, borderRadius: 3, background: t.track }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${left}%`,
                  right: `${100 - right}%`,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, oklch(0.78 0.13 230), oklch(0.82 0.15 78), oklch(0.72 0.18 35))',
                }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, width: 26 }}>{conv(d.hi, unit)}°</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
