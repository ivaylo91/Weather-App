import type { WeatherTone } from '../types'
import { toneStyles } from '../utils/sky'
import { useT } from '../i18n/LocaleContext'

interface InstallBannerProps {
  tone: WeatherTone
  accent: string
  onInstall: () => void
  onDismiss: () => void
}

export default function InstallBanner({ tone, accent, onInstall, onDismiss }: InstallBannerProps) {
  const t = toneStyles(tone)
  const tr = useT()

  return (
    <div
      role="banner"
      aria-label={tr.installTitle}
      className="view-fade"
      style={{
        position: 'fixed', bottom: 84, left: 12, right: 12, zIndex: 45,
        background: t.cardBg, border: `1px solid ${t.cardBorder}`,
        borderRadius: 22, padding: '13px 14px',
        display: 'flex', alignItems: 'center', gap: 11,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
        color: t.text,
      }}
    >
      <span style={{ fontSize: 26, flexShrink: 0 }}>📲</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{tr.installTitle}</div>
        <div style={{ fontSize: 12, color: t.dim, marginTop: 1 }}>{tr.installBody}</div>
      </div>

      <button
        onClick={onInstall}
        className="press"
        style={{
          flexShrink: 0, padding: '8px 16px', borderRadius: 14,
          border: 'none', background: accent, color: '#fff',
          fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}
      >
        {tr.install}
      </button>

      <button
        onClick={onDismiss}
        className="press"
        aria-label="Dismiss"
        style={{
          flexShrink: 0, width: 30, height: 30, borderRadius: 15,
          border: 'none', background: 'transparent',
          color: t.dim, cursor: 'pointer', fontSize: 16, lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  )
}
