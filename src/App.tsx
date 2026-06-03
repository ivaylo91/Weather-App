import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { skyFor, toneStyles, THEMES } from './utils/sky'
import { fetchCityData, fetchAlerts, reverseGeocode } from './api/weather'
import type { StaticCity, CityData, Unit, WeatherTone } from './types'
import Onboarding from './components/Onboarding'
import TopBar from './components/TopBar'
import PillNav from './components/PillNav'
import AlertSheet from './components/AlertSheet'
import ErrorBoundary from './components/ErrorBoundary'

const TodayView    = lazy(() => import('./views/TodayView'))
const ForecastView = lazy(() => import('./views/ForecastView'))
const RadarView    = lazy(() => import('./views/RadarView'))
const CitiesView   = lazy(() => import('./views/CitiesView'))

function ViewSkeleton({ tone }: { tone: WeatherTone }) {
  const t = toneStyles(tone)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
      <style>{`@keyframes vsk{0%,100%{opacity:.4}50%{opacity:.85}}`}</style>
      {[168, 270, 210].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 26, background: t.cardBg, animation: `vsk 1.8s ease-in-out ${i * 0.15}s infinite` }} />
      ))}
    </div>
  )
}

// ---- localStorage helpers ----
const LS = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem('sora_' + k)
      return v ? (JSON.parse(v) as T) : d
    } catch {
      return d
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem('sora_' + k, JSON.stringify(v))
    } catch {}
  },
}

// ---- Preset cities ----
const PRESET_CITIES: StaticCity[] = [
  { id: 'sf',  name: 'San Francisco', region: 'California, US',  cond: 'partly-cloudy-day', temp: 17, hi: 19, lo: 12, latitude: 37.7749,  longitude: -122.4194 },
  { id: 'phx', name: 'Phoenix',        region: 'Arizona, US',     cond: 'clear-day',         temp: 39, hi: 41, lo: 27, latitude: 33.4484,  longitude: -112.0740 },
  { id: 'tok', name: 'Tokyo',          region: 'Japan',           cond: 'rain',              temp: 14, hi: 16, lo: 11, latitude: 35.6762,  longitude: 139.6503 },
  { id: 'lon', name: 'London',         region: 'United Kingdom',  cond: 'cloudy',            temp: 9,  hi: 12, lo: 6,  latitude: 51.5074,  longitude: -0.1278  },
  { id: 'syd', name: 'Sydney',         region: 'Australia',       cond: 'clear-night',       temp: 19, hi: 22, lo: 15, latitude: -33.8688, longitude: 151.2093 },
]

function makeId(lat: number, lon: number): string {
  return `geo_${Math.round(lat * 100)}_${Math.round(lon * 100)}`
}

export default function App() {
  // Persistent state
  const [onboarded, setOnboarded] = useState<boolean>(() => LS.get('onboarded', false))
  const [view, setView] = useState<string>(() => LS.get('view', 'today'))
  const [themeKey, setThemeKey] = useState<string>(() => LS.get('themeKey', 'Sky'))
  const [unit, setUnit] = useState<Unit>(() => LS.get('unit', 'C'))
  const [cityId, setCityId] = useState<string>(() => LS.get('cityId', PRESET_CITIES[0].id))
  const [savedCities, setSavedCities] = useState<StaticCity[]>(() => LS.get('savedCities', PRESET_CITIES))
  const [alertOpen, setAlertOpen] = useState(false)
  const [motionOff, setMotionOff] = useState(false)

  // Location: try geolocation on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const { latitude: lat, longitude: lon } = pos.coords
          const { city, region } = await reverseGeocode(lat, lon)
          const id = makeId(lat, lon)
          const lc: StaticCity = {
            id,
            name: city,
            region,
            cond: 'clear-day',
            temp: 20,
            hi: 22,
            lo: 16,
            latitude: lat,
            longitude: lon,
          }
          setSavedCities(prev => {
            if (prev.find(c => c.id === id)) return prev
            return [lc, ...prev]
          })
          setCityId(id)
        },
        () => { /* permission denied or unavailable */ },
        { timeout: 8000 }
      )
    }
  }, [])

  // Current city static info
  const currentStaticCity = useMemo<StaticCity>(() => {
    return savedCities.find(c => c.id === cityId) ?? PRESET_CITIES[0]
  }, [savedCities, cityId])

  // Persist unit
  useEffect(() => { LS.set('unit', unit) }, [unit])
  const toggleUnit = useCallback(() => setUnit(u => u === 'C' ? 'F' : 'C'), [])

  // Fetch live weather for current city
  const { data: cityData, isLoading: cityLoading } = useQuery<CityData>({
    queryKey: ['cityData', currentStaticCity.latitude, currentStaticCity.longitude],
    queryFn: () => fetchCityData(
      currentStaticCity.latitude,
      currentStaticCity.longitude,
      currentStaticCity.name,
      currentStaticCity.region,
      currentStaticCity.id,
    ),
    staleTime: 1000 * 60 * 10,
  })

  // Fetch NWS alerts (US-only; silently returns null for non-US)
  const { data: alertData } = useQuery({
    queryKey: ['alerts', currentStaticCity.latitude, currentStaticCity.longitude],
    queryFn: () => fetchAlerts(currentStaticCity.latitude, currentStaticCity.longitude),
    staleTime: 1000 * 60 * 15,
    retry: 0,
  })

  // Notification permission state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  const lastAlertKeyRef = useRef<string | null>(null)

  const requestNotifPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    const p = await Notification.requestPermission()
    setNotifPermission(p)
  }, [])

  // Merge: live data overrides static where available
  const city: CityData = useMemo<CityData>(() => {
    const alert = alertData ?? null
    if (cityData) return { ...cityData, alert }
    // Fallback: construct a minimal CityData from static city
    const sc = currentStaticCity
    return {
      id: sc.id,
      name: sc.name,
      region: sc.region,
      cond: sc.cond,
      temp: sc.temp,
      hi: sc.hi,
      lo: sc.lo,
      time: '--:-- --',
      sunrise: 6,
      sunset: 20,
      det: {
        feels: sc.temp,
        uv: 3,
        uvLabel: 'Moderate',
        wind: 10,
        windDir: 'N',
        gust: 18,
        humidity: 60,
        pressure: 1013,
        visibility: 14,
        dew: sc.temp - 5,
        sunriseT: '6:00 AM',
        sunsetT: '8:00 PM',
        aqi: 25,
        aqiLabel: 'Good',
      },
      alert: alertData ?? null,
      hourly: [],
      daily: [],
      latitude: sc.latitude,
      longitude: sc.longitude,
    }
  }, [cityData, currentStaticCity, alertData])

  // Show browser notification when a new alert is detected
  useEffect(() => {
    if (!city.alert) return
    const key = city.alert.kind + city.alert.until
    if (key === lastAlertKeyRef.current) return
    lastAlertKeyRef.current = key
    if (notifPermission === 'granted') {
      new Notification(`⚠️ ${city.alert.kind}`, {
        body: city.alert.text.slice(0, 150),
        icon: '/pwa-192.png',
      })
    }
  }, [city.alert, notifPermission])

  // Compute sky from current city condition
  const sky = useMemo(() => skyFor(city.cond, themeKey), [city.cond, themeKey])
  const tone = sky.tone
  const accent = sky.accent

  // Background crossfade layers
  const [bgLayers, setBgLayers] = useState<string[]>([sky.gradient])
  useEffect(() => {
    setBgLayers(prev =>
      prev[prev.length - 1] === sky.gradient ? prev : [...prev.slice(-1), sky.gradient]
    )
  }, [sky.gradient])

  // Persist state
  useEffect(() => { LS.set('onboarded', onboarded) }, [onboarded])
  useEffect(() => { LS.set('view', view) }, [view])
  useEffect(() => { LS.set('themeKey', themeKey) }, [themeKey])
  useEffect(() => { LS.set('cityId', cityId) }, [cityId])
  useEffect(() => { LS.set('savedCities', savedCities) }, [savedCities])

  // body data-noanim
  useEffect(() => {
    document.body.setAttribute('data-noanim', motionOff ? '1' : '')
  }, [motionOff])

  // Handlers
  const handleSelectCity = useCallback((id: string) => {
    setCityId(id)
    setView('today')
  }, [])

  const handleRemoveCity = useCallback((id: string) => {
    if (id === cityId) return
    setSavedCities(prev => prev.filter(c => c.id !== id))
  }, [cityId])

  const handleSearch = useCallback((lat: number, lon: number, name: string, region: string) => {
    const id = makeId(lat, lon)
    const newCity: StaticCity = {
      id,
      name,
      region,
      cond: 'clear-day',
      temp: 20,
      hi: 24,
      lo: 15,
      latitude: lat,
      longitude: lon,
    }
    setSavedCities(prev => {
      if (prev.find(c => c.id === id)) return prev
      return [...prev, newCity]
    })
    setCityId(id)
    setView('today')
  }, [])

  const handleDoneOnboarding = useCallback((target?: string) => {
    setOnboarded(true)
    if (target === 'cities') setView('cities')
  }, [])

  if (!onboarded) {
    return <Onboarding themeKey={themeKey} onDone={handleDoneOnboarding} />
  }

  const t = toneStyles(tone)

  const renderView = () => {
    switch (view) {
      case 'today':
        return <TodayView city={city} tone={tone} accent={accent} sky={sky} unit={unit} isLoading={cityLoading} onAlert={() => setAlertOpen(true)} />
      case 'forecast':
        return <ForecastView city={city} tone={tone} accent={accent} unit={unit} />
      case 'radar':
        return <RadarView city={city} tone={tone} accent={accent} />
      case 'cities':
        return (
          <CitiesView
            cities={savedCities}
            currentId={cityId}
            themeKey={themeKey}
            tone={tone}
            accent={accent}
            unit={unit}
            onSelect={handleSelectCity}
            onRemove={handleRemoveCity}
            onSearch={handleSearch}
          />
        )
      default:
        return <TodayView city={city} tone={tone} accent={accent} sky={sky} unit={unit} isLoading={cityLoading} onAlert={() => setAlertOpen(true)} />
    }
  }

  return (
    <>
      {/* Sky background layers */}
      {bgLayers.map((g, i) => (
        <div
          key={g + i}
          className={i === bgLayers.length - 1 && bgLayers.length > 1 ? 'bg-layer bg-fade' : 'bg-layer'}
          style={{ background: g }}
        />
      ))}

      {/* Content */}
      <div className="app-scroll" style={{ position: 'relative', zIndex: 1, color: t.text }}>
        <div className="app-container">
          {view !== 'cities' && (
            <TopBar
              city={city}
              tone={tone}
              accent={accent}
              unit={unit}
              onLocation={() => setView('cities')}
              onBell={() => { if (city.alert) setAlertOpen(true) }}
              onUnitToggle={toggleUnit}
            />
          )}

          {/* Theme switcher strip */}
          <div style={{ display: 'flex', gap: 6, padding: '8px 0', overflowX: 'auto' }} className="hide-scroll">
            {Object.keys(THEMES).map(tk => {
              const s = skyFor('partly-cloudy-day', tk)
              const active = themeKey === tk
              return (
                <button key={tk} onClick={() => setThemeKey(tk)} className="press" style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 12,
                  border: active ? `1.5px solid ${accent}` : `1px solid ${t.cardBorder}`,
                  background: active ? t.cardBg : 'transparent',
                  color: t.text,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: s.gradient, border: '1px solid rgba(255,255,255,0.3)' }} />
                  <span style={{ fontSize: 11.5, fontWeight: 700 }}>{tk}</span>
                </button>
              )
            })}
            <button onClick={() => setMotionOff(v => !v)} className="press" style={{
              flexShrink: 0, padding: '5px 10px', borderRadius: 12,
              border: `1px solid ${t.cardBorder}`,
              background: motionOff ? t.cardBg : 'transparent',
              color: t.text, cursor: 'pointer',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              fontSize: 11.5, fontWeight: 700,
            }}>
              {motionOff ? 'Anim off' : 'Anim on'}
            </button>
          </div>

          <ErrorBoundary resetKey={view}>
            <Suspense fallback={<ViewSkeleton tone={tone} />}>
              <div key={view} className="view-fade">
                {renderView()}
              </div>
            </Suspense>
          </ErrorBoundary>
          <div style={{ height: 110 }} />
        </div>
      </div>

      <PillNav view={view} setView={setView} tone={tone} accent={accent} />

      {alertOpen && city.alert && (
        <AlertSheet
          alert={city.alert}
          city={city}
          tone={tone}
          accent={accent}
          notifPermission={notifPermission}
          onEnableNotif={requestNotifPermission}
          onClose={() => setAlertOpen(false)}
        />
      )}
    </>
  )
}
