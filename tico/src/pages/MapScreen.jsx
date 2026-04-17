import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

const MONTERIA_CENTER = { lat: 8.7479, lng: -75.8814 }

const COLORES = {
  naturaleza:  'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  cultura:     'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  gastronomia: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  turismo:     'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
}

const categorias = ['Todos', 'naturaleza', 'cultura', 'gastronomia', 'turismo']
const categoriasLabel = {
  Todos: 'Todos',
  naturaleza: 'Naturaleza',
  cultura: 'Cultura',
  gastronomia: 'Gastronomía',
  turismo: 'Turismo'
}

const NAVBAR_HEIGHT = 64

function getViewportHeight() {
  return (window.visualViewport?.height || window.innerHeight) - NAVBAR_HEIGHT
}

export default function MapScreen() {
  const navigate = useNavigate()
  const [lugares, setLugares] = useState([])
  const [selectedLugar, setSelectedLugar] = useState(null)
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [mapHeight, setMapHeight] = useState(getViewportHeight())
  const [loadingLugares, setLoadingLugares] = useState(true)

  // Jalar lugares desde Firestore
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

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY
  })

  const lugaresFiltrados = categoriaActiva === 'Todos'
    ? lugares
    : lugares.filter(l => l.categoria === categoriaActiva)

  if (!isLoaded || loadingLugares) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: mapHeight }}>
      <p style={{ color: '#1D9E75', fontWeight: 600 }}>Cargando mapa...</p>
    </div>
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: mapHeight }}>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={MONTERIA_CENTER}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {lugaresFiltrados.map(lugar => (
          <Marker
            key={lugar.id}
            position={lugar.position}
            icon={COLORES[lugar.categoria] || COLORES.turismo}
            onClick={() => setSelectedLugar(lugar)}
          />
        ))}

        {selectedLugar && (
          <InfoWindow
            position={selectedLugar.position}
            onCloseClick={() => setSelectedLugar(null)}
          >
            <div style={{ padding: '6px', minWidth: '170px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>
                {selectedLugar.nombre}
              </p>
              <p style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
                ⭐ {selectedLugar.calificacion} · {selectedLugar.distancia}
              </p>
              <button
                onClick={() => navigate(`/detail/${selectedLugar.id}`, { state: { lugar: selectedLugar } })}
                style={{
                  background: '#1D9E75',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Ver detalle →
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Barra de búsqueda flotante */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 10 }}>
        <div style={{
          background: 'white',
          borderRadius: '999px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
        }}>
          <Search size={18} color="#9CA3AF" />
          <input
            type="text"
            placeholder="Buscar lugares, hoteles..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: '#374151',
              background: 'transparent'
            }}
          />
        </div>
      </div>

      {/* Filtros flotantes */}
      <div style={{ position: 'absolute', top: '76px', left: '16px', right: '16px', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
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