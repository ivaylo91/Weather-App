import { useState, FormEvent, useEffect, useRef } from 'react'
import { Location } from '../types'
import { fetchCitySuggestions, CitySuggestion } from '../api/weather'

interface Props {
  onSearch: (location: Location) => void
}

export default function SearchBar({ onSearch }: Props) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(value: string) {
    setInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      const results = await fetchCitySuggestions(value)
      setSuggestions(results)
      setShowDropdown(results.length > 0)
    }, 300)
  }

  function handleSelect(s: CitySuggestion) {
    setInput('')
    setSuggestions([])
    setShowDropdown(false)
    onSearch({ type: 'coords', lat: s.latitude, lon: s.longitude, displayName: s.name, country: s.country })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    setSuggestions([])
    setShowDropdown(false)
    onSearch({ type: 'city', name: trimmed })
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md mb-8">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Search city..."
          className="flex-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 backdrop-blur border border-white/30 outline-none focus:ring-2 focus:ring-white/50 text-sm"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-white/30 hover:bg-white/40 text-white font-semibold backdrop-blur border border-white/30 transition"
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-blue-900/80 backdrop-blur border border-white/20 overflow-hidden z-20 shadow-lg">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition text-sm flex justify-between items-center border-b border-white/10 last:border-0"
            >
              <span>
                {s.name}
                {s.admin1 ? <span className="text-white/60">, {s.admin1}</span> : null}
              </span>
              <span className="text-white/50 text-xs ml-2 shrink-0">{s.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
