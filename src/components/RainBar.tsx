import { useQuery } from '@tanstack/react-query'
import type { WeatherTone } from '../types'
import { toneStyles } from '../utils/sky'
import { fetchMinutelyPrecip } from '../api/weather'
import { useT } from '../i18n/LocaleContext'
import { Card, SectionLabel } from './Card'

interface Props {
  lat: number
  lon: number
  tone: WeatherTone
}

export default function RainBar({ lat, lon, tone }: Props) {
  const t = toneStyles(tone)
  const tr = useT()

  const { data } = useQuery({
    queryKey: ['minutely', lat, lon],
    queryFn: () => fetchMinutelyPrecip(lat, lon),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  if (!data?.length) return null

  const maxPrecip = Math.max(...data.map(p => p.precip), 0.1)
  const hasRain = data.some(p => p.precip > 0)
  const totalMM = Math.round(data.reduce((s, p) => s + p.precip, 0) * 10) / 10

  return (
    <Card tone={tone}>
      <SectionLabel tone={tone} icon="drop">
        {hasRain ? tr.rainNext2h(totalMM) : tr.noRain}
      </SectionLabel>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 48 }}>
        {data.map((p, i) => {
          const h = Math.max(3, (p.precip / maxPrecip) * 44)
          const isFirst = i === 0
          const isLast = i === data.length - 1
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div
                title={`${p.precip} mm at +${p.minuteOffset} min`}
                style={{
                  width: '100%',
                  height: h,
                  borderRadius: `4px 4px 0 0`,
                  background: p.precip > 0
                    ? `oklch(0.65 0.18 ${220 - (p.precip / maxPrecip) * 40})`
                    : t.track,
                  transition: 'height .4s ease',
                }}
              />
              {(isFirst || isLast || i === Math.floor(data.length / 2)) && (
                <div style={{ fontSize: 9.5, color: t.faint, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {isFirst ? 'Now' : `+${p.minuteOffset}m`}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
