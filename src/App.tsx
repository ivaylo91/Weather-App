import { useState, useEffect, useCallback, CSSProperties } from 'react'
import { Location, Unit } from './types'
import { reverseGeocode } from './api/weather'
import { getBackgroundStyle, DEFAULT_BG } from './utils/theme'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import WeatherSkeleton from './components/WeatherSkeleton'

function locationKey(loc: Location): string {
  return loc.type === 'city'
    ? `city:${loc.name.toLowerCase()}`
    : `coords:${loc.lat.toFixed(2)},${loc.lon.toFixed(2)}`
}

function locationLabel(loc: Location): string {
  return loc.type === 'city' ? loc.name : loc.displayName
}

export default function App() {
  const [location, setLocation] = useState<Location | null>(null)
  const [unit, setUnit] = useState<Unit>(() => (localStorage.getItem('unit') as Unit) ?? 'C')
  const [bgStyle, setBgStyle] = useState<CSSProperties>(DEFAULT_BG)
  const [savedCities, setSavedCities] = useState<Location[]>(() => {
    try { return JSON.parse(localStorage.getItem('savedCities') ?? '[]') }
    catch { return [] }
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ type: 'city', name: 'London' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        const { city, country } = await reverseGeocode(lat, lon)
        setLocation({ type: 'coords', lat, lon, displayName: city, country })
      },
      () => setLocation({ type: 'city', name: 'London' }),
      { timeout: 6000 }
    )
  }, [])

  function toggleUnit(next: Unit) {
    localStorage.setItem('unit', next)
    setUnit(next)
  }

  const handleDataLoaded = useCallback((weathercode: number, isDay: boolean) => {
    setBgStyle(getBackgroundStyle(weathercode, isDay))
  }, [])

  function saveCurrentCity() {
    if (!location) return
    const key = locationKey(location)
    if (savedCities.some((c) => locationKey(c) === key)) return
    const next = [...savedCities, location]
    setSavedCities(next)
    localStorage.setItem('savedCities', JSON.stringify(next))
  }

  function removeSavedCity(index: number) {
    const next = savedCities.filter((_, i) => i !== index)
    setSavedCities(next)
    localStorage.setItem('savedCities', JSON.stringify(next))
  }

  const currentKey = location ? locationKey(location) : null
  const isCurrentSaved = savedCities.some((c) => locationKey(c) === currentKey!)

  return (
    <div
      style={{ ...bgStyle, transition: 'background 1.2s ease' }}
      className="min-h-screen flex flex-col items-center px-4 py-12"
    >
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-white text-4xl font-bold tracking-tight">Weather App</h1>
        <div className="flex rounded-full bg-white/20 backdrop-blur border border-white/30 p-1">
          {(['C', 'F'] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => toggleUnit(u)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                unit === u ? 'bg-white text-blue-800 shadow' : 'text-white hover:bg-white/10'
              }`}
            >
              °{u}
            </button>
          ))}
        </div>
      </div>

      <SearchBar onSearch={setLocation} />

      {savedCities.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center w-full max-w-md mb-5 -mt-3">
          {savedCities.map((savedLoc, i) => {
            const key = locationKey(savedLoc)
            const isActive = currentKey === key
            return (
              <div
                key={key}
                className={`flex items-center rounded-full border text-sm transition-all ${
                  isActive
                    ? 'bg-white text-blue-900 border-white shadow'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <button
                  onClick={() => setLocation(savedLoc)}
                  className="pl-3 pr-1.5 py-1.5 font-medium"
                >
                  {locationLabel(savedLoc)}
                </button>
                <button
                  onClick={() => removeSavedCity(i)}
                  className={`pr-2.5 text-lg leading-none pb-0.5 ${
                    isActive ? 'text-blue-400 hover:text-blue-900' : 'text-white/40 hover:text-white'
                  }`}
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      {location ? (
        <WeatherCard
          location={location}
          unit={unit}
          isSaved={isCurrentSaved}
          onSave={saveCurrentCity}
          onDataLoaded={handleDataLoaded}
        />
      ) : (
        <WeatherSkeleton />
      )}
    </div>
  )
}
