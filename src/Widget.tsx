import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCityData, reverseGeocode } from './api/weather'
import type { CityData } from './types'
import WidgetView from './views/WidgetView'

const DEFAULT = { lat: 51.5074, lon: -0.1278, name: 'London', region: 'United Kingdom' }

function WidgetSkeleton() {
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'linear-gradient(135deg, #1d4ed8, #38bdf8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 60, height: 60, borderRadius: 30, background: 'rgba(255,255,255,0.25)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
    </div>
  )
}

export default function Widget() {
  const [loc, setLoc] = useState<{ lat: number; lon: number; name: string; region: string } | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) { setLoc(DEFAULT); return }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { city, region } = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        setLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: city, region })
      },
      () => setLoc(DEFAULT),
      { timeout: 6000 }
    )
  }, [])

  const { data } = useQuery<CityData | null>({
    queryKey: ['widget', loc?.lat, loc?.lon],
    queryFn: () => loc ? fetchCityData(loc.lat, loc.lon, loc.name, loc.region, 'widget') : null,
    enabled: !!loc,
    staleTime: 1000 * 60 * 10,
  })

  if (!data) return <WidgetSkeleton />
  return <WidgetView data={data} />
}
