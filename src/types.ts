export type WeatherCondition = 'clear-day' | 'clear-night' | 'partly-cloudy-day' | 'partly-cloudy-night' | 'cloudy' | 'rain' | 'thunderstorm' | 'snow' | 'fog'
export type WeatherTone = 'light' | 'dark'
export type Unit = 'C' | 'F'
export type WindUnit = 'kmh' | 'mph' | 'ms'

export interface WeatherAlert {
  kind: string
  sev: 'Extreme' | 'Severe' | 'Moderate'
  until: string
  text: string
}

export interface HourlyPoint {
  i: number
  hour: number
  temp: number
  cond: WeatherCondition
  pop: number
  now: boolean
}

export interface DailyDay {
  day: string       // English fallback ("Today" / "Mon" etc.)
  dayIndex: number  // 0 = Sun … 6 = Sat
  isToday: boolean
  cond: WeatherCondition
  hi: number
  lo: number
  pop: number
}

export interface CityDetails {
  feels: number
  uv: number
  uvLabel: string
  wind: number
  windDir: string
  gust: number
  humidity: number
  pressure: number
  visibility: number
  dew: number
  sunriseT: string
  sunsetT: string
  aqi: number
  aqiLabel: string
}

export interface CityData {
  id: string
  name: string
  region: string
  cond: WeatherCondition
  temp: number
  hi: number
  lo: number
  time: string
  sunrise: number
  sunset: number
  det: CityDetails
  alerts: WeatherAlert[]   // ordered most-severe first
  hourly: HourlyPoint[]
  daily: DailyDay[]
  latitude: number
  longitude: number
}

export interface StaticCity {
  id: string
  name: string
  region: string
  cond: WeatherCondition
  temp: number
  hi: number
  lo: number
  latitude: number
  longitude: number
}

export interface CitySuggestion {
  id: number
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
}
