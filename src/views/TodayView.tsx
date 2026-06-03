import type { WeatherTone, CityData } from '../types'
import { toneStyles, CONDITIONS } from '../utils/sky'
import type { SkyResult } from '../utils/sky'
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
  onAlert: () => void
}

export default function TodayView({ city, tone, accent, sky, onAlert }: TodayViewProps) {
  const t = toneStyles(tone)
  const d = city.det

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {city.alert && <AlertBanner alert={city.alert} tone={tone} onClick={onAlert} />}

      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '6px 0 10px' }}>
        <div className="hero-rise" style={{ marginBottom: 2 }}>
          <WeatherScene kind={sky.particle} size={210} />
        </div>
        <div className="hero-rise" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', animationDelay: '.05s' }}>
          <span style={{ fontSize: 'clamp(84px, 24vw, 124px)', fontWeight: 500, letterSpacing: -5, lineHeight: 0.9 }}>{city.temp}</span>
          <span style={{ fontSize: 'clamp(34px, 8vw, 48px)', fontWeight: 300, marginTop: '0.18em' }}>°</span>
        </div>
        <div className="hero-rise" style={{ fontSize: 19, fontWeight: 700, marginTop: 4, animationDelay: '.1s' }}>
          {CONDITIONS[city.cond].label}
        </div>
        <div className="hero-rise" style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 15, fontWeight: 600, color: t.dim, animationDelay: '.14s' }}>
          <span>H:{city.hi}°</span><span>L:{city.lo}°</span><span>Feels {d.feels}°</span>
        </div>
      </div>

      {/* Hourly */}
      <Card tone={tone}>
        <SectionLabel tone={tone} icon="today">Hourly forecast</SectionLabel>
        <HourlyStrip hours={city.hourly} tone={tone} accent={accent} />
      </Card>

      {/* 7-day */}
      <Card tone={tone}>
        <SectionLabel tone={tone} icon="forecast">7-day forecast</SectionLabel>
        <DailyList days={city.daily} tone={tone} accent={accent} />
      </Card>

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }} className="detail-grid">
        <SunArc city={city} tone={tone} accent={accent} />
        <UVCard city={city} tone={tone} accent={accent} />
        <WindCard city={city} tone={tone} accent={accent} />
        <DetailCard
          tone={tone} accent={accent} icon="thermo" label="Feels like" value={`${d.feels}°`}
          sub={d.feels > city.temp ? 'Warmer than actual' : d.feels < city.temp ? 'Cooler than actual' : 'Same as actual'}
        />
        <DetailCard tone={tone} accent={accent} icon="drop" label="Humidity" value={d.humidity} unit="%" sub={`Dew point ${d.dew}°`} />
        <DetailCard tone={tone} accent={accent} icon="eye" label="Visibility" value={d.visibility} unit="km" sub={d.visibility >= 10 ? 'Clear' : 'Reduced'} />
        <DetailCard tone={tone} accent={accent} icon="gauge" label="Pressure" value={d.pressure} unit="hPa" sub={d.pressure >= 1013 ? 'High · stable' : 'Low · unsettled'} />
        <DetailCard tone={tone} accent={accent} icon="leaf" label="Air quality" value={d.aqi} sub={d.aqiLabel} />
      </div>
    </div>
  )
}
