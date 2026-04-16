import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, MapPin, Clock } from 'lucide-react'
import { lugares } from '../data/lugares'

const MAPS_KEY = 'AIzaSyBi9N8ltzSS4LPtlbaJWuNrjns3o90iTkw'

export default function SearchBar({ onSelectPlace }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [localesMatch, setLocalesMatch] = useState([])
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const timeoutRef = useRef(null)

  // Inicializar Places Autocomplete
  useEffect(() => {
    if (!window.google) return
    const service = new window.google.maps.places.AutocompleteService()
    autocompleteRef.current = service
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setSugerencias([])
      setLocalesMatch([])
      return
    }

    // Buscar en lugares hardcodeados
    const match = lugares.filter(l =>
      l.nombre.toLowerCase().includes(query.toLowerCase()) ||
      l.categoria.toLowerCase().includes(query.toLowerCase())
    )
    setLocalesMatch(match)

    // Buscar en Google Places con debounce
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (!autocompleteRef.current) return
      setLoading(true)
      autocompleteRef.current.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'co' },
        location: new window.google.maps.LatLng(8.7479, -75.8814),
        radius: 10000,
        types: ['establishment', 'geocode']
      }, (predictions, status) => {
        setLoading(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSugerencias(predictions.slice(0, 4))
        } else {
          setSugerencias([])
        }
      })
    }, 350)
  }, [query])

  const handleSelectLocal = (lugar) => {
    setQuery(lugar.nombre)
    setFocused(false)
    setSugerencias([])
    setLocalesMatch([])
    navigate(`/detail/${lugar.id}`)
  }

  const handleSelectGoogle = (prediction) => {
    setQuery(prediction.structured_formatting.main_text)
    setFocused(false)
    setSugerencias([])
    if (onSelectPlace) onSelectPlace(prediction.place_id)
  }

  const limpiar = () => {
    setQuery('')
    setSugerencias([])
    setLocalesMatch([])
    inputRef.current?.focus()
  }

  const showDropdown = focused && query.length > 0 && (localesMatch.length > 0 || sugerencias.length > 0 || loading)

  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'white',
        borderRadius: showDropdown ? '20px 20px 0 0' : '999px',
        padding: '0 16px',
        height: 48,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        transition: 'border-radius 0.2s'
      }}>
        <Search size={18} color="#9CA3AF" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Buscar lugares, hoteles..."
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: 15, color: '#1A1A2E',
            background: 'transparent'
          }}
        />
        {query.length > 0 && (
          <button onClick={limpiar} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
            <X size={16} color="#9CA3AF" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'white',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          maxHeight: 320,
          overflowY: 'auto'
        }}>

          {/* Lugares locales */}
          {localesMatch.length > 0 && (
            <>
              <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                En Tico
              </div>
              {localesMatch.map(lugar => (
                <div key={lugar.id} onClick={() => handleSelectLocal(lugar)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: '#E8F7F2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <MapPin size={16} color="#1D9E75" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>{lugar.nombre}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{lugar.categoria} · {lugar.distancia}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Separador */}
          {localesMatch.length > 0 && sugerencias.length > 0 && (
            <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />
          )}

          {/* Google Places */}
          {sugerencias.length > 0 && (
            <>
              <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Google Places
              </div>
              {sugerencias.map(pred => (
                <div key={pred.place_id} onClick={() => handleSelectGoogle(pred)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Search size={16} color="#9CA3AF" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>
                      {pred.structured_formatting.main_text}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
                      {pred.structured_formatting.secondary_text}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Loading */}
          {loading && sugerencias.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
              Buscando...
            </div>
          )}
        </div>
      )}
    </div>
  )
}