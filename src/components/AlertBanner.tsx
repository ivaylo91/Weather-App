import type { WeatherTone, WeatherAlert } from '../types'
import { useT } from '../i18n/LocaleContext'
import Icon from './Icon'

interface AlertBannerProps {
  alerts: WeatherAlert[]
  tone?: WeatherTone
  onClick: () => void
}

function sevColor(sev: WeatherAlert['sev']) {
  return sev === 'Extreme' ? 'oklch(0.62 0.2 25)' : sev === 'Severe' ? 'oklch(0.66 0.18 45)' : 'oklch(0.72 0.15 75)'
}

export default function AlertBanner({ alerts, onClick }: AlertBannerProps) {
  const tr = useT()
  if (!alerts.length) return null

  const primary = alerts[0]
  const secondary = alerts[1]

  return (
    <div role="alert" aria-live="assertive" style={{ position: 'relative' }}>
      {/* Secondary alert peeking behind primary */}
      {secondary && (
        <div style={{
          position: 'absolute', bottom: -8, left: 8, right: 8, height: 48,
          background: sevColor(secondary.sev), borderRadius: 18, opacity: 0.7,
          zIndex: 0,
        }} />
      )}

      {/* Primary alert */}
      <button
        onClick={onClick}
        className="press"
        aria-label={`${alerts.length} weather alert${alerts.length > 1 ? 's' : ''}: ${primary.kind}. Tap for details.`}
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
          background: sevColor(primary.sev), color: '#fff', borderRadius: 20, padding: '13px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 8px 24px rgba(180,60,30,0.28)',
        }}
      >
        <Icon name="warn" size={22} stroke={2.2} aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 800 }}>
            {primary.kind}
            {alerts.length > 1 && (
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, opacity: 0.85,
                background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '2px 7px' }}>
                +{alerts.length - 1}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.92, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tr.until} {primary.until} · {tr.tapForDetails}
          </div>
        </div>
        <Icon name="chevron" size={18} stroke={2.4} aria-hidden="true" />
      </button>
    </div>
  )
}
