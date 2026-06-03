import { useState, useEffect, useMemo } from 'react'
import type { WeatherTone, CityData } from '../types'
import { toneStyles } from '../utils/sky'
import { mulberry } from '../utils/mulberry'
import { Card } from '../components/Card'
import Icon from '../components/Icon'

const RADAR_FRAMES = ['-90 min', '-60 min', '-30 min', 'Now', '+30 min', '+60 min']

interface RadarViewProps {
  city: CityData
  tone: WeatherTone
  accent: string
}

export default function RadarView({ city, tone, accent }: RadarViewProps) {
  const t = toneStyles(tone)
  const [frame, setFrame] = useState(3)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setFrame(f => (f + 1) % RADAR_FRAMES.length), 1100)
    return () => clearInterval(id)
  }, [playing])

  const blobs = useMemo(() => {
    const seed = city.id.charCodeAt(0) * 17 + 3
    const r = mulberry(seed)
    const n = city.cond === 'rain' || city.cond === 'thunderstorm' ? 6
      : city.cond === 'snow' ? 5
      : city.cond === 'cloudy' || city.cond === 'fog' ? 4
      : 2
    const out: Array<{ x: number; y: number; rx: number; ry: number; hue: number; intensity: number; dx: number }> = []
    for (let i = 0; i < n; i++) {
      out.push({
        x: 15 + r() * 70,
        y: 15 + r() * 70,
        rx: 12 + r() * 22,
        ry: 10 + r() * 18,
        hue: city.cond === 'thunderstorm' ? 280 : city.cond === 'snow' ? 230 : 220,
        intensity: 0.3 + r() * 0.5,
        dx: (r() - 0.5) * 6,
      })
    }
    return out
  }, [city.id, city.cond])

  const drift = (frame - 3) * 4
  const hasPrecip = ['rain', 'thunderstorm', 'snow'].includes(city.cond)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card tone={tone} pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1.05', background: 'linear-gradient(160deg, oklch(0.42 0.04 250), oklch(0.32 0.05 255))', overflow: 'hidden' }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <g fill="oklch(0.5 0.04 200)" opacity="0.5">
              <ellipse cx="22" cy="30" rx="26" ry="18" />
              <ellipse cx="74" cy="64" rx="30" ry="22" />
              <ellipse cx="40" cy="80" rx="20" ry="14" />
            </g>
            {/* grid */}
            <g stroke="rgba(255,255,255,0.08)" strokeWidth="0.3">
              {[20, 40, 60, 80].map(x => <line key={'v' + x} x1={x} y1="0" x2={x} y2="100" />)}
              {[20, 40, 60, 80].map(y => <line key={'h' + y} x1="0" y1={y} x2="100" y2={y} />)}
            </g>
            {/* precip blobs */}
            <g style={{ transition: 'transform 1s linear', transform: `translateX(${drift}px)` }}>
              {hasPrecip && blobs.map((b, i) => (
                <ellipse key={i} cx={b.x} cy={b.y} rx={b.rx} ry={b.ry}
                  fill={`oklch(0.7 0.16 ${b.hue})`}
                  opacity={b.intensity * (frame >= 2 && frame <= 4 ? 1 : 0.5)}
                  style={{ filter: 'blur(2px)', transition: 'opacity 1s' }} />
              ))}
            </g>
            {/* radar sweep */}
            <g className="radar-sweep" style={{ transformOrigin: '50px 50px' }}>
              <path d="M50 50 L50 4 A46 46 0 0 1 92 38 Z" fill={accent} opacity="0.14" />
            </g>
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.4" />
          </svg>
          {/* center pin */}
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-100%)' }}>
            <div style={{ color: '#fff', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>
              <Icon name="pin" size={30} stroke={2.2} />
            </div>
          </div>
          {/* labels */}
          <div style={{ position: 'absolute', top: 14, left: 16, color: '#fff' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{city.name}</div>
            <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: accent, display: 'inline-block' }} className="pulse-dot" />
              Live radar · {RADAR_FRAMES[frame]}
            </div>
          </div>
          {/* legend */}
          <div style={{ position: 'absolute', top: 14, right: 16, background: 'rgba(10,16,30,0.5)', borderRadius: 12, padding: '8px 10px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: 9.5, color: '#fff', fontWeight: 700, marginBottom: 5, opacity: 0.8 }}>INTENSITY</div>
            <div style={{ width: 90, height: 7, borderRadius: 4, background: 'linear-gradient(90deg, oklch(0.7 0.16 220), oklch(0.72 0.18 150), oklch(0.8 0.18 95), oklch(0.66 0.22 25))' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: 'rgba(255,255,255,0.7)', marginTop: 3, fontWeight: 600 }}>
              <span>Light</span><span>Heavy</span>
            </div>
          </div>
        </div>
      </Card>

      {/* timeline scrubber */}
      <Card tone={tone}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => setPlaying(p => !p)} className="press" style={{ width: 46, height: 46, borderRadius: 23, border: 'none', background: accent, color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            {playing
              ? <svg width="18" height="18" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="#fff" /><rect x="14" y="5" width="4" height="14" rx="1.5" fill="#fff" /></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 5l12 7-12 7Z" fill="#fff" /></svg>
            }
          </button>
          <div style={{ flex: 1 }}>
            <input
              type="range"
              min="0"
              max={RADAR_FRAMES.length - 1}
              value={frame}
              onChange={e => { setPlaying(false); setFrame(+e.target.value) }}
              style={{ width: '100%', accentColor: accent }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, color: t.dim, marginTop: 2 }}>
              {RADAR_FRAMES.map((f, i) => (
                <span key={i} style={{ color: i === frame ? accent : t.faint }}>
                  {f === 'Now' ? 'Now' : f.replace(' min', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card tone={tone} pad={16}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.dim, lineHeight: 1.5 }}>
          {hasPrecip
            ? `Active precipitation near ${city.name}. Showing the last 90 minutes and a 60-minute forecast.`
            : `No precipitation detected near ${city.name} in the past 90 minutes.`}
        </div>
      </Card>
    </div>
  )
}
