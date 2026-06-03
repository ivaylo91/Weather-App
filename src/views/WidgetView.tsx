import type { CityData, Unit } from '../types'
import { skyFor, toneStyles, CONDITIONS } from '../utils/sky'
import { conv } from '../utils/temperature'
import { WeatherGlyph } from '../components/WeatherScene'

interface WidgetViewProps {
  data: CityData
  unit?: Unit
}

export default function WidgetView({ data, unit = 'C' }: WidgetViewProps) {
  const sky = skyFor(data.cond, 'Sky')
  const t = toneStyles(sky.tone)

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: sky.gradient,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{
        width: 'min(380px, 100%)',
        margin: '0 auto',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        color: t.text,
      }}>
        {/* Icon */}
        <div style={{ flexShrink: 0 }}>
          <WeatherGlyph kind={data.cond} size={96} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 2 }}>
            {data.name}
            {data.region ? ` · ${data.region}` : ''}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2, lineHeight: 1 }}>
            <span style={{ fontSize: 72, fontWeight: 400, letterSpacing: -4 }}>
              {conv(data.temp, unit)}
            </span>
            <span style={{ fontSize: 28, fontWeight: 300, marginTop: 10 }}>°</span>
          </div>

          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>
            {CONDITIONS[data.cond].label}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.65, marginTop: 4 }}>
            H:{conv(data.hi, unit)}° · L:{conv(data.lo, unit)}°
          </div>
        </div>
      </div>

      {/* Embed hint */}
      <div style={{ position: 'absolute', bottom: 10, right: 14, fontSize: 11, opacity: 0.4, fontWeight: 600, color: t.text }}>
        Sora Weather
      </div>
    </div>
  )
}
