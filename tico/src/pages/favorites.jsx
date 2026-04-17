import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/config'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { Heart, MapPin, Star, Clock, ArrowRight, Leaf, Camera, Utensils, Compass, Search } from 'lucide-react'

const CATEGORIA_META = {
  naturaleza:  { label: 'Naturaleza',  icon: Leaf,     color: '#16A34A', bg: '#DCFCE7' },
  cultura:     { label: 'Cultura',     icon: Camera,   color: '#7C3AED', bg: '#EDE9FE' },
  gastronomia: { label: 'Gastronomía', icon: Utensils, color: '#EA580C', bg: '#FFEDD5' },
  turismo:     { label: 'Turismo',     icon: Compass,  color: '#0369A1', bg: '#E0F2FE' },
}

export default function Favorites() {
  const navigate = useNavigate()
  const user = auth.currentUser

  const [lugaresFavs, setLugaresFavs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    cargar()
  }, [user])

  const cargar = async () => {
    try {
      const snap = await getDoc(doc(db, 'usuarios', user.uid))
      const favIds = snap.exists() ? (snap.data().favoritos || []) : []

      if (favIds.length === 0) { setLoading(false); return }

      const lugaresSnap = await getDocs(collection(db, 'lugares'))
      const todos = lugaresSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      setLugaresFavs(todos.filter(l => favIds.includes(l.id)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const categorias = ['Todos', ...new Set(lugaresFavs.map(l => l.categoria).filter(Boolean))]

  const filtrados = lugaresFavs.filter(l => {
    const matchQuery = !query || l.nombre?.toLowerCase().includes(query.toLowerCase())
    const matchCat = categoriaFiltro === 'Todos' || l.categoria === categoriaFiltro
    return matchQuery && matchCat
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F9FAFB' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E8F7F2', borderTopColor: '#EF4444', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', paddingBottom: 100, overflowY: 'auto' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(160deg, #7F1D1D 0%, #DC2626 60%, #EF4444 100%)',
        padding: '52px 20px 28px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Heart size={20} color="rgba(255,255,255,0.8)" fill="rgba(255,255,255,0.8)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Guardados
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
          Mis Favoritos
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
          {lugaresFavs.length === 0
            ? 'Aún no tienes lugares guardados'
            : `${lugaresFavs.length} lugar${lugaresFavs.length !== 1 ? 'es' : ''} guardado${lugaresFavs.length !== 1 ? 's' : ''}`}
        </p>

        {/* Buscador */}
        {lugaresFavs.length > 0 && (
          <div style={{
            marginTop: 16, display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            borderRadius: 999, padding: '10px 16px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Search size={16} color="rgba(255,255,255,0.7)" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar en favoritos..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent', fontSize: 14,
                color: 'white',
              }}
            />
          </div>
        )}
      </div>

      {lugaresFavs.length === 0 ? (
        /* Estado vacío */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '60px 32px', textAlign: 'center'
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
          }}>
            <Heart size={36} color="#EF4444" />
          </div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1A1A2E' }}>
            Sin favoritos aún
          </h3>
          <p style={{ margin: '8px 0 24px', fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
            Explora el mapa y toca el ❤️ en cualquier lugar para guardarlo aquí
          </p>
          <button
            onClick={() => navigate('/map')}
            style={{
              padding: '12px 28px', borderRadius: 999,
              background: '#EF4444', color: 'white',
              fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer'
            }}
          >
            Explorar el mapa
          </button>
        </div>
      ) : (
        <div style={{ padding: '20px 16px 0' }}>

          {/* Filtros de categoría */}
          {categorias.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  style={{
                    flexShrink: 0, padding: '7px 16px', borderRadius: 999,
                    fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: categoriaFiltro === cat ? '#EF4444' : 'white',
                    color: categoriaFiltro === cat ? 'white' : '#6B7280',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  {cat === 'Todos' ? 'Todos' : CATEGORIA_META[cat.toLowerCase()]?.label || cat}
                </button>
              ))}
            </div>
          )}

          {/* Lista */}
          {filtrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 14 }}>
              No hay resultados para "{query}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtrados.map((lugar, i) => {
                const meta = CATEGORIA_META[lugar.categoria?.toLowerCase()] || CATEGORIA_META.turismo
                const Icon = meta.icon
                return (
                  <div
                    key={lugar.id}
                    onClick={() => navigate(`/detail/${lugar.id}`, { state: { lugar } })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 18,
                      background: 'white', border: '1px solid #F3F4F6',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      animation: `fadeUp 0.4s ease both`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      width: 72, height: 72, borderRadius: 14, overflow: 'hidden',
                      flexShrink: 0, background: meta.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {lugar.foto ? (
                        <img src={lugar.foto} alt={lugar.nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Icon size={28} color={meta.color} strokeWidth={1.5} />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: meta.color,
                        textTransform: 'uppercase', letterSpacing: '0.4px'
                      }}>
                        {meta.label}
                      </span>
                      <h4 style={{
                        margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: '#1A1A2E',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {lugar.nombre}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                        {lugar.calificacion && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Star size={11} color="#F5A623" fill="#F5A623" />
                            <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{lugar.calificacion}</span>
                          </div>
                        )}
                        {lugar.horario && (
                          <>
                            <span style={{ color: '#D1D5DB', fontSize: 10 }}>•</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={10} color="#9CA3AF" />
                              <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{lugar.horario}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Heart + arrow */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <Heart size={16} color="#EF4444" fill="#EF4444" />
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#F0FBF7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ArrowRight size={13} color="#1D9E75" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}