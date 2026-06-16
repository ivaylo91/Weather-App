import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { skyFor, toneStyles } from './utils/sky'
import { fetchCityData, fetchAlerts, fetchCitySuggestions, reverseGeocode } from './api/weather'
import { shareWeatherImage } from './utils/shareImage'
import type { StaticCity, CityData, Unit, WindUnit, WeatherTone, WeatherCondition, WeatherAlert } from './types'
import { CONDITIONS } from './utils/sky'
import { conv } from './utils/temperature'
import { LocaleContext } from './i18n/LocaleContext'
import { translations, type Locale } from './i18n/translations'
import Onboarding from './components/Onboarding'
import TopBar from './components/TopBar'
import PillNav from './components/PillNav'
import AlertSheet from './components/AlertSheet'
import SettingsSheet from './components/SettingsSheet'
import ErrorBoundary from './components/ErrorBoundary'
import InstallBanner from './components/InstallBanner'

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
  { id: 'sf',  name: 'San Francisco', region: 'California, US', cond: 'partly-cloudy-day', temp: 17, hi: 19, lo: 12, latitude: 37.7749,  longitude: -122.4194 },
  { id: 'tok', name: 'Tokyo',         region: 'Japan',          cond: 'partly-cloudy-day', temp: 14, hi: 16, lo: 11, latitude: 35.6762,  longitude: 139.6503 },
  { id: 'lon', name: 'London',        region: 'United Kingdom', cond: 'partly-cloudy-day', temp: 9,  hi: 12, lo: 6,  latitude: 51.5074,  longitude: -0.1278  },
]

function makeId(lat: number, lon: number): string {
  return `geo_${Math.round(lat * 100)}_${Math.round(lon * 100)}`
}

export default function App({ initialCity }: { initialCity?: string }) {
  // Persistent state
  const [onboarded, setOnboarded] = useState<boolean>(() => LS.get('onboarded', false))
  const [view, setView] = useState<string>(() => LS.get('view', 'today'))
  const [themeKey, setThemeKey] = useState<string>(() => LS.get('themeKey', 'Sky'))
  const [unit, setUnit] = useState<Unit>(() => LS.get('unit', 'C'))
  const [windUnit, setWindUnit] = useState<WindUnit>(() => LS.get('windUnit', 'kmh'))
  const [alertOnRain, setAlertOnRain] = useState<boolean>(() => LS.get('alertOnRain', false))
  const [alertOnSnow, setAlertOnSnow] = useState<boolean>(() => LS.get('alertOnSnow', false))
  const lastCondRef = useRef<string | null>(null)
  const [cityId, setCityId] = useState<string>(() => LS.get('cityId', PRESET_CITIES[0].id))
  const [savedCities, setSavedCities] = useState<StaticCity[]>(() => LS.get('savedCities', PRESET_CITIES))
  const [alertOpen, setAlertOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [motionOff, setMotionOff] = useState(false)
  // Install banner (beforeinstallprompt — Chrome/Android only)
  type BeforeInstallPromptEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [locale, setLocale] = useState<Locale>(() => LS.get('locale', 'bg'))
  // Pull-to-refresh
  const scrollRef = useRef<HTMLDivElement>(null)
  const pullStartY = useRef(0)
  const [pullDist, setPullDist] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const queryClient = useQueryClient()
  const PULL_THRESHOLD = 72
  type ToneOverride = 'auto' | 'dark' | 'light'
  const [toneOverride, setToneOverride] = useState<ToneOverride>(() => LS.get('toneOverride', 'auto'))
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ?city= deep-link: geocode on mount, skip geolocation
  useEffect(() => {
    if (!initialCity) return
    setOnboarded(true) // skip onboarding for deep-links
    fetchCitySuggestions(initialCity, locale).then(results => {
      if (!results.length) return
      const r = results[0]
      const id = makeId(r.latitude, r.longitude)
      const region = [r.admin1, r.country].filter(Boolean).join(', ')
      const lc: StaticCity = { id, name: r.name, region, cond: 'partly-cloudy-day', temp: 20, hi: 24, lo: 15, latitude: r.latitude, longitude: r.longitude }
      setSavedCities(prev => prev.find(c => c.id === id) ? prev : [lc, ...prev])
      setCityId(id)
    })
  }, [initialCity]) // eslint-disable-line react-hooks/exhaustive-deps

  // Location: try geolocation on mount (skip if deep-link provided)
  useEffect(() => {
    if (initialCity) return
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const { latitude: lat, longitude: lon } = pos.coords
          const { city, region } = await reverseGeocode(lat, lon, locale)
          const id = makeId(lat, lon)
          const lc: StaticCity = {
            id,
            name: city,
            region,
            cond: 'partly-cloudy-day',
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
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      )
    }
  }, [])

  // Current city static info
  const currentStaticCity = useMemo<StaticCity>(() => {
    return savedCities.find(c => c.id === cityId) ?? PRESET_CITIES[0]
  }, [savedCities, cityId])

  // Persist unit
  useEffect(() => { LS.set('unit', unit) }, [unit])
  useEffect(() => { LS.set('windUnit', windUnit) }, [windUnit])
  useEffect(() => { LS.set('alertOnRain', alertOnRain) }, [alertOnRain])
  useEffect(() => { LS.set('alertOnSnow', alertOnSnow) }, [alertOnSnow])
  const toggleUnit = useCallback(() => setUnit(u => u === 'C' ? 'F' : 'C'), [])

  // Fetch live weather for current city.
  // placeholderData shows the static city values instantly while the real
  // fetch completes, eliminating the blank flash on city switch.
  const { data: cityData, isLoading: cityLoading, isError: cityError, refetch: refetchCity } = useQuery<CityData>({
    queryKey: ['cityData', currentStaticCity.latitude, currentStaticCity.longitude],
    queryFn: () => fetchCityData(
      currentStaticCity.latitude,
      currentStaticCity.longitude,
      currentStaticCity.name,
      currentStaticCity.region,
      currentStaticCity.id,
    ),
    staleTime: 1000 * 60 * 10,
    placeholderData: {
      id: currentStaticCity.id,
      name: currentStaticCity.name,
      region: currentStaticCity.region,
      cond: currentStaticCity.cond,
      temp: currentStaticCity.temp,
      hi: currentStaticCity.hi,
      lo: currentStaticCity.lo,
      time: '--:-- --', timeISO: '',
      sunrise: 6, sunset: 20,
      det: { feels: currentStaticCity.temp, uv: 3, uvLabel: 'Moderate', wind: 10, windDir: 'N', gust: 18, humidity: 60, pressure: 1013, visibility: 14, cloudCover: 50, dew: currentStaticCity.temp - 5, sunriseT: '6:00 AM', sunsetT: '8:00 PM', sunriseISO: '', sunsetISO: '', aqi: 25, aqiLabel: 'Good' },
      alerts: [], hourly: [], daily: [],
      latitude: currentStaticCity.latitude,
      longitude: currentStaticCity.longitude,
    },
  })

  // Fetch alerts — NWS for US, MeteoAlarm proxy for Europe
  const { data: alertData } = useQuery<WeatherAlert[]>({
    queryKey: ['alerts', currentStaticCity.latitude, currentStaticCity.longitude],
    queryFn: () => fetchAlerts(currentStaticCity.latitude, currentStaticCity.longitude),
    staleTime: 1000 * 60 * 15,
    retry: 0,
    placeholderData: [],
  })

  // Notification permission state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  // Use localStorage so "notify on app open" works across sessions
  const getLastAlertKey = () => localStorage.getItem('sora_last_alert_key')
  const setLastAlertKey = (k: string) => localStorage.setItem('sora_last_alert_key', k)

  const requestNotifPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    const p = await Notification.requestPermission()
    setNotifPermission(p)
  }, [])

  // Merge live data + alerts; fall back to static values if query not yet resolved
  const city: CityData = useMemo<CityData>(() => {
    const alerts = alertData ?? []
    if (cityData) return { ...cityData, alerts }
    const sc = currentStaticCity
    return {
      id: sc.id, name: sc.name, region: sc.region, cond: sc.cond,
      temp: sc.temp, hi: sc.hi, lo: sc.lo,
      time: '--:-- --', timeISO: '', sunrise: 6, sunset: 20,
      det: { feels: sc.temp, uv: 3, uvLabel: 'Moderate', wind: 10, windDir: 'N', gust: 18, humidity: 60, pressure: 1013, visibility: 14, cloudCover: 50, dew: sc.temp - 5, sunriseT: '6:00 AM', sunsetT: '8:00 PM', sunriseISO: '', sunsetISO: '', aqi: 25, aqiLabel: 'Good' },
      alerts: [], hourly: [], daily: [], latitude: sc.latitude, longitude: sc.longitude,
    }
  }, [cityData, currentStaticCity, alertData])

  // Notify on app open + on new alert — persisted across sessions via localStorage
  useEffect(() => {
    const primary = city.alerts[0]
    if (!primary) return
    const key = primary.kind + primary.until
    if (key === getLastAlertKey()) return
    setLastAlertKey(key)
    if (notifPermission === 'granted') {
      new Notification(`⚠️ ${primary.kind}`, {
        body: primary.text.slice(0, 150),
        icon: '/pwa-192.png',
      })
    }
  }, [city.alerts, notifPermission])

  // Condition-based alert: fire when weather changes to a watched condition
  useEffect(() => {
    const cond = city.cond
    const prev = lastCondRef.current
    lastCondRef.current = cond
    if (!prev || prev === cond || notifPermission !== 'granted') return
    const isRain = ['rain', 'thunderstorm'].includes(cond)
    const isSnow = cond === 'snow'
    if (alertOnRain && isRain) {
      new Notification(`🌧️ ${city.name}`, { body: translations[locale].cond[cond] ?? cond, icon: '/pwa-192.png' })
    } else if (alertOnSnow && isSnow) {
      new Notification(`❄️ ${city.name}`, { body: translations[locale].cond[cond] ?? cond, icon: '/pwa-192.png' })
    }
  }, [city.cond, city.name, alertOnRain, alertOnSnow, notifPermission, locale])

  // Compute sky from current city condition — used for accent colour and hero card gradient
  const sky = useMemo(() => skyFor(city.cond, themeKey), [city.cond, themeKey])
  // Always dark tone: app background is now white, hero card handles its own colouring
  const tone = 'dark' as const
  const accent = sky.accent

  // Persist state
  useEffect(() => { LS.set('onboarded', onboarded) }, [onboarded])
  useEffect(() => { LS.set('view', view) }, [view])
  useEffect(() => { LS.set('themeKey', themeKey) }, [themeKey])
  useEffect(() => { LS.set('toneOverride', toneOverride) }, [toneOverride])
  useEffect(() => { LS.set('locale', locale) }, [locale])
  useEffect(() => { LS.set('cityId', cityId) }, [cityId])
  useEffect(() => { LS.set('savedCities', savedCities) }, [savedCities])

  // body data-noanim
  useEffect(() => {
    document.body.setAttribute('data-noanim', motionOff ? '1' : '')
  }, [motionOff])

  // Refresh when user returns to tab after ≥10 min away
  useEffect(() => {
    const STALE_MS = 10 * 60 * 1000
    let hiddenAt = 0
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now()
      } else if (hiddenAt && Date.now() - hiddenAt >= STALE_MS) {
        queryClient.invalidateQueries({ queryKey: ['cityData'] })
        queryClient.invalidateQueries({ queryKey: ['alerts'] })
        queryClient.invalidateQueries({ queryKey: ['radarFrames'] })
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [queryClient])

  // PWA install banner — capture beforeinstallprompt, show after 10 s
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      if (!localStorage.getItem('sora_install_dismissed')) {
        setTimeout(() => setShowInstall(true), 10_000)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setShowInstall(false)
    setInstallPrompt(null)
  }

  function dismissInstall() {
    setShowInstall(false)
    localStorage.setItem('sora_install_dismissed', '1')
  }

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
      cond: 'partly-cloudy-day',
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

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((scrollRef.current?.scrollTop ?? 1) === 0) {
      pullStartY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if ((scrollRef.current?.scrollTop ?? 1) > 0) return
    const dy = e.touches[0].clientY - pullStartY.current
    if (dy > 0) setPullDist(Math.min(dy * 0.45, PULL_THRESHOLD))
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (pullDist >= PULL_THRESHOLD * 0.85) {
      setRefreshing(true)
      await queryClient.invalidateQueries({ queryKey: ['cityData'] })
      await queryClient.invalidateQueries({ queryKey: ['alerts'] })
      setRefreshing(false)
    }
    setPullDist(0)
  }, [pullDist, queryClient])

  // Swipe between saved cities
  const handleCitySwipe = useCallback((dir: 'left' | 'right') => {
    setSavedCities(prev => {
      const idx = prev.findIndex(c => c.id === cityId)
      if (prev.length < 2) return prev
      const next = dir === 'left'
        ? (idx + 1) % prev.length
        : (idx - 1 + prev.length) % prev.length
      setCityId(prev[next].id)
      return prev
    })
  }, [cityId])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }, [])

  const handleShare = useCallback(async () => {
    const condLabel = CONDITIONS[city.cond as WeatherCondition]?.label ?? ''
    const fallbackText = `${city.name}: ${conv(city.temp, unit)}°${unit} ${condLabel}. H:${conv(city.hi, unit)}° L:${conv(city.lo, unit)}°`
    await shareWeatherImage(city, unit, translations[locale], fallbackText, showToast)
  }, [city, unit, locale, showToast])

  // Onboarding needs the locale context so its text respects the active language
  if (!onboarded) {
    const localeCtx = { locale, setLocale, t: translations[locale] }
    return (
      <LocaleContext.Provider value={localeCtx}>
        <Onboarding themeKey={themeKey} onDone={handleDoneOnboarding} />
      </LocaleContext.Provider>
    )
  }

  const t = toneStyles(tone)

  const renderView = () => {
    switch (view) {
      case 'today':
        return <TodayView city={city} tone={tone} accent={accent} sky={sky} unit={unit} windUnit={windUnit} isLoading={cityLoading} isError={cityError} onRefresh={() => { refetchCity() }} onAlert={() => setAlertOpen(true)} savedCities={savedCities} cityId={cityId} onSwipe={handleCitySwipe} />
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
        return <TodayView city={city} tone={tone} accent={accent} sky={sky} unit={unit} windUnit={windUnit} isLoading={cityLoading} isError={cityError} onRefresh={() => { refetchCity() }} onAlert={() => setAlertOpen(true)} savedCities={savedCities} cityId={cityId} onSwipe={handleCitySwipe} />
    }
  }

  const localeValue = { locale, setLocale, t: translations[locale] }

  return (
    <LocaleContext.Provider value={localeValue}>
    <>
      {/* Pull-to-refresh spinner */}
      {(pullDist > 0 || refreshing) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', justifyContent: 'center',
          transform: `translateY(${refreshing ? 16 : pullDist - 28}px)`,
          transition: refreshing ? 'transform .2s' : 'none',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: t.cardBg, border: `1px solid ${t.cardBorder}`,
            backdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ color: t.dim, animation: refreshing ? 'spinRays 0.7s linear infinite' : 'none' }}>
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeDasharray={`${(refreshing ? 1 : pullDist / PULL_THRESHOLD) * 56.5} 56.5`}
                strokeLinecap="round" transform="rotate(-90 12 12)" />
            </svg>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="app-scroll"
        style={{ color: t.text }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="app-container">
          {view !== 'cities' && (
            <TopBar
              city={city}
              tone={tone}
              accent={accent}
              onLocation={() => setView('cities')}
              onBell={() => { if (city.alerts.length) setAlertOpen(true) }}
              onSettings={() => setSettingsOpen(true)}
            />
          )}

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

      {alertOpen && city.alerts.length > 0 && (
        <AlertSheet
          alerts={city.alerts}
          city={city}
          tone={tone}
          accent={accent}
          notifPermission={notifPermission}
          onEnableNotif={requestNotifPermission}
          onClose={() => setAlertOpen(false)}
        />
      )}

      {settingsOpen && (
        <SettingsSheet
          tone={tone}
          accent={accent}
          unit={unit}
          windUnit={windUnit}
          themeKey={themeKey}
          toneOverride={toneOverride}
          motionOff={motionOff}
          onUnitToggle={toggleUnit}
          onWindUnit={setWindUnit}
          onTheme={setThemeKey}
          onToneOverride={setToneOverride}
          onMotionToggle={() => setMotionOff(v => !v)}
          onShare={handleShare}
          onClose={() => setSettingsOpen(false)}
          alertOnRain={alertOnRain}
          alertOnSnow={alertOnSnow}
          onToggleRainAlert={() => setAlertOnRain(v => !v)}
          onToggleSnowAlert={() => setAlertOnSnow(v => !v)}
          apiOk={!cityError}
        />
      )}

      {/* PWA install banner */}
      {showInstall && installPrompt && (
        <InstallBanner
          tone={tone}
          accent={accent}
          onInstall={handleInstall}
          onDismiss={dismissInstall}
        />
      )}

      {/* Share / copy toast */}
      {toast && (
        <div aria-live="polite" style={{
          position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15,22,40,0.92)', color: '#fff', borderRadius: 14,
          padding: '10px 20px', fontSize: 13.5, fontWeight: 700, zIndex: 100,
          whiteSpace: 'nowrap', backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          {toast}
        </div>
      )}
    </>
    </LocaleContext.Provider>
  )
}
