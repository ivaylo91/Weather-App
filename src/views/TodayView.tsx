import { useRef } from 'react'
import type { CSSProperties } from 'react'
import type { WeatherTone, CityData, Unit, WindUnit, StaticCity } from '../types'
import { toneStyles, CONDITION_EMOJI, HERO_GRADIENT } from '../utils/sky'
import type { SkyResult } from '../utils/sky'
import { conv, convWind, windUnitLabel } from '../utils/temperature'
import { useT } from '../i18n/LocaleContext'
import { Card } from '../components/Card'
import HourlyStrip from '../components/HourlyStrip'
import DailyList from '../components/DailyList'
import AlertBanner from '../components/AlertBanner'
import { SunArc, UVCard, WindCard, DetailCard, MoonCard } from '../components/DetailCards'
import HistorySparkline from '../components/HistorySparkline'
import RainBar from '../components/RainBar'
import Icon from '../components/Icon'

interface TodayViewProps {
  city: CityData
  tone: WeatherTone
  accent: string
  sky: SkyResult
  unit: Unit
  isLoading?: boolean
  isError?: boolean
  onRefresh?: () => void
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

export default function TodayView({ city, tone, accent, sky: _sky, unit, isLoading, isError, onRefresh, onAlert, savedCities = [], cityId, onSwipe, windUnit = 'kmh' }: TodayViewProps) {
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

  const heroGradient = HERO_GRADIENT[city.cond] ?? HERO_GRADIENT['clear-day']
  const emoji = CONDITION_EMOJI[city.cond] ?? '🌤️'
  const wLabel = windUnitLabel(windUnit)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {city.alerts?.length > 0 && <AlertBanner alerts={city.alerts} tone={tone} onClick={onAlert} />}

      {/* Hero card */}
      <div
        className="hero-rise"
        style={{ background: heroGradient, borderRadius: 28, padding: '22px 22px 18px', color: '#fff', position: 'relative', overflow: 'hidden' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Top row: emoji + temperature */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ fontSize: 80, lineHeight: 1, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.28))', flexShrink: 0 }}>
            {emoji}
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 1 }}>
              <span style={{ fontSize: 'clamp(64px, 18vw, 88px)', fontWeight: 600, letterSpacing: -4 }}>
                {conv(city.temp, unit)}
              </span>
              <span style={{ fontSize: 'clamp(26px, 7vw, 36px)', fontWeight: 300, marginTop: '0.14em' }}>°</span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, opacity: 0.8, marginTop: 2 }}>
              {tr.feelsLike} {conv(d.feels, unit)}°
            </div>
          </div>
        </div>

        {/* Bottom row: condition + H/L */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>{tr.cond[city.cond] ?? city.cond}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.7, marginTop: 2 }}>{city.time}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, opacity: 0.85 }}>
            <div>H: {conv(city.hi, unit)}°</div>
            <div>L: {conv(city.lo, unit)}°</div>
          </div>
        </div>

        {/* City swipe dots */}
        {showDots && (
          <div style={{ display: 'flex', gap: 5, marginTop: 14, justifyContent: 'center' }}>
            {savedCities.map((c, i) => (
              <div key={c.id} style={{
                width: i === currentIdx ? 16 : 6, height: 6, borderRadius: 3,
                background: i === currentIdx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                transition: 'all .3s cubic-bezier(.4,0,.2,1)',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        background: '#fff', borderRadius: 20,
        boxShadow: '0 2px 16px rgba(26,41,82,0.08)',
        overflow: 'hidden',
      }}>
        {[
          { icon: 'umbrella', value: `${city.hourly[0]?.pop ?? 0}%`,    label: tr.chanceOfPrecip.split(' ')[0] },
          { icon: 'wind',     value: `${convWind(d.wind, windUnit)} ${wLabel}`, label: tr.wind },
          { icon: 'drop',     value: `${d.humidity}%`,                  label: tr.humidity },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            borderRight: i < 2 ? '1px solid rgba(26,41,82,0.07)' : 'none',
          }}>
            <Icon name={stat.icon} size={20} stroke={2} style={{ color: accent }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2952' }}>{stat.value}</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(26,41,82,0.45)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Minute-by-minute precipitation (next 2 hours) */}
      {city.daily.length > 0 && (
        <RainBar lat={city.latitude} lon={city.longitude} tone={tone} />
      )}

      {/* Hourly — skeleton while loading, error state with retry, real chart when data arrives */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 4px 10px' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{tr.hourlyForecast}</span>
        </div>
        <Card tone={tone} style={city.hourly.length === 0 ? { minHeight: 170 } : {}}>
          {city.hourly.length > 0 ? (
            <HourlyStrip hours={city.hourly} tone={tone} accent={accent} unit={unit} />
          ) : isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 0', color: t.dim }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Could not load forecast</span>
              <button onClick={onRefresh} className="press" style={{ padding: '8px 20px', borderRadius: 14, border: `1px solid ${t.cardBorder}`, background: t.cardBg, color: t.text, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                Retry
              </button>
            </div>
          ) : (
            <div style={{ height: 120, borderRadius: 14, background: t.track, animation: 'skPulse 1.8s ease-in-out infinite', marginTop: 4 }} />
          )}
        </Card>
      </div>

      {/* 7-day — same pattern */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 4px 10px' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{tr.sevenDay}</span>
        </div>
        <Card tone={tone} style={city.daily.length === 0 ? { minHeight: 200 } : {}}>
          {city.daily.length > 0 ? (
            <DailyList days={city.daily} tone={tone} accent={accent} unit={unit} />
          ) : !isError ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ height: 40, borderRadius: 10, background: t.track, animation: `skPulse 1.8s ease-in-out ${i*0.15}s infinite` }} />
              ))}
            </div>
          ) : null}
        </Card>
      </div>

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
          <DetailCard tone={tone} accent={accent} icon="drop" label={tr.humidity} value={d.humidity} unit="%" sub={tr.dewPoint(conv(d.dew, unit), unit)} />
          <DetailCard tone={tone} accent={accent} icon="eye" label={tr.visibility} value={d.visibility} unit="km" sub={tr.visibilitySub(d.visibility)} />
          <DetailCard tone={tone} accent={accent} icon="gauge" label={tr.pressure} value={d.pressure} unit="hPa" sub={tr.pressureSub(d.pressure)} />
          <DetailCard tone={tone} accent={accent} icon="leaf" label={tr.airQuality} value={d.aqi} sub={tr.aqi(d.aqi)} />
          <MoonCard tone={tone} accent={accent} />
        </div>
      )}

      {/* 30-day history sparkline */}
      {city.daily.length > 0 && (
        <HistorySparkline
          lat={city.latitude}
          lon={city.longitude}
          tone={tone}
          accent={accent}
          unit={unit}
        />
      )}
    </div>
  )
}
