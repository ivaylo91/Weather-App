import { useEffect, useRef } from 'react'
import type { WeatherTone, Unit, WindUnit } from '../types'
import { skyFor, THEMES } from '../utils/sky'
import { windUnitLabel } from '../utils/temperature'
import { useT, useLocale } from '../i18n/LocaleContext'
import type { Locale } from '../i18n/translations'
import Icon from './Icon'

type ToneOverride = 'auto' | 'dark' | 'light'

interface SettingsSheetProps {
  tone: WeatherTone
  accent: string
  unit: Unit
  windUnit: WindUnit
  themeKey: string
  toneOverride: ToneOverride
  motionOff: boolean
  onUnitToggle: () => void
  onWindUnit: (u: WindUnit) => void
  onTheme: (k: string) => void
  onToneOverride: (v: ToneOverride) => void
  onMotionToggle: () => void
  onShare: () => void
  onClose: () => void
  alertOnRain: boolean
  alertOnSnow: boolean
  onToggleRainAlert: () => void
  onToggleSnowAlert: () => void
  apiOk: boolean
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase', opacity: 0.5 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Pill({ active, accent, fg, onClick, children, label }: {
  active: boolean; accent: string; fg: string; onClick: () => void; children: React.ReactNode; label?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className="press"
      style={{
        flex: 1, padding: '10px 6px', borderRadius: 14, border: 'none', cursor: 'pointer',
        background: active ? accent : 'rgba(120,130,160,0.12)',
        color: active ? '#fff' : fg,
        fontSize: 13.5, fontWeight: 700, transition: 'all .2s',
      }}
    >
      {children}
    </button>
  )
}

export default function SettingsSheet({
  tone, accent, unit, windUnit, themeKey, toneOverride, motionOff,
  alertOnRain, alertOnSnow,
  onUnitToggle, onWindUnit, onTheme, onToneOverride, onMotionToggle, onShare, onClose,
  onToggleRainAlert, onToggleSnowAlert, apiOk,
}: SettingsSheetProps) {
  const tr = useT()
  const { locale, setLocale } = useLocale()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Move focus to close button when sheet opens
  useEffect(() => { closeRef.current?.focus() }, [])

  const bg = tone === 'light' ? '#1b2540' : '#fff'
  const fg = tone === 'light' ? '#fff' : '#15243f'
  const dim = tone === 'light' ? 'rgba(255,255,255,0.55)' : 'rgba(21,36,63,0.5)'
  const rowBg = tone === 'light' ? 'rgba(255,255,255,0.06)' : 'rgba(21,36,63,0.04)'

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(12,18,34,0.42)', zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(520px, 100%)', background: bg, color: fg, borderRadius: '28px 28px 0 0', padding: '10px 22px 36px', boxShadow: '0 -10px 50px rgba(0,0,0,0.28)', overflowY: 'auto', maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div style={{ width: 44, height: 5, borderRadius: 3, background: tone === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(21,36,63,0.15)', margin: '0 auto 18px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Icon name="settings" size={20} stroke={2.2} style={{ color: accent }} />
            <span style={{ fontSize: 20, fontWeight: 800 }}>{tr.settingsTitle}</span>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close settings" className="press" style={{ width: 34, height: 34, borderRadius: 17, border: 'none', background: rowBg, color: fg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <Icon name="close" size={17} stroke={2.4} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Language */}
          <Row label={tr.language}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                ['en', '🇬🇧 English'],
                ['bg', '🇧🇬 Български'],
              ] as [Locale, string][]).map(([l, label]) => (
                <Pill key={l} active={locale === l} accent={accent} fg={fg} onClick={() => setLocale(l)}>
                  {label}
                </Pill>
              ))}
            </div>
          </Row>

          {/* Temperature unit */}
          <Row label={tr.temperature}>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['C', 'F'] as Unit[]).map(u => (
                <Pill key={u} active={unit === u} accent={accent} fg={fg} onClick={onUnitToggle} label={`Temperature ${u === 'C' ? 'Celsius' : 'Fahrenheit'}`}>
                  °{u}
                </Pill>
              ))}
            </div>
          </Row>

          {/* Wind speed unit */}
          <Row label={tr.windSpeed}>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['kmh', 'mph', 'ms'] as WindUnit[]).map(u => (
                <Pill key={u} active={windUnit === u} accent={accent} fg={fg} onClick={() => onWindUnit(u)}>
                  {windUnitLabel(u)}
                </Pill>
              ))}
            </div>
          </Row>

          {/* Color theme */}
          <Row label={tr.colorTheme}>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.keys(THEMES).map(tk => {
                const s = skyFor('partly-cloudy-day', tk)
                const active = themeKey === tk
                return (
                  <button key={tk} onClick={() => onTheme(tk)} className="press" style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '10px 4px',
                    borderRadius: 16, border: active ? `2px solid ${accent}` : `1.5px solid transparent`,
                    background: active ? (tone === 'light' ? 'rgba(255,255,255,0.08)' : 'rgba(21,36,63,0.06)') : rowBg,
                    cursor: 'pointer',
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: s.gradient, border: '1px solid rgba(255,255,255,0.25)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.12)' }} />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: active ? accent : dim }}>{tk}</span>
                  </button>
                )
              })}
            </div>
          </Row>

          {/* Brightness */}
          <Row label={tr.brightness}>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['auto', 'dark', 'light'] as ToneOverride[]).map(v => (
                <Pill key={v} active={toneOverride === v} accent={accent} fg={fg} onClick={() => onToneOverride(v)}>
                  {v === 'auto' ? tr.autoMode : v === 'dark' ? tr.darkMode : tr.lightMode}
                </Pill>
              ))}
            </div>
          </Row>

          {/* Animations */}
          <Row label={tr.animations}>
            <button
              onClick={onMotionToggle}
              className="press"
              role="switch"
              aria-checked={!motionOff}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 16px', borderRadius: 16, border: 'none', background: rowBg,
                color: fg, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 14.5, fontWeight: 600 }}>{motionOff ? tr.animOff : tr.animOn}</span>
              {/* Toggle pill */}
              <div style={{
                width: 44, height: 26, borderRadius: 13,
                background: motionOff ? 'rgba(120,130,160,0.22)' : accent,
                position: 'relative', flexShrink: 0, transition: 'background .2s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: motionOff ? 3 : 21, width: 20, height: 20,
                  borderRadius: 10, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left .2s',
                }} />
              </div>
            </button>
          </Row>

          {/* Condition alerts */}
          {typeof Notification !== 'undefined' && (
            <Row label={tr.condAlerts}>
              {[
                { label: tr.alertOnRain, on: alertOnRain, toggle: onToggleRainAlert },
                { label: tr.alertOnSnow, on: alertOnSnow, toggle: onToggleSnowAlert },
              ].map(({ label, on, toggle }) => (
                <button key={label} onClick={toggle} className="press" role="switch" aria-checked={on}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 16, border: 'none', background: rowBg, color: fg, cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
                  <div style={{ width: 44, height: 26, borderRadius: 13, background: on ? accent : 'rgba(120,130,160,0.22)', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
                    <div style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
                  </div>
                </button>
              ))}
            </Row>
          )}

          {/* API status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 16, background: rowBg }}>
            <div style={{ width: 9, height: 9, borderRadius: 5, background: apiOk ? '#34c759' : '#ff3b30', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: fg, opacity: 0.8 }}>{apiOk ? tr.apiOk : tr.apiError}</span>
          </div>

          {/* Share */}
          <button
            onClick={() => { onShare(); onClose() }}
            className="press"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px 16px', borderRadius: 18, border: `1.5px solid ${tone === 'light' ? 'rgba(255,255,255,0.18)' : 'rgba(21,36,63,0.12)'}`,
              background: rowBg, color: fg, cursor: 'pointer', fontWeight: 700, fontSize: 15,
            }}
          >
            <Icon name="share" size={20} stroke={2.2} style={{ color: accent }} />
            {tr.share}
          </button>
        </div>
      </div>
    </div>
  )
}
