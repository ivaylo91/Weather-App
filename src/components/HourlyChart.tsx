import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { Unit } from '../types'
import { HourlyPoint } from '../api/weather'

interface Props {
  hourly: HourlyPoint[]
  unit: Unit
}

function toDisplay(c: number, unit: Unit) {
  return unit === 'C' ? c : Math.round(c * 9 / 5 + 32)
}

function CustomTooltip({ active, payload, label, unit }: { active?: boolean; payload?: Array<{ dataKey: string; value: number }>; label?: string; unit: Unit }) {
  if (!active || !payload?.length) return null
  const temp = payload.find((p) => p.dataKey === 'temp')?.value
  const precip = payload.find((p) => p.dataKey === 'precip')?.value
  return (
    <div className="bg-blue-900/90 backdrop-blur rounded-lg px-3 py-2 text-xs text-white border border-white/20 shadow-lg">
      <p className="font-semibold mb-1">{label}</p>
      {temp !== undefined && <p>{toDisplay(temp, unit)}°{unit}</p>}
      {precip !== undefined && <p className="text-blue-200">Rain {precip}%</p>}
    </div>
  )
}

export default function HourlyChart({ hourly, unit }: Props) {
  return (
    <div className="rounded-2xl bg-white/20 backdrop-blur border border-white/30 p-4">
      <p className="text-white/60 text-xs uppercase tracking-wide mb-1 px-1">24-Hour Forecast</p>
      <ResponsiveContainer width="100%" height={130}>
        <ComposedChart data={hourly} margin={{ top: 10, right: 5, left: 5, bottom: 0 }}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="white" stopOpacity={0.25} />
              <stop offset="95%" stopColor="white" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={2}
          />
          <YAxis yAxisId="temp" domain={['auto', 'auto']} hide />
          <YAxis yAxisId="precip" domain={[0, 200]} hide />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Bar
            yAxisId="precip"
            dataKey="precip"
            fill="rgba(147,197,253,0.25)"
            radius={[2, 2, 0, 0]}
          />
          <Area
            yAxisId="temp"
            type="monotone"
            dataKey="temp"
            stroke="white"
            strokeWidth={2}
            fill="url(#tempGrad)"
            dot={false}
            activeDot={{ r: 4, fill: 'white', strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
