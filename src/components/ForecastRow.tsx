import { ForecastDay } from '../api/weather'
import { Unit } from '../types'
import WeatherIcon from './WeatherIcon'

interface Props {
  day: ForecastDay
  unit: Unit
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDisplay(celsius: number, unit: Unit) {
  return unit === 'C' ? celsius : Math.round(celsius * 9 / 5 + 32)
}

export default function ForecastRow({ day, unit }: Props) {
  const date = new Date(day.date)
  const dayName = DAYS[date.getUTCDay()]

  return (
    <div className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-white/10 transition">
      <span className="text-white/80 text-sm w-10">{dayName}</span>
      <WeatherIcon weathercode={day.weathercode} isDay={true} size={28} />
      <div className="flex gap-3 text-sm">
        <span className="text-white font-semibold">{toDisplay(day.maxTemp, unit)}°</span>
        <span className="text-white/50">{toDisplay(day.minTemp, unit)}°</span>
      </div>
    </div>
  )
}
