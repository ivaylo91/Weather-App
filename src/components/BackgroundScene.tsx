import { useMemo, type CSSProperties } from 'react'
import type { WeatherCondition } from '../types'

// Lightweight seeded PRNG for deterministic particle positions
function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

const WRAP: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1,
  pointerEvents: 'none', overflow: 'hidden',
}

// ── Rain / Storm ──────────────────────────────────────────────────────────────
function RainLayer({ storm }: { storm?: boolean }) {
  const drops = useMemo(() => {
    const r = rng(storm ? 77 : 12)
    return Array.from({ length: storm ? 40 : 24 }, (_, i) => ({
      left:   `${r() * 100}%`,
      top:    `-${30 + r() * 40}px`,
      delay:  `${r() * 1.8}s`,
      dur:    `${0.45 + r() * 0.5}s`,
      height: `${14 + r() * 18}px`,
      opacity: storm ? 0.35 + r() * 0.25 : 0.2 + r() * 0.2,
    }))
  }, [storm])

  return (
    <div style={WRAP}>
      {drops.map((d, i) => (
        <div
          key={i}
          className="bg-rain"
          style={{
            position: 'absolute',
            left: d.left, top: d.top,
            width: 1.5, height: d.height,
            borderRadius: 1,
            background: storm
              ? 'rgba(160,190,255,0.7)'
              : 'rgba(180,215,255,0.65)',
            animationDelay: d.delay,
            animationDuration: d.dur,
            opacity: d.opacity,
          }}
        />
      ))}
      {/* Lightning flash overlay */}
      {storm && (
        <div
          className="lightning"
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(220,230,255,0.07)',
          }}
        />
      )}
    </div>
  )
}

// ── Snow ──────────────────────────────────────────────────────────────────────
function SnowLayer() {
  const flakes = useMemo(() => {
    const r = rng(33)
    return Array.from({ length: 22 }, () => ({
      left:    `${r() * 100}%`,
      top:     `-${r() * 40}px`,
      delay:   `${r() * 3.5}s`,
      dur:     `${2.5 + r() * 2.5}s`,
      size:    `${2 + r() * 3.5}px`,
      opacity: 0.55 + r() * 0.35,
    }))
  }, [])

  return (
    <div style={WRAP}>
      {flakes.map((f, i) => (
        <div
          key={i}
          className="bg-snow"
          style={{
            position: 'absolute',
            left: f.left, top: f.top,
            width: f.size, height: f.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            animationDelay: f.delay,
            animationDuration: f.dur,
            opacity: f.opacity,
          }}
        />
      ))}
    </div>
  )
}

// ── Clouds ────────────────────────────────────────────────────────────────────
function CloudLayer({ partial }: { partial?: boolean }) {
  const clouds = useMemo(() => {
    const r = rng(55)
    return Array.from({ length: partial ? 5 : 8 }, (_, i) => ({
      left:    `${-10 + i * 14 + r() * 12}%`,
      top:     `${2 + r() * 42}%`,
      w:       120 + r() * 180,
      h:       55 + r() * 50,
      delay:   `${r() * -18}s`,
      dur:     `${16 + r() * 14}s`,
      opacity: partial ? 0.04 + r() * 0.05 : 0.07 + r() * 0.08,
    }))
  }, [partial])

  return (
    <div style={WRAP}>
      {clouds.map((c, i) => (
        <div
          key={i}
          className="bg-cloud"
          style={{
            position: 'absolute',
            left: c.left, top: c.top,
            width: c.w, height: c.h,
            borderRadius: '50%',
            background: 'white',
            filter: 'blur(28px)',
            opacity: c.opacity,
            animationDelay: c.delay,
            animationDuration: c.dur,
          }}
        />
      ))}
    </div>
  )
}

// ── Clear day — sun glow + slow rays ─────────────────────────────────────────
function SunnyLayer() {
  return (
    <div style={WRAP}>
      {/* Large warm radial glow from top-right */}
      <div style={{
        position: 'absolute',
        top: '-20%', right: '-10%',
        width: '70vw', height: '70vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,210,80,0.18) 0%, rgba(255,180,40,0.06) 55%, transparent 75%)',
        filter: 'blur(2px)',
      }} />
      {/* Slow rotating beam fan */}
      <div
        className="bg-beam"
        style={{
          position: 'absolute',
          top: '-30%', right: '-20%',
          width: '90vw', height: '90vw',
          animationDuration: '40s',
          transformOrigin: '30% 30%',
        }}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: '30%', left: '30%',
            width: '120%', height: 3,
            background: 'linear-gradient(90deg, rgba(255,220,80,0.14), transparent)',
            transform: `rotate(${i * 45}deg)`,
            transformOrigin: '0% 50%',
            borderRadius: 2,
          }} />
        ))}
      </div>
    </div>
  )
}

// ── Clear night — stars ───────────────────────────────────────────────────────
function StarryLayer() {
  const stars = useMemo(() => {
    const r = rng(7)
    return Array.from({ length: 35 }, () => ({
      left:    `${r() * 100}%`,
      top:     `${r() * 60}%`,
      size:    `${0.8 + r() * 1.8}px`,
      delay:   `${r() * 3.5}s`,
      dur:     `${2 + r() * 2}s`,
      opacity: 0.4 + r() * 0.5,
    }))
  }, [])

  return (
    <div style={WRAP}>
      {stars.map((s, i) => (
        <div
          key={i}
          className="bg-star"
          style={{
            position: 'absolute',
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            borderRadius: '50%',
            background: 'white',
            animationDelay: s.delay,
            animationDuration: s.dur,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  )
}

// ── Fog ───────────────────────────────────────────────────────────────────────
function FogLayer() {
  return (
    <div style={WRAP}>
      {[0.15, 0.32, 0.50, 0.67, 0.82].map((y, i) => (
        <div
          key={i}
          className={i % 2 === 0 ? 'fog-a' : 'fog-b'}
          style={{
            position: 'absolute',
            left: '-5%', top: `${y * 100}%`,
            width: '110%', height: '6%',
            background: 'rgba(255,255,255,0.07)',
            filter: 'blur(8px)',
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
interface Props { cond: WeatherCondition }

export default function BackgroundScene({ cond }: Props) {
  switch (cond) {
    case 'rain':
      return <RainLayer />
    case 'thunderstorm':
      return <RainLayer storm />
    case 'snow':
      return <SnowLayer />
    case 'fog':
      return <FogLayer />
    case 'cloudy':
      return <CloudLayer />
    case 'partly-cloudy-day':
    case 'partly-cloudy-night':
      return <CloudLayer partial />
    case 'clear-day':
      return <SunnyLayer />
    case 'clear-night':
      return <StarryLayer />
    default:
      return null
  }
}
