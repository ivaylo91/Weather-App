import type { CSSProperties } from 'react'
import type { WeatherTone, CityData, Unit } from '../types'
import { toneStyles, CONDITIONS } from '../utils/sky'
import type { SkyResult } from '../utils/sky'
import { conv } from '../utils/temperature'
import { WeatherScene } from '../components/WeatherScene'
import { Card, SectionLabel } from '../components/Card'
import HourlyStrip from '../components/HourlyStrip'
import DailyList from '../components/DailyList'
import AlertBanner from '../components/AlertBanner'
import { SunArc, UVCard, WindCard, DetailCard } from '../components/DetailCards'

interface TodayViewProps {
  city: CityData
  tone: WeatherTone
  accent: string
  sky: SkyResult
  unit: Unit
  isLoading?: boolean
  onAlert: () => void
}

function LoadingSkeleton({ tone }: { tone: WeatherTone }) {
  const t = toneStyles(tone)
  const pulse: CSSProperties = { background: t.cardBg, borderRadius: 16, animation: 'skPulse 1.8s ease-in-out infinite' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`@keyframes skPulse { 0%,100%{opacity:.45} 50%{opacity:.85} }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '30px 0 20px' }}>
        <div style={{ ...pulse, width: 160, height: 128, borderRadius: 80 }} />
        <div style={{ ...pulse, width: 140, height: 90, borderRadius: 12 }} />
        <div style={{ ...pulse, width: 180, height: 20, borderRadius: 8 }} />
        <div style={{ ...pulse, width: 140, height: 16, borderRadius: 8 }} />
      </div>
      <div style={{ ...pulse, height: 170, borderRadius: 26 }} />
      <div style={{ ...pulse, height: 250, borderRadius: 26 }} />
    </div>
  )
}

export default function TodayView({ city, tone, accent, sky, unit, isLoading, onAlert }: TodayViewProps) {
  const t = toneStyles(tone)
  const d = city.det

  if (isLoading && city.hourly.length === 0) {
    return <LoadingSkeleton tone={tone} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {city.alert && <AlertBanner alert={city.alert} tone={tone} onClick={onAlert} />}

      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '6px 0 10px' }}>
        <div className="hero-rise" style={{ marginBottom: 2 }}>
          <WeatherScene kind={sky.particle} size={210} />
        </div>
        <div className="hero-rise" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', animationDelay: '.05s' }}>
          <span style={{ fontSize: 'clamp(84px, 24vw, 124px)', fontWeight: 500, letterSpacing: -5, lineHeight: 0.9 }}>
            {conv(city.temp, unit)}
          </span>
          <span style={{ fontSize: 'clamp(34px, 8vw, 48px)', fontWeight: 300, marginTop: '0.18em' }}>°</span>
        </div>
        <div className="hero-rise" style={{ fontSize: 19, fontWeight: 700, marginTop: 4, animationDelay: '.1s' }}>
          {CONDITIONS[city.cond].label}
        </div>
        <div className="hero-rise" style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 15, fontWeight: 600, color: t.dim, animationDelay: '.14s' }}>
          <span>H:{conv(city.hi, unit)}°</span>
          <span>L:{conv(city.lo, unit)}°</span>
          <span>Feels {conv(d.feels, unit)}°</span>
        </div>
      </div>

      {/* Hourly */}
      {city.hourly.length > 0 && (
        <Card tone={tone}>
          <SectionLabel tone={tone} icon="today">Hourly forecast</SectionLabel>
          <HourlyStrip hours={city.hourly} tone={tone} accent={accent} unit={unit} />
        </Card>
      )}

      {/* 7-day */}
      {city.daily.length > 0 && (
        <Card tone={tone}>
          <SectionLabel tone={tone} icon="forecast">7-day forecast</SectionLabel>
          <DailyList days={city.daily} tone={tone} accent={accent} unit={unit} />
        </Card>
      )}

      {/* Details grid */}
      {city.daily.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }} className="detail-grid">
          <SunArc city={city} tone={tone} accent={accent} />
          <UVCard city={city} tone={tone} accent={accent} />
          <WindCard city={city} tone={tone} accent={accent} />
          <DetailCard
            tone={tone} accent={accent} icon="thermo" label="Feels like"
            value={`${conv(d.feels, unit)}°`}
            sub={d.feels > city.temp ? 'Warmer than actual' : d.feels < city.temp ? 'Cooler than actual' : 'Same as actual'}
          />
          <DetailCard tone={tone} accent={accent} icon="drop" label="Humidity" value={d.humidity} unit="%" sub={`Dew point ${conv(d.dew, unit)}°`} />
          <DetailCard tone={tone} accent={accent} icon="eye" label="Visibility" value={d.visibility} unit="km" sub={d.visibility >= 10 ? 'Clear' : 'Reduced'} />
          <DetailCard tone={tone} accent={accent} icon="gauge" label="Pressure" value={d.pressure} unit="hPa" sub={d.pressure >= 1013 ? 'High · stable' : 'Low · unsettled'} />
          <DetailCard tone={tone} accent={accent} icon="leaf" label="Air quality" value={d.aqi} sub={d.aqiLabel} />
        </div>
      )}
    </div>
  )
}
