import type { CityData, Unit } from '../types'
import { skyFor, toneStyles } from '../utils/sky'
import { conv } from '../utils/temperature'
import { WeatherGlyph } from '../components/WeatherScene'
import { WeatherScene } from '../components/WeatherScene'

// Sizes:
//   sm  — 400×120  compact bar (temperature + city + icon)
//   md  — 800×420  default card (existing layout)
//   lg  — 800×600  expanded card (adds H/L/Feels/hourly summary)

interface WidgetViewProps {
  data: CityData
  unit?: Unit
  size?: 'sm' | 'md' | 'lg'
}

export default function WidgetView({ data, unit = 'C', size = 'md' }: WidgetViewProps) {
  const sky = skyFor(data.cond, 'Sky')
  const t = toneStyles(sky.tone)
  const temp = conv(data.temp, unit)
  const hi = conv(data.hi, unit)
  const lo = conv(data.lo, unit)

  if (size === 'sm') {
    return (
      <div style={{
        width: '100%', height: 120,
        background: sky.gradient, color: t.text,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        <WeatherGlyph kind={data.cond} size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.75 }}>{data.name}</div>
          <div style={{ fontSize: 40, fontWeight: 300, letterSpacing: -2, lineHeight: 1 }}>{temp}°</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 15, fontWeight: 700, opacity: 0.85 }}>{data.cond.replace(/-/g, ' ')}</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>H:{hi}° L:{lo}°</div>
        </div>
        <div style={{ position: 'absolute', bottom: 6, right: 10, fontSize: 9, opacity: 0.35, fontWeight: 600 }}>Времето днес</div>
      </div>
    )
  }

  if (size === 'lg') {
    const d = data.det
    return (
      <div style={{
        width: '100%', minHeight: 600,
        background: sky.gradient, color: t.text,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32 }}>
          <WeatherScene kind={sky.particle} size={180} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.7, marginBottom: 4 }}>{data.name}{data.region ? ` · ${data.region}` : ''}</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 1 }}>
              <span style={{ fontSize: 120, fontWeight: 300, letterSpacing: -6 }}>{temp}</span>
              <span style={{ fontSize: 48, fontWeight: 300, marginTop: 18 }}>°</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{data.cond.replace(/-/g, ' ')}</div>
            <div style={{ fontSize: 15, opacity: 0.65, marginTop: 6 }}>H:{hi}° · L:{lo}° · Feels {conv(d.feels, unit)}°</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, width: '100%', maxWidth: 680 }}>
          {[
            ['💧', 'Humidity', `${d.humidity}%`],
            ['💨', 'Wind', `${d.wind} km/h`],
            ['🌅', 'Sunrise', d.sunriseT],
            ['🌇', 'Sunset', d.sunsetT],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22 }}>{icon}</div>
              <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 14, right: 20, fontSize: 12, opacity: 0.35, fontWeight: 600 }}>Времето днес</div>
      </div>
    )
  }

  // md (default)
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: sky.gradient,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{ width: 'min(380px, 100%)', margin: '0 auto', padding: 24, display: 'flex', alignItems: 'center', gap: 20, color: t.text }}>
        <div style={{ flexShrink: 0 }}>
          <WeatherGlyph kind={data.cond} size={96} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 2 }}>{data.name}{data.region ? ` · ${data.region}` : ''}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2, lineHeight: 1 }}>
            <span style={{ fontSize: 72, fontWeight: 400, letterSpacing: -4 }}>{temp}</span>
            <span style={{ fontSize: 28, fontWeight: 300, marginTop: 10 }}>°</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{data.cond.replace(/-/g, ' ')}</div>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.65, marginTop: 4 }}>H:{hi}° · L:{lo}°</div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 14, fontSize: 11, opacity: 0.4, fontWeight: 600, color: t.text }}>Времето днес</div>
    </div>
  )
}
