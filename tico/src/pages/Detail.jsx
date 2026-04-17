import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { auth, db } from '../firebase/config'
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import {
  ArrowLeft, Heart, Star, Clock, MapPin,
  Ticket, Globe, Share2
} from 'lucide-react'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

function InfoChip({ icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 999,
      background: '#F0FBF7', border: '1px solid #D1FAE5'
    }}>
      {icon}
      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{text}</span>
    </div>
  )
}

const iconBtnStyle = {
  width: 38, height: 38, borderRadius: '50%',
  background: 'white', border: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
}

export default function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const user = auth.currentUser

  const [lugar, setLugar] = useState(null)
  const [esFavorito, setEsFavorito] = useState(false)
  const [loadingFav, setLoadingFav] = useState(false)
  const [mostrar360, setMostrar360] = useState(false)
  const [resenas, setResenas] = useState([])
  const [fotoUrl, setFotoUrl] = useState(null)

  useEffect(() => {
    async function fetchLugar() {
      const state = location.state?.lugar
      if (state) {
        setLugar(state)
        if (state.foto) setFotoUrl(state.foto)
        cargarDesdePlaces(state)
        verificarFavorito()
        return
      }
      try {
        const snap = await getDoc(doc(db, 'lugares', id))
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() }
          setLugar(data)
          if (data.foto) setFotoUrl(data.foto)
          cargarDesdePlaces(data)
        }
      } catch (e) {
        console.error(e)
      }
      verificarFavorito()
    }
    fetchLugar()
  }, [id])

  const cargarDesdePlaces = (local) => {
    if (!window.google) return
    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    )
    service.findPlaceFromQuery({
      query: local.nombre + ' Montería Colombia',
      fields: ['photos', 'rating', 'user_ratings_total', 'opening_hours', 'reviews', 'formatted_address']
    }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
        const place = results[0]
        setLugar(prev => ({
          ...prev,
          calificacion: place.rating || prev.calificacion,
          resenas: place.user_ratings_total || prev.resenas,
          horario: place.opening_hours?.weekday_text?.[0] || prev.horario,
          direccion: place.formatted_address || ''
        }))
        // Solo usa foto de Places si NO hay foto en Firestore
        if (place.photos?.[0] && !local.foto) {
          setFotoUrl(place.photos[0].getUrl({ maxWidth: 800 }))
        }
        if (place.reviews) {
          setResenas(place.reviews.slice(0, 3))
        }
      }
    })
  }

  const verificarFavorito = async () => {
    if (!user) return
    const ref = doc(db, 'usuarios', user.uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const favs = snap.data().favoritos || []
      setEsFavorito(favs.includes(id))
    }
  }

  const toggleFavorito = async () => {
    if (!user) return
    setLoadingFav(true)
    try {
      const ref = doc(db, 'usuarios', user.uid)
      await setDoc(ref, {
        favoritos: esFavorito ? arrayRemove(id) : arrayUnion(id)
      }, { merge: true })
      setEsFavorito(!esFavorito)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingFav(false)
    }
  }

  const abrirMaps = () => {
    if (!lugar) return
    window.open(
      'https://www.google.com/maps/dir/?api=1&destination=' + lugar.lat + ',' + lugar.lng,
      '_blank'
    )
  }

  const compartir = async () => {
    if (navigator.share && lugar) {
      await navigator.share({
        title: lugar.nombre,
        text: lugar.descripcion,
        url: window.location.href
      })
    }
  }

  if (!lugar) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid #1D9E75',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'white', paddingBottom: 140, overflowY: 'auto' }}>

      <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />

      {/* Hero foto */}
      <div style={{ position: 'relative', height: 280, background: '#E8F7F2', overflow: 'hidden' }}>
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={lugar.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setFotoUrl(null)}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8
          }}>
            <MapPin size={48} color="#1D9E75" />
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>{lugar.nombre}</span>
          </div>
        )}

        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.2) 100%)'
        }} />

        {/* Botones superiores */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between',
          padding: '52px 16px 16px'
        }}>
          <button onClick={() => navigate(-1)} style={iconBtnStyle}>
            <ArrowLeft size={20} color="#1A1A2E" />
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={compartir} style={iconBtnStyle}>
              <Share2 size={18} color="#1A1A2E" />
            </button>
            <button
              onClick={toggleFavorito}
              disabled={loadingFav}
              style={{ ...iconBtnStyle, background: esFavorito ? '#FEE2E2' : 'white' }}
            >
              <Heart
                size={18}
                color={esFavorito ? '#EF4444' : '#1A1A2E'}
                fill={esFavorito ? '#EF4444' : 'none'}
              />
            </button>
          </div>
        </div>

        {/* Badge 360 */}
        {lugar.vrDisponible && (
          <button
            onClick={() => setMostrar360(true)}
            style={{
              position: 'absolute', bottom: 16, right: 16,
              background: 'rgba(0,0,0,0.7)', color: 'white',
              border: 'none', borderRadius: 999, padding: '6px 14px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Globe size={13} color="white" />
            Vista 360°
          </button>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: '20px 20px 0' }}>

        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#1D9E75',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {lugar.categoria}
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1A2E', margin: '4px 0 0' }}>
            {lugar.nombre}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <Star size={16} color="#F5A623" fill="#F5A623" />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1A1A2E' }}>
            {lugar.calificacion}
          </span>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>
            ({lugar.resenas ? lugar.resenas.toLocaleString() : '0'} reseñas)
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {lugar.horario && <InfoChip icon={<Clock size={13} color="#1D9E75" />} text={lugar.horario} />}
          {lugar.distancia && <InfoChip icon={<MapPin size={13} color="#1D9E75" />} text={lugar.distancia} />}
          {lugar.precio && <InfoChip icon={<Ticket size={13} color="#1D9E75" />} text={lugar.precio} />}
        </div>

        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 20 }}>
          {lugar.descripcion}
        </p>

        {lugar.direccion && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            marginBottom: 20, padding: '12px 14px',
            background: '#F9FAFB', borderRadius: 12
          }}>
            <MapPin size={16} color="#1D9E75" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
              {lugar.direccion}
            </span>
          </div>
        )}

        <div style={{ height: 1, background: '#F3F4F6', marginBottom: 20 }} />

        {resenas.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2E', marginBottom: 12 }}>
              Reseñas recientes
            </h3>
            {resenas.map((r, i) => (
              <div key={i} style={{
                padding: '12px 14px', background: '#F9FAFB',
                borderRadius: 12, marginBottom: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <img
                    src={r.profile_photo_url}
                    alt={r.author_name}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>
                      {r.author_name}
                    </p>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={10} color="#F5A623"
                          fill={j < r.rating ? '#F5A623' : 'none'} />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                  {r.text?.length > 150 ? r.text.slice(0, 150) + '...' : r.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botones fijos abajo */}
      <div style={{
        position: 'fixed', bottom: 64, left: 0, right: 0,
        background: 'white', padding: '12px 20px 16px',
        borderTop: '1px solid #F3F4F6',
        display: 'flex', gap: 10, zIndex: 50
      }}>
        {lugar.vrDisponible && (
          <button
            onClick={() => setMostrar360(true)}
            style={{
              flex: 1, height: 48, borderRadius: 12,
              border: '2px solid #1D9E75', background: 'white',
              color: '#1D9E75', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <Globe size={16} color="#1D9E75" />
            Ver 360°
          </button>
        )}
        <button
          onClick={abrirMaps}
          style={{
            flex: 2, height: 48, borderRadius: 12,
            border: 'none', background: '#1D9E75',
            color: 'white', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 6
          }}
        >
          <MapPin size={16} color="white" />
          Cómo llegar
        </button>
      </div>

      {/* Modal 360 */}
      {mostrar360 && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 200, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '52px 20px 16px'
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>
              Vista 360° — {lugar.nombre}
            </span>
            <button
              onClick={() => setMostrar360(false)}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                borderRadius: '50%', width: 36, height: 36,
                color: 'white', fontSize: 18, cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
          <iframe
            src={'https://www.google.com/maps/embed/v1/streetview?key=' + MAPS_KEY + '&location=' + lugar.lat + ',' + lugar.lng + '&heading=210&pitch=10&fov=80'}
            style={{ flex: 1, border: 'none' }}
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}