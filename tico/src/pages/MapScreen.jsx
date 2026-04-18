import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, MapPin } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

const MONTERIA_CENTER = { lat: 8.7479, lng: -75.8814 }

const CATEGORIA_COLOR = {
  naturaleza:  '#16A34A',
  cultura:     '#7C3AED',
  gastronomia: '#EA580C',
  turismo:     '#0369A1',
}

const categorias = ['Todos', 'naturaleza', 'cultura', 'gastronomia', 'turismo']
const categoriasLabel = {
  Todos: 'Todos',
  naturaleza: 'Naturaleza',
  cultura: 'Cultura',
  gastronomia: 'Gastronomía',
  turismo: 'Turismo'
}

const MAP_STYLES = [
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
]

const LIBRARIES = ['places']
const NAVBAR_HEIGHT = 64

function getViewportHeight() {
  return (window.visualViewport?.height || window.innerHeight) - NAVBAR_HEIGHT
}

// SVG del pin como data URL — estático, no cambia entre renders
function buildPinIcon(isSelected) {
  const size = isSelected ? 54 : 44
  const svg = `
    <svg width="${size}" height="${Math.round(size * 1.27)}" viewBox="0 0 44 56"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2C12.06 2 4 10.06 4 20C4 33 22 54 22 54C22 54 40 33 40 20C40 10.06 31.94 2 22 2Z"
        fill="#1D9E75"/>
      <circle cx="22" cy="20" r="12" fill="#0F4C35" opacity="0.4"/>
      <path d="M13 22 C15 18, 18 17, 20 19 C22 21, 25 21, 28 18"
        stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="28" cy="18" r="2.5" fill="#F5A623"/>
    </svg>
  `
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: { width: size, height: Math.round(size * 1.27) },
    anchor: { x: size / 2, y: Math.round(size * 1.27) },
  }
}

const PIN_NORMAL   = buildPinIcon(false)
const PIN_SELECTED = buildPinIcon(true)

// ── Componente principal ──────────────────────────────────────────────────────
export default function MapScreen() {
  const navigate = useNavigate()
  const mapRef = useRef(null)

  const [lugares, setLugares] = useState([])
  const [selectedLugar, setSelectedLugar] = useState(null)
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [mapHeight, setMapHeight] = useState(getViewportHeight())
  const [loadingLugares, setLoadingLugares] = useState(true)

  const [query, setQuery] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    async function fetchLugares() {
      const snap = await getDocs(collection(db, 'lugares'))
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        position: { lat: doc.data().lat, lng: doc.data().lng }
      }))
      setLugares(data)
      setLoadingLugares(false)
    }
    fetchLugares()
  }, [])

  useEffect(() => {
    const update = () => setMapHeight(getViewportHeight())
    window.visualViewport?.addEventListener('resize', update)
    window.addEventListener('resize', update)
    return () => {
      window.visualViewport?.removeEventListener('resize', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    if (!query.trim()) { setSugerencias([]); return }
    const q = query.toLowerCase()
    setSugerencias(
      lugares.filter(l =>
        l.nombre?.toLowerCase().includes(q) ||
        l.categoria?.toLowerCase().includes(q)
      )
    )
  }, [query, lugares])

  const handleSelectSugerencia = (lugar) => {
    setQuery(lugar.nombre)
    setSugerencias([])
    setSearchFocused(false)
    if (mapRef.current) {
      mapRef.current.panTo(lugar.position)
      mapRef.current.setZoom(17)
    }
    setSelectedLugar(lugar)
  }

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  })

  const lugaresFiltrados = useMemo(() =>
    categoriaActiva === 'Todos'
      ? lugares
      : lugares.filter(l => l.categoria === categoriaActiva),
    [lugares, categoriaActiva]
  )

  const showDropdown = searchFocused && query.length > 0 && sugerencias.length > 0

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    styles: MAP_STYLES,
    clickableIcons: false,
  }), [])

  if (!isLoaded || loadingLugares) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: mapHeight }}>
      <p style={{ color: '#1D9E75', fontWeight: 600 }}>Cargando mapa...</p>
    </div>
  )

  const catColor = selectedLugar
    ? (CATEGORIA_COLOR[selectedLugar.categoria?.toLowerCase()] || '#1D9E75')
    : '#1D9E75'

  return (
    <div style={{ position: 'relative', width: '100%', height: mapHeight }}>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={MONTERIA_CENTER}
        zoom={15}
        options={mapOptions}
        onLoad={map => { mapRef.current = map }}
        onClick={() => setSelectedLugar(null)}
      >
        {lugaresFiltrados.map(lugar => (
          <Marker
            key={lugar.id}
            position={lugar.position}
            icon={selectedLugar?.id === lugar.id ? PIN_SELECTED : PIN_NORMAL}
            onClick={() => setSelectedLugar(
              selectedLugar?.id === lugar.id ? null : lugar
            )}
          />
        ))}

        {selectedLugar && (
          <InfoWindow
            position={selectedLugar.position}
            onCloseClick={() => setSelectedLugar(null)}
            options={{ pixelOffset: new window.google.maps.Size(0, -54) }}
          >
            <div style={{ width: '210px', fontFamily: 'sans-serif', overflow: 'hidden' }}>
              <div style={{
                width: '100%', height: '120px', borderRadius: '10px',
                overflow: 'hidden', background: '#E8F7F2', marginBottom: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selectedLugar.foto
                  ? <img src={selectedLugar.foto} alt={selectedLugar.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <MapPin size={32} color="#1D9E75" />
                }
              </div>
              <span style={{
                fontSize: '10px', fontWeight: '700', color: catColor,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {selectedLugar.categoria}
              </span>
              <p style={{ fontWeight: '800', fontSize: '14px', color: '#1A1A2E', margin: '2px 0 6px', lineHeight: 1.3 }}>
                {selectedLugar.nombre}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px' }}>⭐</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1A1A2E' }}>{selectedLugar.calificacion}</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>·</span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{selectedLugar.distancia}</span>
              </div>
              <button
                onClick={() => navigate(`/detail/${selectedLugar.id}`, { state: { lugar: selectedLugar } })}
                style={{
                  width: '100%', padding: '8px 0', background: '#1D9E75',
                  color: 'white', border: 'none', borderRadius: '20px',
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                }}
              >
                Ver detalle →
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* SearchBar + Filtros */}
      <div style={{
        position: 'absolute', top: '16px', left: '16px', right: '16px',
        zIndex: 10, display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'white',
            borderRadius: showDropdown ? '20px 20px 0 0' : '999px',
            padding: '12px 16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            transition: 'border-radius 0.2s'
          }}>
            <Search size={18} color="#9CA3AF" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Buscar en Tico..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: '14px', color: '#374151', background: 'transparent'
              }}
            />
            {query.length > 0 && (
              <button onClick={() => { setQuery(''); setSugerencias([]) }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={16} color="#9CA3AF" />
              </button>
            )}
          </div>

          {showDropdown && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'white', borderRadius: '0 0 20px 20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              overflow: 'hidden', zIndex: 20
            }}>
              {sugerencias.map(lugar => (
                <div
                  key={lugar.id}
                  onClick={() => handleSelectSugerencia(lugar)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: '#E8F7F2', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <MapPin size={16} color="#1D9E75" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>
                      {lugar.nombre}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>
                      {lugar.categoria} · {lugar.distancia}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              style={{
                flexShrink: 0, padding: '8px 16px', borderRadius: '999px',
                fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                background: categoriaActiva === cat ? '#1D9E75' : 'white',
                color: categoriaActiva === cat ? 'white' : '#4B5563',
              }}
            >
              {categoriasLabel[cat]}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}