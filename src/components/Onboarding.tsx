import { useState } from 'react'
import { skyFor, toneStyles } from '../utils/sky'
import { reverseGeocode } from '../api/weather'
import { useT, useLocale } from '../i18n/LocaleContext'
import { WeatherScene } from './WeatherScene'
import Icon from './Icon'

// Scene kinds per slide — scenes don't need translation
const SLIDE_SCENES = ['sun', 'rain', 'pcd']

interface OnboardingProps {
  themeKey: string
  onDone: (target?: string) => void
}

export default function Onboarding({ themeKey, onDone }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [locating, setLocating] = useState(false)
  const tr = useT()
  const { locale } = useLocale()

  function handleUseLocation() {
    if (!navigator.geolocation) { onDone(); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        await reverseGeocode(pos.coords.latitude, pos.coords.longitude, locale)
        onDone()
      },
      () => onDone(),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }
  const sky = skyFor('partly-cloudy-day', themeKey)
  const t = toneStyles(sky.tone)
  const accent = sky.accent
  const isPerm = step === tr.slides.length
  const s = tr.slides[step] ?? tr.slides[0]

  return (
    <div style={{ position: 'fixed', inset: 0, background: sky.gradient, color: t.text, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ambient drifting clouds */}
      <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}>
        <g className="drift-b">
          <g transform="translate(90 140) scale(1.4)">
            <ellipse cx="0" cy="14" rx="46" ry="20" fill="rgba(255,255,255,0.5)" />
            <circle cx="-26" cy="6" r="20" fill="rgba(255,255,255,0.5)" />
            <circle cx="2" cy="-6" r="26" fill="rgba(255,255,255,0.5)" />
            <circle cx="28" cy="4" r="19" fill="rgba(255,255,255,0.5)" />
          </g>
        </g>
        <g className="drift-a">
          <g transform="translate(320 300) scale(1.1)">
            <ellipse cx="0" cy="14" rx="46" ry="20" fill="rgba(255,255,255,0.4)" />
            <circle cx="-26" cy="6" r="20" fill="rgba(255,255,255,0.4)" />
            <circle cx="2" cy="-6" r="26" fill="rgba(255,255,255,0.4)" />
            <circle cx="28" cy="4" r="19" fill="rgba(255,255,255,0.4)" />
          </g>
        </g>
        <g className="drift-b">
          <g transform="translate(150 620) scale(1.6)">
            <ellipse cx="0" cy="14" rx="46" ry="20" fill="rgba(255,255,255,0.35)" />
            <circle cx="-26" cy="6" r="20" fill="rgba(255,255,255,0.35)" />
            <circle cx="2" cy="-6" r="26" fill="rgba(255,255,255,0.35)" />
            <circle cx="28" cy="4" r="19" fill="rgba(255,255,255,0.35)" />
          </g>
        </g>
      </svg>

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 480, width: '100%', margin: '0 auto', padding: '26px 28px 34px' }}>
        {/* top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 20, letterSpacing: -0.3 }}>
            <span style={{ width: 30, height: 30, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" fill="#fff" />
                <g stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
                </g>
              </svg>
            </span>
            Времето днес
          </div>
          {!isPerm && (
            <button onClick={() => onDone()} className="press" style={{ border: 'none', background: 'none', color: t.dim, fontWeight: 700, fontSize: 14.5, cursor: 'pointer' }}>
              {tr.skip}
            </button>
          )}
        </div>

        {!isPerm ? (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div key={'sc' + step} className="hero-rise" style={{ marginBottom: 18 }}>
                <WeatherScene kind={SLIDE_SCENES[step] ?? 'sun'} size={240} />
              </div>
              <h1 key={'ti' + step} className="hero-rise" style={{ fontSize: 'clamp(30px, 8vw, 40px)', fontWeight: 800, letterSpacing: -1, lineHeight: 1.05, whiteSpace: 'pre-line', margin: 0, animationDelay: '.05s' }}>
                {s.title}
              </h1>
              <p key={'bo' + step} className="hero-rise" style={{ fontSize: 16.5, lineHeight: 1.55, color: t.dim, fontWeight: 500, maxWidth: 360, marginTop: 14, animationDelay: '.1s' }}>
                {s.body}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 7 }}>
                {SLIDE_SCENES.map((_, i) => (
                  <span key={i} style={{ height: 7, borderRadius: 4, width: i === step ? 22 : 7, background: i === step ? accent : t.track, transition: 'all .3s' }} />
                ))}
              </div>
              <button
                onClick={() => setStep(step + 1)}
                className="press"
                style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: accent, color: '#fff', fontWeight: 800, fontSize: 16, padding: '15px 26px', borderRadius: 30, cursor: 'pointer', boxShadow: `0 10px 26px ${accent}55` }}
              >
                {step === tr.slides.length - 1 ? tr.getStarted : tr.next}
                <Icon name="chevron" size={19} stroke={2.6} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="hero-rise" style={{ alignSelf: 'center', marginBottom: 22 }}>
              <div style={{ width: 110, height: 110, borderRadius: 36, background: t.cardBg, border: `1px solid ${t.cardBorder}`, display: 'grid', placeItems: 'center', color: accent, boxShadow: t.shadow }}>
                <Icon name="crosshair" size={52} stroke={1.8} />
              </div>
            </div>
            <h1 className="hero-rise" style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8, textAlign: 'center', margin: 0, animationDelay: '.05s' }}>
              {tr.enableLocationTitle}
            </h1>
            <p className="hero-rise" style={{ fontSize: 16, lineHeight: 1.55, color: t.dim, fontWeight: 500, textAlign: 'center', maxWidth: 340, margin: '12px auto 0', animationDelay: '.1s' }}>
              {tr.enableLocationBody}
            </p>
            <div className="hero-rise" style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 30, animationDelay: '.15s' }}>
              <button
                onClick={handleUseLocation}
                disabled={locating}
                className="press"
                style={{ border: 'none', background: accent, color: '#fff', fontWeight: 800, fontSize: 16.5, padding: '16px', borderRadius: 22, cursor: locating ? 'default' : 'pointer', opacity: locating ? 0.8 : 1, boxShadow: `0 10px 26px ${accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}
              >
                <Icon name="pin" size={20} stroke={2.4} />{locating ? tr.locating : tr.useMyLocation}
              </button>
              <button
                onClick={() => onDone('cities')}
                className="press"
                style={{ border: `1px solid ${t.cardBorder}`, background: t.cardBg, color: t.text, fontWeight: 700, fontSize: 16, padding: '15px', borderRadius: 22, cursor: 'pointer', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
              >
                {tr.chooseManually}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
