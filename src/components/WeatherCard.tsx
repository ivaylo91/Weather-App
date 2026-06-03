import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Location, Unit } from '../types'
import { fetchWeather, fetchWeatherByCoords, getWeatherDescription, getUVLabel } from '../api/weather'
import ForecastRow from './ForecastRow'
import HourlyChart from './HourlyChart'
import AirQualityCard from './AirQualityCard'
import WeatherSkeleton from './WeatherSkeleton'
import WeatherIcon from './WeatherIcon'

interface Props {
  location: Location
  unit: Unit
  isSaved: boolean
  onSave: () => void
  onDataLoaded?: (weathercode: number, isDay: boolean) => void
}

function toDisplay(celsius: number, unit: Unit) {
  return unit === 'C' ? celsius : Math.round(celsius * 9 / 5 + 32)
}

function uvColor(uv: number) {
  if (uv <= 2) return 'text-green-300'
  if (uv <= 5) return 'text-yellow-300'
  if (uv <= 7) return 'text-orange-300'
  if (uv <= 10) return 'text-red-300'
  return 'text-purple-300'
}

export default function WeatherCard({ location, unit, isSaved, onSave, onDataLoaded }: Props) {
  const queryKey = location.type === 'city'
    ? ['weather', 'city', location.name]
    : ['weather', 'coords', location.lat, location.lon]

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      location.type === 'city'
        ? fetchWeather(location.name)
        : fetchWeatherByCoords(location.lat, location.lon, location.displayName, location.country),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  })

  useEffect(() => {
    if (data) onDataLoaded?.(data.weathercode, data.isDay)
  }, [data, onDataLoaded])

  if (isLoading) return <WeatherSkeleton />

  if (isError) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-red-500/30 backdrop-blur border border-red-300/40 p-8 text-center">
        <p className="text-white font-semibold text-lg">Oops!</p>
        <p className="text-white/80 text-sm mt-1">{(error as Error).message}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Current conditions */}
      <div className="rounded-2xl bg-white/20 backdrop-blur border border-white/30 p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-white text-2xl font-bold truncate">{data.city}</h2>
              <button
                onClick={onSave}
                title={isSaved ? 'Saved' : 'Save city'}
                className="text-2xl leading-none shrink-0 transition-transform hover:scale-110"
              >
                {isSaved ? '★' : '☆'}
              </button>
            </div>
            {data.country && <p className="text-white/70 text-sm">{data.country}</p>}
            <p className="text-white/80 text-sm mt-1">{getWeatherDescription(data.weathercode)}</p>
          </div>
          <WeatherIcon weathercode={data.weathercode} isDay={data.isDay} size={80} />
        </div>

        <div className="mt-4">
          <span className="text-white text-7xl font-thin">{toDisplay(data.temperature, unit)}°</span>
          <span className="text-white/70 text-xl ml-1">{unit}</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/60 text-xs uppercase tracking-wide">Feels like</p>
            <p className="text-white font-semibold mt-1">{toDisplay(data.feelsLike, unit)}°{unit}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/60 text-xs uppercase tracking-wide">Humidity</p>
            <p className="text-white font-semibold mt-1">{data.humidity}%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/60 text-xs uppercase tracking-wide">Wind</p>
            <p className="text-white font-semibold mt-1">{data.windspeed} km/h</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/60 text-xs uppercase tracking-wide">UV Index</p>
            <p className={`font-semibold mt-1 ${uvColor(data.uvIndex)}`}>{data.uvIndex}</p>
            <p className="text-white/50 text-xs">{getUVLabel(data.uvIndex)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/60 text-xs uppercase tracking-wide">Sunrise</p>
            <p className="text-white font-semibold mt-1">🌅 {data.sunrise}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/60 text-xs uppercase tracking-wide">Sunset</p>
            <p className="text-white font-semibold mt-1">🌇 {data.sunset}</p>
          </div>
        </div>
      </div>

      {/* Hourly chart */}
      <HourlyChart hourly={data.hourly} unit={unit} />

      {/* 7-day forecast */}
      <div className="rounded-2xl bg-white/20 backdrop-blur border border-white/30 p-4">
        <p className="text-white/60 text-xs uppercase tracking-wide mb-3 px-1">7-Day Forecast</p>
        <div className="space-y-1">
          {data.forecast.map((day) => (
            <ForecastRow key={day.date} day={day} unit={unit} />
          ))}
        </div>
      </div>

      {/* Air quality */}
      <AirQualityCard lat={data.latitude} lon={data.longitude} />
    </div>
  )
}
