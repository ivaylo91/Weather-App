import type { WeatherTone } from '../types'
import { toneStyles } from '../utils/sky'
import Icon from './Icon'

const NAV_ITEMS = [
  { id: 'today', label: 'Today', icon: 'today' },
  { id: 'forecast', label: 'Forecast', icon: 'forecast' },
  { id: 'radar', label: 'Radar', icon: 'radar' },
  { id: 'cities', label: 'Cities', icon: 'cities' },
] as const

interface PillNavProps {
  view: string
  setView: (v: string) => void
  tone: WeatherTone
  accent: string
}

export default function PillNav({ view, setView, tone, accent }: PillNavProps) {
  const t = toneStyles(tone)
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 18, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 40 }}>
      <div style={{
        pointerEvents: 'auto',
        display: 'flex',
        gap: 4,
        padding: 6,
        background: tone === 'light' ? 'rgba(20,28,48,0.42)' : 'rgba(255,255,255,0.7)',
        border: `1px solid ${t.cardBorder}`,
        borderRadius: 26,
        boxShadow: '0 12px 40px rgba(20,30,60,0.28)',
        backdropFilter: 'blur(22px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.4)',
      }}>
        {NAV_ITEMS.map(it => {
          const active = view === it.id
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className="press"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                border: 'none',
                cursor: 'pointer',
                padding: active ? '11px 18px' : '11px 14px',
                borderRadius: 20,
                background: active ? accent : 'transparent',
                color: active ? '#fff' : t.text,
                transition: 'all .28s cubic-bezier(.4,0,.2,1)',
              }}
            >
              <Icon name={it.icon} size={21} stroke={2.2} />
              <span style={{
                fontSize: 13.5,
                fontWeight: 700,
                maxWidth: active ? 70 : 0,
                overflow: 'hidden',
                opacity: active ? 1 : 0,
                transition: 'all .28s cubic-bezier(.4,0,.2,1)',
                whiteSpace: 'nowrap',
              }}>
                {it.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
