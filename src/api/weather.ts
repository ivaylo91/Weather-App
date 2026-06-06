import type { CityData, CityDetails, WeatherCondition, HourlyPoint, DailyDay, CitySuggestion, WeatherAlert } from '../types'

const KEY = import.meta.env.VITE_OPENMETEO_KEY as string | undefined
const _k = KEY ? `&apikey=${KEY}` : ''

const GEO_URL     = KEY
  ? `https://customer-geocoding-api.open-meteo.com/v1/search`
  : `https://geocoding-api.open-meteo.com/v1/search`
const WEATHER_URL = KEY
  ? `https://customer-api.open-meteo.com/v1/forecast`
  : `https://api.open-meteo.com/v1/forecast`
const AIR_URL     = KEY
  ? `https://customer-air-quality-api.open-meteo.com/v1/air-quality`
  : `https://air-quality-api.open-meteo.com/v1/air-quality`
const ARCHIVE_URL = KEY
  ? `https://customer-archive-api.open-meteo.com/v1/archive`
  : `https://archive-api.open-meteo.com/v1/archive`

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function wmoToCondition(code: number, isDay: boolean): WeatherCondition {
  if (code === 0) return isDay ? 'clear-day' : 'clear-night'
  if (code <= 2) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night'
  if (code === 3) return 'cloudy'
  if (code <= 49) return 'fog'
  if (code <= 69) return 'rain'
  if (code <= 79) return 'snow'
  if (code <= 82) return 'rain'
  if (code <= 86) return 'snow'
  if (code <= 99) return 'thunderstorm'
  return isDay ? 'clear-day' : 'clear-night'
}

function degreesToDir(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const idx = Math.round(deg / 22.5) % 16
  return dirs[idx]
}

function aqiLabel(aqi: number): string {
  if (aqi <= 20) return 'Good'
  if (aqi <= 40) return 'Fair'
  if (aqi <= 60) return 'Moderate'
  if (aqi <= 80) return 'Poor'
  if (aqi <= 100) return 'Very Poor'
  return 'Extremely Poor'
}

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low'
  if (uv <= 5) return 'Moderate'
  if (uv <= 7) return 'High'
  if (uv <= 10) return 'Very High'
  return 'Extreme'
}

function formatTime12(isoTime: string): string {
  const parts = isoTime.split('T')
  if (parts.length < 2) return isoTime
  const [hStr, mStr] = parts[1].split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  const ampm = h < 12 ? 'AM' : 'PM'
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`
}

export async function fetchCityData(
  lat: number,
  lon: number,
  name: string,
  region: string,
  id: string
): Promise<CityData> {
  const weatherUrl =
    `${WEATHER_URL}?latitude=${lat}&longitude=${lon}` +
    // Use the best available NWP model for the coordinates automatically
    `&models=best_match` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,weather_code,is_day,cloud_cover,visibility` +
    `&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,is_day,cloud_cover` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,precipitation_probability_max,precipitation_sum,wind_speed_10m_max` +
    `&forecast_days=10&timezone=auto${_k}`

  const airUrl = `${AIR_URL}?latitude=${lat}&longitude=${lon}&current=european_aqi${_k}`

  const [weatherRes, airRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(airUrl).catch(() => null),
  ])

  if (!weatherRes.ok) throw new Error('Failed to fetch weather')
  const weather = await weatherRes.json()

  let aqi = 0
  let aqiLbl = 'Good'
  if (airRes && airRes.ok) {
    const airData = await airRes.json()
    aqi = Math.round(airData.current?.european_aqi ?? 0)
    aqiLbl = aqiLabel(aqi)
  }

  const current = weather.current
  const isDay: boolean = current.is_day === 1
  const currentCode: number = current.weather_code
  const cond: WeatherCondition = wmoToCondition(currentCode, isDay)

  const temp = Math.round(current.temperature_2m)
  const feels = Math.round(current.apparent_temperature)
  const humidity = Math.round(current.relative_humidity_2m)
  const wind = Math.round(current.wind_speed_10m)
  const windDeg = current.wind_direction_10m ?? 0
  const gust = Math.round(current.wind_gusts_10m ?? wind)
  const pressure = Math.round(current.surface_pressure ?? 1013)
  const visibilityRaw = current.visibility ?? 14000
  const visibility = Math.round(visibilityRaw / 1000)
  const cloudCover = Math.round(current.cloud_cover ?? 0)
  const dew = current.dew_point_2m != null
    ? Math.round(current.dew_point_2m)
    : Math.round(temp - ((100 - humidity) / 5))

  const uvRaw = Math.round(weather.daily?.uv_index_max?.[0] ?? 0)

  const sunriseIso: string = weather.daily?.sunrise?.[0] ?? ''
  const sunsetIso: string = weather.daily?.sunset?.[0] ?? ''
  const sunriseT = sunriseIso ? formatTime12(sunriseIso) : '6:00 AM'
  const sunsetT = sunsetIso ? formatTime12(sunsetIso) : '8:00 PM'

  // extract hour from ISO string for sunrise/sunset numbers
  const sunriseHour = sunriseIso ? parseInt(sunriseIso.split('T')[1]?.split(':')[0] ?? '6', 10) : 6
  const sunsetHour = sunsetIso ? parseInt(sunsetIso.split('T')[1]?.split(':')[0] ?? '20', 10) : 20

  const hi = Math.round(weather.daily?.temperature_2m_max?.[0] ?? temp + 2)
  const lo = Math.round(weather.daily?.temperature_2m_min?.[0] ?? temp - 4)

  // Current local time — stored as raw ISO so display layer can format by locale
  const currentIso: string = current.time ?? new Date().toISOString()
  const nowHour = parseInt(currentIso.split('T')[1]?.split(':')[0] ?? '12', 10)
  const nowMin = parseInt(currentIso.split('T')[1]?.split(':')[1] ?? '0', 10)
  const ampm = nowHour < 12 ? 'AM' : 'PM'
  const hr12 = nowHour % 12 === 0 ? 12 : nowHour % 12
  const timeStr = `${hr12}:${nowMin.toString().padStart(2, '0')} ${ampm}`

  const det: CityDetails = {
    feels,
    uv: uvRaw,
    uvLabel: uvLabel(uvRaw),
    wind,
    windDir: degreesToDir(windDeg),
    gust,
    humidity,
    pressure,
    visibility: visibility > 0 ? visibility : 14,
    cloudCover,
    dew,
    sunriseT,
    sunsetT,
    sunriseISO: sunriseIso,  // raw — display layer formats per locale
    sunsetISO: sunsetIso,
    aqi,
    aqiLabel: aqiLbl,
  }

  // Hourly points: find current hour index and take 24 hours
  const hourlyTimes: string[] = weather.hourly?.time ?? []
  const hourlyTemps: number[] = weather.hourly?.temperature_2m ?? []
  const hourlyPop: number[] = weather.hourly?.precipitation_probability ?? []
  const hourlyPrecip: number[] = weather.hourly?.precipitation ?? []
  const hourlyCodes: number[] = weather.hourly?.weather_code ?? []
  const hourlyIsDay: number[] = weather.hourly?.is_day ?? []

  const startIdx = Math.max(0, hourlyTimes.findIndex((t: string) => t >= currentIso.slice(0, 13)))

  const hourly: HourlyPoint[] = []
  for (let i = 0; i < 24; i++) {
    const idx = startIdx + i
    if (idx >= hourlyTimes.length) break
    const hourStr = hourlyTimes[idx]?.split('T')[1]?.split(':')[0] ?? '0'
    const hourNum = parseInt(hourStr, 10)
    const hIsDay = (hourlyIsDay[idx] ?? 1) === 1
    const hCode = hourlyCodes[idx] ?? 0
    hourly.push({
      i,
      hour: hourNum,
      temp: Math.round(hourlyTemps[idx] ?? temp),
      cond: wmoToCondition(hCode, hIsDay),
      pop: Math.round(hourlyPop[idx] ?? 0),
      precipMm: Math.round((hourlyPrecip[idx] ?? 0) * 10) / 10,
      now: i === 0,
    })
  }

  // Daily points
  const dailyTimes: string[] = weather.daily?.time ?? []
  const dailyMax: number[] = weather.daily?.temperature_2m_max ?? []
  const dailyMin: number[] = weather.daily?.temperature_2m_min ?? []
  const dailyCodes: number[] = weather.daily?.weather_code ?? []
  const dailyPop: number[] = weather.daily?.precipitation_probability_max ?? []
  const dailyUV: number[] = weather.daily?.uv_index_max ?? []
  const dailyWindMax: number[] = weather.daily?.wind_speed_10m_max ?? []
  const dailyPrecipSum: number[] = weather.daily?.precipitation_sum ?? []

  const daily: DailyDay[] = dailyTimes.slice(0, 7).map((dateStr: string, i: number) => {
    const date = new Date(dateStr + 'T00:00:00')
    const dayOfWeek = date.getDay()
    const dayLabel = i === 0 ? 'Today' : DAYS[dayOfWeek]
    // Use is_day approximation: day forecasts are day by default
    const dayCond = wmoToCondition(dailyCodes[i] ?? 0, true)
    return {
      day: dayLabel,
      dayIndex: dayOfWeek,
      isToday: i === 0,
      cond: dayCond,
      hi: Math.round(dailyMax[i] ?? temp + 2),
      lo: Math.round(dailyMin[i] ?? temp - 4),
      pop: Math.round(dailyPop[i] ?? 0),
      uv: Math.round(dailyUV[i] ?? uvRaw),
      wind: Math.round(dailyWindMax[i] ?? wind),
      precipSum: Math.round((dailyPrecipSum[i] ?? 0) * 10) / 10,
    }
  })

  return {
    id,
    name,
    region,
    cond,
    temp,
    hi,
    lo,
    time: timeStr,
    timeISO: currentIso,
    sunrise: sunriseHour,
    sunset: sunsetHour,
    det,
    alerts: [],
    hourly,
    daily,
    latitude: lat,
    longitude: lon,
  }
}

// Allowlisted language codes accepted by the geocoding API
const VALID_LANGS = new Set(['en', 'bg', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'tr', 'ar', 'zh'])
function safeLang(locale: string): string {
  const l = locale.slice(0, 2).toLowerCase()
  return VALID_LANGS.has(l) ? l : 'en'
}

export async function fetchCitySuggestions(query: string, locale = 'en'): Promise<CitySuggestion[]> {
  if (query.trim().length < 2) return []
  const lang = safeLang(locale)
  const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=6&language=${lang}&format=json${_k}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.results ?? []
}

// ---- Weather Alerts — NWS (US) + MeteoAlarm (Europe) ----

function isUS(lat: number, lon: number): boolean {
  return lat >= 18 && lat <= 72 && lon >= -180 && lon <= -65
}

async function fetchNWSAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  const res = await fetch(
    `https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`,
    { headers: { 'User-Agent': 'SoraWeatherApp/1.0 (weather-app)' } }
  )
  if (!res.ok) return []
  const data = await res.json()
  const features: unknown[] = data.features ?? []

  return features.slice(0, 5).map(f => {
    const p = (f as { properties: Record<string, string> }).properties
    const rawSev = p.severity ?? 'Minor'
    const sev: WeatherAlert['sev'] =
      rawSev === 'Extreme' ? 'Extreme' : rawSev === 'Severe' ? 'Severe' : 'Moderate'
    const expires = p.expires ? new Date(p.expires) : null
    const until = expires
      ? expires.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      : 'Further notice'
    const raw = p.description || p.headline || 'Weather alert in effect.'
    return { kind: p.event || 'Weather Alert', sev, until, text: raw.replace(/\n{2,}/g, ' ').replace(/\n/g, ' ').slice(0, 280) }
  }).sort((a, b) => ({ Extreme: 0, Severe: 1, Moderate: 2 }[a.sev] - { Extreme: 0, Severe: 1, Moderate: 2 }[b.sev]))
}

async function fetchMeteoAlarm(lat: number, lon: number): Promise<WeatherAlert[]> {
  const res = await fetch(`/api/meteoalarm?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`)
  if (!res.ok) return []
  return res.json() as Promise<WeatherAlert[]>
}

export async function fetchAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  try {
    return isUS(lat, lon)
      ? await fetchNWSAlerts(lat, lon)
      : await fetchMeteoAlarm(lat, lon)
  } catch {
    return []
  }
}

// ---- RainViewer Radar ----
export interface RadarFrame {
  time: number
  path: string
}

export interface RadarData {
  host: string
  past: RadarFrame[]
  nowcast: RadarFrame[]
  satellite: RadarFrame[]
}

export async function fetchRadarData(): Promise<RadarData | null> {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json')
    if (!res.ok) return null
    const data = await res.json()
    return {
      host: data.host as string,
      past: (data.radar?.past ?? []) as RadarFrame[],
      nowcast: (data.radar?.nowcast ?? []) as RadarFrame[],
      satellite: (data.satellite?.infrared ?? []) as RadarFrame[],
    }
  } catch {
    return null
  }
}

// ---- Reverse geocoding ----
export async function reverseGeocode(lat: number, lon: number, locale = 'en'): Promise<{ city: string; region: string }> {
  const lang = safeLang(locale)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': `${lang},en;q=0.8` } }
    )
    if (!res.ok) return { city: 'Your Location', region: '' }
    const data = await res.json()
    const fallbackName = lang === 'bg' ? 'Вашето местоположение' : 'Your Location'
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || fallbackName
    const state = data.address?.state || ''
    const country = data.address?.country || ''
    const region = [state, country].filter(Boolean).join(', ')
    return { city, region }
  } catch {
    return { city: lang === 'bg' ? 'Вашето местоположение' : 'Your Location', region: '' }
  }
}

// ---- 30-day historical weather ----
export interface HistoricalDay {
  date: string
  max: number
  min: number
}

export async function fetchHistoricalWeather(lat: number, lon: number): Promise<HistoricalDay[]> {
  const end = new Date()
  end.setDate(end.getDate() - 1) // yesterday (today not yet complete)
  const start = new Date(end)
  start.setDate(start.getDate() - 29) // 30 days back
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const url = `${ARCHIVE_URL}?latitude=${lat}&longitude=${lon}` +
    `&start_date=${fmt(start)}&end_date=${fmt(end)}` +
    `&daily=temperature_2m_max,temperature_2m_min&timezone=auto${_k}`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch historical weather')
  const data = await res.json()

  return (data.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    max: Math.round(data.daily.temperature_2m_max[i] ?? 0),
    min: Math.round(data.daily.temperature_2m_min[i] ?? 0),
  }))
}

// ---- Minute-by-minute precipitation (next 2 hours, 15-min intervals) ----
export interface MinutelyPoint {
  minuteOffset: number   // 0, 15, 30, …, 105
  precip: number         // mm — precipitation amount in 15-min interval
}

export async function fetchMinutelyPrecip(lat: number, lon: number): Promise<MinutelyPoint[]> {
  const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}` +
    `&minutely_15=precipitation&forecast_minutely_15=8&timezone=auto${_k}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch minutely precip')
  const data = await res.json()
  return (data.minutely_15?.precipitation ?? []).map((p: number, i: number) => ({
    minuteOffset: i * 15,
    precip: Math.round(p * 10) / 10,
  }))
}
