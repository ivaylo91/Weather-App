import type { WeatherTone, CityData } from '../types'
import { toneStyles } from '../utils/sky'
import Icon from './Icon'

interface TopBarProps {
  city: CityData
  tone: WeatherTone
  accent: string
  onLocation: () => void
  onBell: () => void
}

function iconBtnStyle(t: ReturnType<typeof toneStyles>) {
  return {
    position: 'relative' as const,
    width: 42,
    height: 42,
    borderRadius: 21,
    background: t.cardBg,
    border: `1px solid ${t.cardBorder}`,
    color: t.text,
    display: 'grid' as const,
    placeItems: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    flexShrink: 0,
  }
}

export default function TopBar({ city, tone, accent: _accent, onLocation, onBell }: TopBarProps) {
  const t = toneStyles(tone)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '2px 2px 4px' }}>
      <button
        onClick={onLocation}
        className="press"
        style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', color: t.text, cursor: 'pointer', textAlign: 'left', padding: 0 }}
      >
        <Icon name="pin" size={20} stroke={2.2} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{city.name}</span>
            <Icon name="chevronDown" size={17} stroke={2.6} style={{ flexShrink: 0, opacity: 0.7 }} />
          </div>
          <div style={{ fontSize: 12.5, color: t.dim, fontWeight: 600 }}>{city.time} · {city.region}</div>
        </div>
      </button>
      <button onClick={onBell} className="press" style={iconBtnStyle(t)} aria-label="Alerts">
        <Icon name="bell" size={20} stroke={2.2} />
        {city.alert && (
          <span style={{
            position: 'absolute',
            top: 9,
            right: 9,
            width: 9,
            height: 9,
            borderRadius: 5,
            background: 'oklch(0.64 0.21 25)',
            border: `2px solid ${tone === 'light' ? 'rgba(255,255,255,0.3)' : '#fff'}`,
          }} />
        )}
      </button>
    </div>
  )
}
