import type { CSSProperties, ReactNode } from 'react'
import { toneStyles } from '../utils/sky'
import Icon from './Icon'
import type { WeatherTone } from '../types'

interface CardProps {
  tone: WeatherTone
  children: ReactNode
  style?: CSSProperties
  className?: string
  onClick?: () => void
  pad?: number
}

export function Card({ tone, children, style = {}, className = '', onClick, pad = 18 }: CardProps) {
  const t = toneStyles(tone)
  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      style={{
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: 26,
        padding: pad,
        boxShadow: t.shadow,
        color: t.text,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

interface SectionLabelProps {
  tone: WeatherTone
  icon?: string
  children: ReactNode
  right?: ReactNode
}

export function SectionLabel({ tone, icon, children, right }: SectionLabelProps) {
  const t = toneStyles(tone)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 4px 10px', color: t.dim }}>
      {icon && <Icon name={icon} size={15} stroke={2.2} />}
      <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>{children}</span>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  )
}
