import type { WeatherTone, WeatherAlert, CityData } from '../types'
import Icon from './Icon'

interface AlertSheetProps {
  alert: WeatherAlert | null
  city: CityData
  tone: WeatherTone
  accent: string
  onClose: () => void
}

export default function AlertSheet({ alert, city, tone, onClose }: AlertSheetProps) {
  if (!alert) return null
  const sevColor = alert.sev === 'Extreme' ? 'oklch(0.62 0.2 25)' : alert.sev === 'Severe' ? 'oklch(0.66 0.18 45)' : 'oklch(0.72 0.15 75)'

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(12,18,34,0.42)', zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(520px, 100%)',
          background: tone === 'light' ? '#1b2540' : '#fff',
          color: tone === 'light' ? '#fff' : '#15243f',
          borderRadius: '28px 28px 0 0',
          padding: '10px 22px 30px',
          boxShadow: '0 -10px 50px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 3, background: tone === 'light' ? 'rgba(255,255,255,0.25)' : 'rgba(20,30,60,0.18)', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: sevColor, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon name="warn" size={26} stroke={2.2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{alert.kind}</div>
            <div style={{ fontSize: 13, color: sevColor, fontWeight: 700 }}>{alert.sev} · {city.name}</div>
          </div>
          <button onClick={onClose} className="press" style={{ width: 36, height: 36, borderRadius: 18, border: 'none', background: tone === 'light' ? 'rgba(255,255,255,0.12)' : 'rgba(20,30,60,0.07)', color: 'inherit', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <Icon name="close" size={18} stroke={2.4} />
          </button>
        </div>
        <div style={{ fontSize: 15.5, lineHeight: 1.55, opacity: 0.86, marginBottom: 18 }}>{alert.text}</div>
        <div style={{ display: 'flex', gap: 10, fontSize: 13.5 }}>
          <div style={{ flex: 1, padding: '12px 14px', borderRadius: 16, background: tone === 'light' ? 'rgba(255,255,255,0.08)' : 'rgba(20,30,60,0.05)' }}>
            <div style={{ opacity: 0.6, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>In effect until</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 3 }}>{alert.until}</div>
          </div>
          <div style={{ flex: 1, padding: '12px 14px', borderRadius: 16, background: tone === 'light' ? 'rgba(255,255,255,0.08)' : 'rgba(20,30,60,0.05)' }}>
            <div style={{ opacity: 0.6, fontWeight: 700, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Source</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 3 }}>Sora Alerts</div>
          </div>
        </div>
      </div>
    </div>
  )
}
