import { useQuery } from '@tanstack/react-query'
import { fetchAirQuality } from '../api/weather'

interface Props {
  lat: number
  lon: number
}

function aqiColor(aqi: number) {
  if (aqi <= 20) return { text: 'text-green-300', bar: 'bg-green-400' }
  if (aqi <= 40) return { text: 'text-lime-300', bar: 'bg-lime-400' }
  if (aqi <= 60) return { text: 'text-yellow-300', bar: 'bg-yellow-400' }
  if (aqi <= 80) return { text: 'text-orange-300', bar: 'bg-orange-400' }
  if (aqi <= 100) return { text: 'text-red-300', bar: 'bg-red-400' }
  return { text: 'text-purple-300', bar: 'bg-purple-400' }
}

export default function AirQualityCard({ lat, lon }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['airquality', lat, lon],
    queryFn: () => fetchAirQuality(lat, lon),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  })

  if (isLoading || isError || !data) return null

  const colors = aqiColor(data.aqi)
  const pct = Math.min((data.aqi / 150) * 100, 100)

  return (
    <div className="rounded-2xl bg-white/20 backdrop-blur border border-white/30 p-4">
      <p className="text-white/60 text-xs uppercase tracking-wide mb-3 px-1">Air Quality</p>
      <div className="flex items-baseline justify-between px-1 mb-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${colors.text}`}>{data.aqi}</span>
          <span className="text-white/50 text-sm">AQI</span>
        </div>
        <span className={`text-sm font-semibold ${colors.text}`}>{data.label}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden mx-1">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-white/40 text-xs mt-1.5 px-1">
        <span>Good</span>
        <span>Extremely Poor</span>
      </div>
    </div>
  )
}
