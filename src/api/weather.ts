import type { CityData, CityDetails, WeatherCondition, HourlyPoint, DailyDay, CitySuggestion } from '../types'

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

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
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,weather_code,is_day` +
    `&hourly=temperature_2m,precipitation_probability,weather_code,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,precipitation_probability_max` +
    `&forecast_days=7&timezone=auto`

  const airUrl = `${AIR_URL}?latitude=${lat}&longitude=${lon}&current=european_aqi`

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
  const visibilityRaw = weather.current?.visibility ?? 14000
  const visibility = Math.round(visibilityRaw / 1000)
  const dew = Math.round(temp - ((100 - humidity) / 5))

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

  // Current local time string
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
    dew,
    sunriseT,
    sunsetT,
    aqi,
    aqiLabel: aqiLbl,
  }

  // Hourly points: find current hour index and take 24 hours
  const hourlyTimes: string[] = weather.hourly?.time ?? []
  const hourlyTemps: number[] = weather.hourly?.temperature_2m ?? []
  const hourlyPop: number[] = weather.hourly?.precipitation_probability ?? []
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
      now: i === 0,
    })
  }

  // Daily points
  const dailyTimes: string[] = weather.daily?.time ?? []
  const dailyMax: number[] = weather.daily?.temperature_2m_max ?? []
  const dailyMin: number[] = weather.daily?.temperature_2m_min ?? []
  const dailyCodes: number[] = weather.daily?.weather_code ?? []
  const dailyPop: number[] = weather.daily?.precipitation_probability_max ?? []

  const daily: DailyDay[] = dailyTimes.slice(0, 7).map((dateStr: string, i: number) => {
    const date = new Date(dateStr + 'T00:00:00')
    const dayOfWeek = date.getDay()
    const dayLabel = i === 0 ? 'Today' : DAYS[dayOfWeek]
    // Use is_day approximation: day forecasts are day by default
    const dayCond = wmoToCondition(dailyCodes[i] ?? 0, true)
    return {
      day: dayLabel,
      cond: dayCond,
      hi: Math.round(dailyMax[i] ?? temp + 2),
      lo: Math.round(dailyMin[i] ?? temp - 4),
      pop: Math.round(dailyPop[i] ?? 0),
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
    sunrise: sunriseHour,
    sunset: sunsetHour,
    det,
    alert: null,
    hourly,
    daily,
    latitude: lat,
    longitude: lon,
  }
}

export async function fetchCitySuggestions(query: string): Promise<CitySuggestion[]> {
  if (query.trim().length < 2) return []
  const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`)
  if (!res.ok) return []
  const data = await res.json()
  return data.results ?? []
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; region: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return { city: 'Your Location', region: '' }
    const data = await res.json()
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Your Location'
    const state = data.address?.state || ''
    const country = data.address?.country || ''
    const region = [state, country].filter(Boolean).join(', ')
    return { city, region }
  } catch {
    return { city: 'Your Location', region: '' }
  }
}
