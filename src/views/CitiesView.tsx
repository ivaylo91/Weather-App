import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { WeatherTone, StaticCity, CitySuggestion, Unit, CityData } from '../types'
import { useT, useLocale } from '../i18n/LocaleContext'
import { toneStyles, skyFor } from '../utils/sky'
import { conv } from '../utils/temperature'
import { fetchCitySuggestions } from '../api/weather'
import { WeatherGlyph } from '../components/WeatherScene'
import { SectionLabel } from '../components/Card'
import Icon from '../components/Icon'

interface CityCardProps {
  c: StaticCity
  themeKey: string
  unit: Unit
  onSelect: () => void
  onRemove?: () => void
  current: boolean
}

function CityCard({ c, themeKey, unit, onSelect, onRemove, current }: CityCardProps) {
  const tr = useT()
  const queryClient = useQueryClient()

  // Read from the TanStack Query cache — NO new network request.
  // Data is already there if this city was recently the active city.
  // Otherwise we fall back to the static placeholder values.
  const cached = queryClient.getQueryData<CityData>(['cityData', c.latitude, c.longitude])

  const cond = cached?.cond ?? c.cond
  const temp = cached?.temp ?? c.temp
  const hi   = cached?.hi   ?? c.hi
  const lo   = cached?.lo   ?? c.lo

  const sky = skyFor(cond, themeKey)
  const ct = toneStyles(sky.tone)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      aria-label={`${c.name}, ${tr.cond[cond] ?? cond}, ${conv(temp, unit)} degrees. ${current ? 'Current city.' : ''}`}
      aria-pressed={current}
      className="press city-card"
      style={{
        position: 'relative', borderRadius: 24, padding: 18, cursor: 'pointer', overflow: 'hidden',
        background: sky.gradient, color: ct.text, boxShadow: '0 8px 26px rgba(30,50,90,0.16)',
        border: current ? `2px solid ${ct.text}` : '2px solid transparent',
      }}
    >
      <div style={{ position: 'absolute', right: -6, top: -10, opacity: 0.9 }}>
        <WeatherGlyph kind={cond} size={84} />
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: 96, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {current && <Icon name="pin" size={15} stroke={2.4} />}
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.2 }}>{c.name}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.78 }}>{c.region}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>
            {tr.cond[cond] ?? cond}
            <span style={{ opacity: 0.7 }}> · H:{conv(hi, unit)}° L:{conv(lo, unit)}°</span>
          </div>
          <div style={{ fontSize: 40, fontWeight: 500, letterSpacing: -2, lineHeight: 1 }}>
            {conv(temp, unit)}°
          </div>
        </div>
      </div>
      {onRemove && !current && (
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="city-remove press"
          style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, border: 'none', background: 'rgba(0,0,0,0.18)', color: ct.text, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          aria-label="Remove"
        >
          <Icon name="close" size={15} stroke={2.6} />
        </button>
      )}
    </div>
  )
}

interface CitiesViewProps {
  cities: StaticCity[]
  currentId: string
  themeKey: string
  tone: WeatherTone
  accent: string
  unit: Unit
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onSearch: (lat: number, lon: number, name: string, region: string) => void
}

export default function CitiesView({ cities, currentId, themeKey, tone, accent, unit, onSelect, onRemove, onSearch }: CitiesViewProps) {
  const t = toneStyles(tone)
  const tr = useT()
  const { locale } = useLocale()
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [searching, setSearching] = useState(false)

  const handleQueryChange = async (val: string) => {
    setQ(val)
    if (val.trim().length < 2) { setSuggestions([]); return }
    setSearching(true)
    try {
      setSuggestions(await fetchCitySuggestions(val, locale))
    } catch {
      setSuggestions([])
    } finally {
      setSearching(false)
    }
  }

  const savedFiltered = q.trim()
    ? cities.filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
    : cities

  const handleAddSuggestion = (s: CitySuggestion) => {
    const region = [s.admin1, s.country].filter(Boolean).join(', ')
    onSearch(s.latitude, s.longitude, s.name, region)
    setQ('')
    setSuggestions([])
  }

  return (
    <main aria-label="Cities" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.6, margin: '2px 2px 14px', color: t.text }}>{tr.citiesTitle}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 18, padding: '12px 15px', color: t.dim, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <Icon name="search" size={19} stroke={2.2} />
          <input
            value={q}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder={tr.searchPlaceholder}
            aria-label={tr.searchPlaceholder}
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', color: t.text, fontSize: 15.5, fontWeight: 600, fontFamily: 'inherit' }}
          />
          {q && (
            <button onClick={() => { setQ(''); setSuggestions([]) }} className="press" style={{ border: 'none', background: 'none', color: t.dim, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <Icon name="close" size={17} stroke={2.4} />
            </button>
          )}
        </div>
      </div>

      {q.trim() && suggestions.length > 0 && (
        <div>
          <SectionLabel tone={tone} icon="plus">{tr.addCity}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestions.map(s => (
              <button key={s.id} onClick={() => handleAddSuggestion(s)} className="press" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 18,
                border: `1px solid ${t.cardBorder}`, background: t.cardBg, color: t.text,
                cursor: 'pointer', textAlign: 'left', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 12.5, color: t.dim, fontWeight: 600 }}>{[s.admin1, s.country].filter(Boolean).join(', ')}</div>
                </div>
                <div style={{ color: accent }}><Icon name="plus" size={22} stroke={2.6} /></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {searching && (
        <div style={{ textAlign: 'center', color: t.dim, padding: '16px 0', fontWeight: 600 }}>{tr.searching}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {savedFiltered.map(c => (
          <CityCard
            key={c.id}
            c={c}
            themeKey={themeKey}
            unit={unit}
            current={c.id === currentId}
            onSelect={() => onSelect(c.id)}
            onRemove={() => onRemove(c.id)}
          />
        ))}
      </div>

      {q.trim() && suggestions.length === 0 && savedFiltered.length === 0 && !searching && (
        <div style={{ textAlign: 'center', color: t.dim, padding: '30px 0', fontWeight: 600 }}>
          {tr.noCitiesFound(q)}
        </div>
      )}
    </main>
  )
}
