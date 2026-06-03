import type { CSSProperties, ReactElement } from 'react'

interface IconProps {
  name: string
  size?: number
  stroke?: number
  fill?: string
  className?: string
  style?: CSSProperties
}

export default function Icon({ name, size = 22, stroke = 2, fill = 'none', className = '', style = {} }: IconProps): ReactElement | null {
  const p = { fill, stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const paths: Record<string, ReactElement> = {
    today: <><circle cx="12" cy="12" r="4.2" {...p} /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" {...p} /></>,
    forecast: <><path d="M4 19V9M9 19v-6M14 19v-9M19 19V6" {...p} /><path d="M3 19h18" {...p} /></>,
    radar: <><circle cx="12" cy="12" r="8.5" {...p} /><circle cx="12" cy="12" r="4.5" {...p} /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><path d="M12 3.5v17M3.5 12h17" {...p} stroke="currentColor" strokeWidth={1} opacity={0.5} /></>,
    cities: <><path d="M12 21s-6.5-5.4-6.5-10A6.5 6.5 0 0 1 18.5 11c0 4.6-6.5 10-6.5 10Z" {...p} /><circle cx="12" cy="11" r="2.4" {...p} /></>,
    search: <><circle cx="11" cy="11" r="7" {...p} /><path d="M20 20l-3.5-3.5" {...p} /></>,
    plus: <><path d="M12 5v14M5 12h14" {...p} /></>,
    pin: <><path d="M12 21s-6.5-5.4-6.5-10A6.5 6.5 0 0 1 18.5 11c0 4.6-6.5 10-6.5 10Z" {...p} /><circle cx="12" cy="11" r="2.4" {...p} /></>,
    crosshair: <><circle cx="12" cy="12" r="7" {...p} /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" {...p} /><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" /></>,
    chevron: <><path d="M9 6l6 6-6 6" {...p} /></>,
    chevronDown: <><path d="M6 9l6 6 6-6" {...p} /></>,
    back: <><path d="M15 6l-6 6 6 6" {...p} /></>,
    close: <><path d="M6 6l12 12M18 6L6 18" {...p} /></>,
    bell: <><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" {...p} /><path d="M10 20a2.5 2.5 0 0 0 4 0" {...p} /></>,
    warn: <><path d="M12 3 2.5 19.5h19L12 3Z" {...p} /><path d="M12 10v4" {...p} /><circle cx="12" cy="17" r="0.4" fill="currentColor" stroke="none" strokeWidth={1.6} /></>,
    settings: <><circle cx="12" cy="12" r="3" {...p} /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" {...p} /></>,
    wind: <><path d="M3 9h11a3 3 0 1 0-3-3" {...p} /><path d="M3 14h15a3 3 0 1 1-3 3" {...p} /></>,
    drop: <><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" {...p} /></>,
    thermo: <><path d="M14 14.5V5a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0Z" {...p} /><circle cx="12" cy="17.5" r="1.6" fill="currentColor" stroke="none" /></>,
    gauge: <><path d="M4 16a8 8 0 0 1 16 0" {...p} /><path d="M12 16l4-4" {...p} /><circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" /></>,
    eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...p} /><circle cx="12" cy="12" r="2.6" {...p} /></>,
    sunUp: <><circle cx="12" cy="14" r="3.4" {...p} /><path d="M12 4v3M12 4l-2.4 2.4M12 4l2.4 2.4M4 18h16M3 14h2M19 14h2" {...p} /></>,
    sunDown: <><circle cx="12" cy="14" r="3.4" {...p} /><path d="M12 9V6M12 9l-2.4-2.4M12 9l2.4-2.4M4 18h16M3 14h2M19 14h2" {...p} /></>,
    leaf: <><path d="M20 4S8 4 6 12c-1.2 4.8 2 7 2 7M20 4c1 7-2 12-7 13" {...p} /></>,
    compass: <><circle cx="12" cy="12" r="9" {...p} /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z" {...p} /></>,
    umbrella: <><path d="M12 3a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8Z" {...p} /><path d="M12 11v7a2.5 2.5 0 0 0 5 0" {...p} /></>,
    grip: <><circle cx="9" cy="7" r="1.1" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="9" cy="17" r="1.1" fill="currentColor" stroke="none" /><circle cx="15" cy="7" r="1.1" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r="1.1" fill="currentColor" stroke="none" /></>,
    layers: <><path d="M12 3 3 8l9 5 9-5-9-5Z" {...p} /><path d="M3 13l9 5 9-5" {...p} /></>,
    check: <><path d="M5 12l5 5 9-11" {...p} /></>,
    share: <><path d="M12 2v12M8 6l4-4 4 4" {...p}/><path d="M4 13v5a2 2 0 002 2h12a2 2 0 002-2v-5" {...p}/></>,
    moon:  <><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" {...p}/></>,
    sun:   <><circle cx="12" cy="12" r="4" {...p}/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" {...p}/></>,
  }
  const content = paths[name]
  if (!content) return null
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} aria-hidden="true">
      {content}
    </svg>
  )
}
