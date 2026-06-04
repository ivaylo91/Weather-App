import type { WeatherTone, WeatherAlert, CityData } from '../types'
import { useT } from '../i18n/LocaleContext'
import Icon from './Icon'

interface AlertSheetProps {
  alerts: WeatherAlert[]
  city: CityData
  tone: WeatherTone
  accent: string
  notifPermission?: NotificationPermission
  onEnableNotif?: () => void
  onClose: () => void
}

function sevColor(sev: WeatherAlert['sev']) {
  return sev === 'Extreme' ? 'oklch(0.62 0.2 25)' : sev === 'Severe' ? 'oklch(0.66 0.18 45)' : 'oklch(0.72 0.15 75)'
}

function AlertItem({ alert, city, subtle, fg }: { alert: WeatherAlert; city: CityData; subtle: string; fg: string }) {
  const tr = useT()
  const color = sevColor(alert.sev)
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="warn" size={22} stroke={2.2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: fg }}>{alert.kind}</div>
          <div style={{ fontSize: 12.5, color, fontWeight: 700 }}>{alert.sev} · {city.name}</div>
        </div>
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.55, opacity: 0.85, marginBottom: 10, color: fg }}>{alert.text}</div>
      <div style={{ display: 'flex', gap: 10, fontSize: 13 }}>
        <div style={{ flex: 1, padding: '10px 12px', borderRadius: 14, background: subtle }}>
          <div style={{ opacity: 0.6, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: fg }}>{tr.inEffectUntil}</div>
          <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2, color: fg }}>{alert.until}</div>
        </div>
        <div style={{ flex: 1, padding: '10px 12px', borderRadius: 14, background: subtle }}>
          <div style={{ opacity: 0.6, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: fg }}>{tr.alertSource}</div>
          <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2, color: fg }}>
            {city.latitude >= 18 && city.latitude <= 72 && city.longitude >= -180 && city.longitude <= -65 ? 'NWS' : 'MeteoAlarm'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AlertSheet({ alerts, city, tone, notifPermission, onEnableNotif, onClose }: AlertSheetProps) {
  const tr = useT()
  if (!alerts.length) return null

  const bg = tone === 'light' ? '#1b2540' : '#fff'
  const fg = tone === 'light' ? '#fff' : '#15243f'
  const subtle = tone === 'light' ? 'rgba(255,255,255,0.08)' : 'rgba(20,30,60,0.05)'
  const divider = tone === 'light' ? 'rgba(255,255,255,0.12)' : 'rgba(20,30,60,0.08)'

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(12,18,34,0.42)', zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(520px, 100%)', background: bg, color: fg, borderRadius: '28px 28px 0 0', padding: '10px 22px 30px', boxShadow: '0 -10px 50px rgba(0,0,0,0.3)', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 3, background: tone === 'light' ? 'rgba(255,255,255,0.25)' : 'rgba(20,30,60,0.18)', margin: '0 auto 18px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {alerts.length > 1 ? `${alerts.length} Active Warnings` : alerts[0].kind}
          </div>
          <button onClick={onClose} className="press" style={{ width: 34, height: 34, borderRadius: 17, border: 'none', background: subtle, color: fg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <Icon name="close" size={17} stroke={2.4} />
          </button>
        </div>

        {/* Alert list */}
        {alerts.map((alert, i) => (
          <div key={i}>
            {i > 0 && <div style={{ height: 1, background: divider, marginBottom: 20 }} />}
            <AlertItem alert={alert} city={city} subtle={subtle} fg={fg} />
          </div>
        ))}

        {/* Notification opt-in */}
        {typeof Notification !== 'undefined' && notifPermission !== 'granted' && onEnableNotif && (
          <button
            onClick={onEnableNotif}
            className="press"
            style={{ width: '100%', padding: '13px 16px', borderRadius: 16, border: `1px solid ${sevColor(alerts[0].sev)}`, background: 'transparent', color: sevColor(alerts[0].sev), fontWeight: 700, fontSize: 14.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
          >
            <Icon name="bell" size={18} stroke={2.2} />
            {notifPermission === 'denied' ? tr.notificationsBlocked : tr.enableNotifications}
          </button>
        )}
        {notifPermission === 'granted' && (
          <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.55, fontWeight: 600 }}>
            {tr.notificationsEnabled}
          </div>
        )}
      </div>
    </div>
  )
}
