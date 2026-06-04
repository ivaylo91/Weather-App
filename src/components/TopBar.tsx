import type { WeatherTone, CityData } from '../types'
import { toneStyles } from '../utils/sky'
import { useLocale } from '../i18n/LocaleContext'
import { formatLocalTime } from '../utils/temperature'
import Icon from './Icon'

interface TopBarProps {
  city: CityData
  tone: WeatherTone
  accent: string
  onLocation: () => void
  onBell: () => void
  onSettings: () => void
}

function iconBtnStyle(t: ReturnType<typeof toneStyles>) {
  return {
    position: 'relative' as const,
    width: 42, height: 42, borderRadius: 21,
    background: t.cardBg, border: `1px solid ${t.cardBorder}`,
    color: t.text, display: 'grid' as const, placeItems: 'center',
    cursor: 'pointer', backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', flexShrink: 0,
  }
}

export default function TopBar({ city, tone, onLocation, onBell, onSettings }: TopBarProps) {
  const t = toneStyles(tone)
  const { locale } = useLocale()
  const displayTime = formatLocalTime(city.timeISO, city.time, locale)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 2px 4px' }}>
      {/* Location button */}
      <button
        onClick={onLocation}
        className="press"
        aria-label={`Current location: ${city.name}. Tap to switch cities.`}
        style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', color: t.text, cursor: 'pointer', textAlign: 'left', padding: 0 }}
      >
        <Icon name="pin" size={20} stroke={2.2} aria-hidden="true" />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {city.name}
            </span>
            <Icon name="chevronDown" size={17} stroke={2.6} style={{ flexShrink: 0, opacity: 0.7 }} aria-hidden="true" />
          </div>
          <div style={{ fontSize: 12.5, color: t.dim, fontWeight: 600 }}>{displayTime} · {city.region}</div>
        </div>
      </button>

      {/* Settings */}
      <button
        onClick={onSettings}
        className="press"
        style={iconBtnStyle(t)}
        aria-label="Settings"
      >
        <Icon name="settings" size={20} stroke={2.2} aria-hidden="true" />
      </button>

      {/* Bell / alerts */}
      <button
        onClick={onBell}
        className="press"
        style={iconBtnStyle(t)}
        aria-label={city.alerts?.length ? `${city.alerts.length} weather alert${city.alerts.length > 1 ? 's' : ''}. Tap for details.` : 'No active alerts'}
      >
        <Icon name="bell" size={20} stroke={2.2} aria-hidden="true" />
        {city.alerts?.length > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute', top: 9, right: 9,
              width: 9, height: 9, borderRadius: 5,
              background: 'oklch(0.64 0.21 25)',
              border: `2px solid ${tone === 'light' ? 'rgba(255,255,255,0.3)' : '#fff'}`,
            }}
          />
        )}
      </button>
    </div>
  )
}
