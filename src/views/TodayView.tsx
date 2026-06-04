import { useRef } from 'react'
import type { CSSProperties } from 'react'
import type { WeatherTone, CityData, Unit, WindUnit, StaticCity } from '../types'
import { toneStyles } from '../utils/sky'
import type { SkyResult } from '../utils/sky'
import { conv } from '../utils/temperature'
import { useT } from '../i18n/LocaleContext'
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
  savedCities?: StaticCity[]
  cityId?: string
  onSwipe?: (dir: 'left' | 'right') => void
  windUnit?: WindUnit
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

export default function TodayView({ city, tone, accent, sky, unit, isLoading, onAlert, savedCities = [], cityId, onSwipe, windUnit = 'kmh' }: TodayViewProps) {
  const t = toneStyles(tone)
  const tr = useT()
  const d = city.det

  // Swipe detection on hero
  const swipeX = useRef(0)
  const swipeY = useRef(0)
  function onTouchStart(e: React.TouchEvent) {
    swipeX.current = e.touches[0].clientX
    swipeY.current = e.touches[0].clientY
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - swipeX.current
    const dy = e.changedTouches[0].clientY - swipeY.current
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      onSwipe?.(dx < 0 ? 'left' : 'right')
    }
  }

  const currentIdx = savedCities.findIndex(c => c.id === cityId)
  const showDots = savedCities.length > 1

  if (isLoading && city.hourly.length === 0) {
    return <LoadingSkeleton tone={tone} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {city.alert && <AlertBanner alert={city.alert} tone={tone} onClick={onAlert} />}

      {/* Hero */}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '6px 0 10px' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
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
          {tr.cond[city.cond] ?? city.cond}
        </div>
        <div className="hero-rise" style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 15, fontWeight: 600, color: t.dim, animationDelay: '.14s' }}>
          <span>H:{conv(city.hi, unit)}°</span>
          <span>L:{conv(city.lo, unit)}°</span>
          <span>{tr.feelsLike} {conv(d.feels, unit)}°</span>
        </div>

        {/* City swipe dots */}
        {showDots && (
          <div className="hero-rise" style={{ display: 'flex', gap: 6, marginTop: 14, animationDelay: '.18s' }}>
            {savedCities.map((c, i) => (
              <div key={c.id} style={{
                width: i === currentIdx ? 18 : 6,
                height: 6, borderRadius: 3,
                background: i === currentIdx ? accent : t.faint,
                transition: 'all .3s cubic-bezier(.4,0,.2,1)',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Hourly */}
      {city.hourly.length > 0 && (
        <Card tone={tone}>
          <SectionLabel tone={tone} icon="today">{tr.hourlyForecast}</SectionLabel>
          <HourlyStrip hours={city.hourly} tone={tone} accent={accent} unit={unit} />
        </Card>
      )}

      {/* 7-day */}
      {city.daily.length > 0 && (
        <Card tone={tone}>
          <SectionLabel tone={tone} icon="forecast">{tr.forecastDays(city.daily.length)}</SectionLabel>
          <DailyList days={city.daily} tone={tone} accent={accent} unit={unit} />
        </Card>
      )}

      {/* Details grid */}
      {city.daily.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }} className="detail-grid">
          <SunArc city={city} tone={tone} accent={accent} />
          <UVCard city={city} tone={tone} accent={accent} />
          <WindCard city={city} tone={tone} accent={accent} windUnit={windUnit} />
          <DetailCard
            tone={tone} accent={accent} icon="thermo" label={tr.feelsLike}
            value={`${conv(d.feels, unit)}°`}
            sub={tr.feelsLikeSub(d.feels, city.temp)}
          />
          <DetailCard tone={tone} accent={accent} icon="drop" label={tr.humidity} value={d.humidity} unit="%" sub={tr.dewPoint(conv(d.dew, unit))} />
          <DetailCard tone={tone} accent={accent} icon="eye" label={tr.visibility} value={d.visibility} unit="km" sub={tr.visibilitySub(d.visibility)} />
          <DetailCard tone={tone} accent={accent} icon="gauge" label={tr.pressure} value={d.pressure} unit="hPa" sub={tr.pressureSub(d.pressure)} />
          <DetailCard tone={tone} accent={accent} icon="leaf" label={tr.airQuality} value={d.aqi} sub={tr.aqi(d.aqi)} />
        </div>
      )}
    </div>
  )
}
