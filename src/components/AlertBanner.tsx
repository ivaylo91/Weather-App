import type { WeatherTone, WeatherAlert } from '../types'
import { useT } from '../i18n/LocaleContext'
import Icon from './Icon'

interface AlertBannerProps {
  alert: WeatherAlert | null
  tone?: WeatherTone
  onClick: () => void
}

export default function AlertBanner({ alert, onClick }: AlertBannerProps) {
  const tr = useT()
  if (!alert) return null
  const sevColor = alert.sev === 'Extreme' ? 'oklch(0.62 0.2 25)' : alert.sev === 'Severe' ? 'oklch(0.66 0.18 45)' : 'oklch(0.72 0.15 75)'
  return (
    <div role="alert" aria-live="assertive">
      <button
        onClick={onClick}
        className="press"
        aria-label={`Weather alert: ${alert.kind}. In effect until ${alert.until}. Tap for details.`}
        style={{
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
          background: sevColor, color: '#fff', borderRadius: 20, padding: '13px 16px',
          display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 24px rgba(180,60,30,0.28)',
        }}
      >
        <Icon name="warn" size={22} stroke={2.2} aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800 }}>{alert.kind}</div>
          <div style={{ fontSize: 12.5, opacity: 0.92, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tr.until} {alert.until} · {tr.tapForDetails}
          </div>
        </div>
        <Icon name="chevron" size={18} stroke={2.4} aria-hidden="true" />
      </button>
    </div>
  )
}
