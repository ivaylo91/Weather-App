import { useState } from 'react'
import { getWeatherEmoji } from '../api/weather'

const CDN = 'https://cdn.jsdelivr.net/gh/basmilius/weather-icons@dev/production/fill/animated'

function iconName(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? 'clear-day' : 'clear-night'
  if (code <= 2) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night'
  if (code === 3) return isDay ? 'overcast-day' : 'overcast-night'
  if (code <= 49) return isDay ? 'fog-day' : 'fog-night'
  if (code <= 59) return 'drizzle'
  if (code <= 69) return 'rain'
  if (code <= 79) return 'snow'
  if (code <= 82) return isDay ? 'partly-cloudy-day-rain' : 'partly-cloudy-night-rain'
  if (code <= 86) return isDay ? 'partly-cloudy-day-snow' : 'partly-cloudy-night-snow'
  if (code <= 99) return 'thunderstorms'
  return 'not-available'
}

interface Props {
  weathercode: number
  isDay: boolean
  size?: number
}

export default function WeatherIcon({ weathercode, isDay, size = 64 }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span style={{ fontSize: size * 0.75, lineHeight: 1 }}>
        {getWeatherEmoji(weathercode, isDay)}
      </span>
    )
  }

  return (
    <img
      src={`${CDN}/${iconName(weathercode, isDay)}.svg`}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0"
    />
  )
}
