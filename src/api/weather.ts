const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

export interface HourlyPoint {
  time: string
  temp: number
  precip: number
}

export interface WeatherData {
  city: string
  country: string
  latitude: number
  longitude: number
  temperature: number
  feelsLike: number
  humidity: number
  windspeed: number
  weathercode: number
  isDay: boolean
  uvIndex: number
  sunrise: string
  sunset: string
  hourly: HourlyPoint[]
  forecast: ForecastDay[]
}

export interface ForecastDay {
  date: string
  maxTemp: number
  minTemp: number
  weathercode: number
}

export interface CitySuggestion {
  id: number
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
}

export interface AirQualityData {
  aqi: number
  label: string
}

export function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code <= 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code <= 49) return 'Foggy'
  if (code <= 59) return 'Drizzle'
  if (code <= 69) return 'Rain'
  if (code <= 79) return 'Snow'
  if (code <= 82) return 'Rain showers'
  if (code <= 86) return 'Snow showers'
  if (code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

export function getWeatherEmoji(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? '☀️' : '🌙'
  if (code <= 2) return isDay ? '⛅' : '🌤️'
  if (code === 3) return '☁️'
  if (code <= 49) return '🌫️'
  if (code <= 69) return '🌧️'
  if (code <= 79) return '❄️'
  if (code <= 82) return '🌦️'
  if (code <= 86) return '🌨️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

export function getUVLabel(uv: number): string {
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  if (uv <= 10) return 'Very High'
  return 'Extreme'
}

function formatHour(timeStr: string): string {
  const hour = parseInt(timeStr.split('T')[1].split(':')[0])
  if (hour === 0) return '12am'
  if (hour < 12) return `${hour}am`
  if (hour === 12) return '12pm'
  return `${hour - 12}pm`
}

async function fetchWeatherData(lat: number, lon: number, city: string, country: string): Promise<WeatherData> {
  const res = await fetch(
    `${WEATHER_URL}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day` +
    `&hourly=temperature_2m,precipitation_probability` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset` +
    `&forecast_days=7&timezone=auto`
  )
  if (!res.ok) throw new Error('Failed to fetch weather')
  const weather = await res.json()
  const current = weather.current

  const currentTime: string = current.time
  const startIndex = weather.hourly.time.findIndex((t: string) => t >= currentTime)
  const si = startIndex >= 0 ? startIndex : 0

  const hourly: HourlyPoint[] = weather.hourly.time
    .slice(si, si + 24)
    .map((t: string, i: number) => ({
      time: i === 0 ? 'Now' : formatHour(t),
      temp: Math.round(weather.hourly.temperature_2m[si + i]),
      precip: weather.hourly.precipitation_probability[si + i] ?? 0,
    }))

  return {
    city,
    country,
    latitude: lat,
    longitude: lon,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    windspeed: Math.round(current.wind_speed_10m),
    weathercode: current.weather_code,
    isDay: current.is_day === 1,
    uvIndex: Math.round(weather.daily.uv_index_max[0] ?? 0),
    sunrise: weather.daily.sunrise[0]?.split('T')[1] ?? '--:--',
    sunset: weather.daily.sunset[0]?.split('T')[1] ?? '--:--',
    hourly,
    forecast: weather.daily.time.map((date: string, i: number) => ({
      date,
      maxTemp: Math.round(weather.daily.temperature_2m_max[i]),
      minTemp: Math.round(weather.daily.temperature_2m_min[i]),
      weathercode: weather.daily.weather_code[i],
    })),
  }
}

export async function fetchWeather(city: string): Promise<WeatherData> {
  const geoRes = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
  if (!geoRes.ok) throw new Error('Failed to geocode city')
  const geoData = await geoRes.json()
  if (!geoData.results?.length) throw new Error(`City "${city}" not found`)
  const { latitude, longitude, name, country } = geoData.results[0]
  return fetchWeatherData(latitude, longitude, name, country)
}

export async function fetchWeatherByCoords(lat: number, lon: number, displayName: string, country = ''): Promise<WeatherData> {
  return fetchWeatherData(lat, lon, displayName, country)
}

export async function fetchCitySuggestions(query: string): Promise<CitySuggestion[]> {
  if (query.trim().length < 2) return []
  const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`)
  if (!res.ok) return []
  const data = await res.json()
  return data.results ?? []
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const res = await fetch(`${AIR_URL}?latitude=${lat}&longitude=${lon}&current=european_aqi`)
  if (!res.ok) throw new Error('Failed to fetch air quality')
  const data = await res.json()
  const aqi = Math.round(data.current.european_aqi ?? 0)
  let label = 'Good'
  if (aqi > 100) label = 'Extremely Poor'
  else if (aqi > 80) label = 'Very Poor'
  else if (aqi > 60) label = 'Poor'
  else if (aqi > 40) label = 'Moderate'
  else if (aqi > 20) label = 'Fair'
  return { aqi, label }
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; country: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return { city: 'Your Location', country: '' }
    const data = await res.json()
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Your Location'
    return { city, country: data.address?.country ?? '' }
  } catch {
    return { city: 'Your Location', country: '' }
  }
}
