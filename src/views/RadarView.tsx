import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { WeatherTone, CityData } from '../types'
import { toneStyles } from '../utils/sky'
import { fetchRadarData, type RadarFrame } from '../api/weather'
import { Card } from '../components/Card'
import Icon from '../components/Icon'

const ZOOM = 7
const TILE_SIZE = 256

function latLonToFrac(lat: number, lon: number, z: number) {
  const n = Math.pow(2, z)
  const fracX = (lon + 180) / 360 * n
  const latRad = lat * Math.PI / 180
  const fracY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
  return { fracX, fracY }
}

function fmtFrameLabel(time: number, nowTs: number): string {
  const diff = Math.round((time - nowTs) / 60)
  if (Math.abs(diff) < 5) return 'Now'
  return diff < 0 ? `${diff}m` : `+${diff}m`
}

interface RadarViewProps {
  city: CityData
  tone: WeatherTone
  accent: string
}

export default function RadarView({ city, tone, accent }: RadarViewProps) {
  const t = toneStyles(tone)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 360, h: 340 })
  const [frameIdx, setFrameIdx] = useState(0)
  const [playing, setPlaying] = useState(true)

  const { data: radarData } = useQuery({
    queryKey: ['radarFrames'],
    queryFn: fetchRadarData,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    retry: 1,
  })

  // Combine last 6 past frames + up to 3 nowcast
  const frames = useMemo<RadarFrame[]>(() => {
    if (!radarData) return []
    return [...radarData.past.slice(-6), ...radarData.nowcast.slice(0, 3)]
  }, [radarData])

  const nowTs = useMemo(() => {
    if (!radarData?.past.length) return Math.floor(Date.now() / 1000)
    return radarData.past[radarData.past.length - 1].time
  }, [radarData])

  // Jump to latest past frame when data first loads
  useEffect(() => {
    if (frames.length > 0) {
      const latestPast = Math.max(0, (radarData?.past.slice(-6).length ?? 1) - 1)
      setFrameIdx(latestPast)
    }
  }, [frames.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Playback animation
  useEffect(() => {
    if (!playing || frames.length === 0) return
    const id = setInterval(() => setFrameIdx(i => (i + 1) % frames.length), 900)
    return () => clearInterval(id)
  }, [playing, frames.length])

  // Track container dimensions for centering
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setDims({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { fracX, fracY } = latLonToFrac(city.latitude, city.longitude, ZOOM)
  const cTileX = Math.floor(fracX)
  const cTileY = Math.floor(fracY)
  const cityPxX = (fracX - cTileX) * TILE_SIZE
  const cityPxY = (fracY - cTileY) * TILE_SIZE
  const originX = dims.w / 2 - cityPxX
  const originY = dims.h / 2 - cityPxY

  const tiles = []
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      tiles.push({
        key: `${cTileX + dx}-${cTileY + dy}`,
        tileX: cTileX + dx,
        tileY: cTileY + dy,
        left: originX + dx * TILE_SIZE,
        top: originY + dy * TILE_SIZE,
      })
    }
  }

  const currentFrame = frames[frameIdx]
  const hasPrecip = ['rain', 'thunderstorm', 'snow'].includes(city.cond)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card tone={tone} pad={0} style={{ overflow: 'hidden' }}>
        <div
          ref={containerRef}
          style={{ position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: '1 / 1.05', background: '#0f1828' }}
        >
          {/* Map tiles */}
          {tiles.map(tile => (
            <div key={tile.key} style={{ position: 'absolute', left: tile.left, top: tile.top, width: TILE_SIZE, height: TILE_SIZE }}>
              <img
                src={`https://a.basemaps.cartocdn.com/dark_all/${ZOOM}/${tile.tileX}/${tile.tileY}.png`}
                width={TILE_SIZE} height={TILE_SIZE}
                style={{ display: 'block', pointerEvents: 'none' }}
                alt=""
                crossOrigin="anonymous"
              />
              {radarData && currentFrame && (
                <img
                  key={currentFrame.path}
                  src={`${radarData.host}${currentFrame.path}/256/${ZOOM}/${tile.tileX}/${tile.tileY}/2/1_1.png`}
                  width={TILE_SIZE} height={TILE_SIZE}
                  style={{ position: 'absolute', top: 0, left: 0, opacity: 0.65, display: 'block', pointerEvents: 'none' }}
                  alt=""
                />
              )}
            </div>
          ))}

          {/* City pin */}
          <div style={{ position: 'absolute', left: dims.w / 2, top: dims.h / 2, transform: 'translate(-50%,-100%)', zIndex: 10 }}>
            <div style={{ color: '#fff', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }}>
              <Icon name="pin" size={28} stroke={2.2} />
            </div>
          </div>

          {/* City label + live dot */}
          <div style={{ position: 'absolute', top: 14, left: 16, color: '#fff', zIndex: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 800, textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>{city.name}</div>
            <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: accent, display: 'inline-block' }} className="pulse-dot" />
              {radarData
                ? `Radar · ${currentFrame ? fmtFrameLabel(currentFrame.time, nowTs) : '—'}`
                : 'Loading radar…'}
            </div>
          </div>

          {/* Intensity legend */}
          <div style={{ position: 'absolute', top: 14, right: 16, background: 'rgba(8,14,28,0.72)', borderRadius: 12, padding: '8px 10px', backdropFilter: 'blur(8px)', zIndex: 10 }}>
            <div style={{ fontSize: 9.5, color: '#fff', fontWeight: 700, marginBottom: 5, opacity: 0.75 }}>INTENSITY</div>
            <div style={{ width: 90, height: 7, borderRadius: 4, background: 'linear-gradient(90deg, oklch(0.7 0.16 220), oklch(0.72 0.18 150), oklch(0.8 0.18 95), oklch(0.66 0.22 25))' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: 'rgba(255,255,255,0.65)', marginTop: 3, fontWeight: 600 }}>
              <span>Light</span><span>Heavy</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline scrubber */}
      <Card tone={tone}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => setPlaying(p => !p)}
            className="press"
            style={{ width: 46, height: 46, borderRadius: 23, border: 'none', background: accent, color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
            {playing
              ? <svg width="18" height="18" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="#fff"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="#fff"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 5l12 7-12 7Z" fill="#fff"/></svg>
            }
          </button>
          <div style={{ flex: 1 }}>
            <input
              type="range"
              min="0"
              max={Math.max(0, frames.length - 1)}
              value={frameIdx}
              onChange={e => { setPlaying(false); setFrameIdx(+e.target.value) }}
              style={{ width: '100%', accentColor: accent }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, color: t.dim, marginTop: 2 }}>
              {(frames.length > 0 ? frames : new Array(6).fill(null)).map((f, i) => (
                <span key={i} style={{ color: i === frameIdx ? accent : t.faint }}>
                  {f ? fmtFrameLabel(f.time, nowTs) : '—'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card tone={tone} pad={16}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.dim, lineHeight: 1.5 }}>
          {hasPrecip
            ? `Active precipitation detected near ${city.name}. Radar updates every 10 minutes.`
            : `No significant precipitation near ${city.name} at this time.`}
        </div>
      </Card>
    </div>
  )
}
