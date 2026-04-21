import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/config'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import {
  Sparkles, MapPin, Star, Clock, ArrowRight, Heart,
  Compass, Flame, Leaf, Camera, Utensils, Target
} from 'lucide-react'

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORIA_META = {
  naturaleza:  { label: 'Naturaleza',  icon: Leaf,     color: '#16A34A', bg: '#DCFCE7' },
  cultura:     { label: 'Cultura',     icon: Camera,   color: '#7C3AED', bg: '#EDE9FE' },
  gastronomia: { label: 'Gastronomía', icon: Utensils, color: '#EA580C', bg: '#FFEDD5' },
  turismo:     { label: 'Turismo',     icon: Compass,  color: '#0369A1', bg: '#E0F2FE' },
}

// ✅ Mapa: interés del perfil → categoría de lugar (alineado con MapScreen)
const INTERES_A_CATEGORIA = {
  'naturaleza':   'naturaleza',
  'gastronomía':  'gastronomia',
  'gastronomia':  'gastronomia',
  'cultura':      'cultura',
  'turismo':      'turismo',
}

// ─── Scoring dinámico ─────────────────────────────────────────────────────────
/**
 * Calcula un score para ordenar las recomendaciones.
 * - +3 si la categoría del lugar coincide con un interés del usuario
 * - +1 por cada punto de calificación (normalizado)
 * - Pequeño boost aleatorio para no mostrar siempre el mismo orden
 */
function calcularScore(lugar, intereses) {
  const cat = (lugar.categoria || '').toLowerCase()
  const categoriasDeInteres = intereses.map(i => INTERES_A_CATEGORIA[i.toLowerCase()]).filter(Boolean)

  const matchInteres = categoriasDeInteres.includes(cat) ? 3 : 0
  const scoreCalif = lugar.calificacion || 4
  const jitter = Math.random() * 0.3 // pequeña variación para no repetir siempre

  return matchInteres + scoreCalif + jitter
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function HeroCard({ lugar, index, navigate, esFav }) {
  const [hovered, setHovered] = useState(false)
  const meta = CATEGORIA_META[lugar.categoria?.toLowerCase()] || CATEGORIA_META.turismo
  const Icon = meta.icon

  return (
    <div
      onClick={() => navigate(`/detail/${lugar.id}`, { state: { lugar } })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 24, overflow: 'hidden',
        height: 220, cursor: 'pointer', flexShrink: 0,
        width: '85vw', maxWidth: 340,
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.3s cubic-bezier(.34,1.56,.64,1)',
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.25)' : '0 8px 24px rgba(0,0,0,0.15)',
        animation: `fadeSlideIn 0.5s ease both`,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {lugar.foto ? (
        <img src={lugar.foto} alt={lugar.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: `linear-gradient(135deg, ${meta.bg} 0%, ${meta.color}22 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={48} color={meta.color} strokeWidth={1.5} />
        </div>
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)'
      }} />

      {/* Badge categoría */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999, padding: '4px 10px',
      }}>
        <Icon size={11} color="white" />
        <span style={{ fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {meta.label}
        </span>
      </div>

      {/* Favorito badge */}
      {esFav && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: '#EF4444', borderRadius: 999, padding: '4px 10px',
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          <Heart size={10} color="white" fill="white" />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>Favorito</span>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px' }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
          {lugar.nombre}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={12} color="#F5A623" fill="#F5A623" />
            <span style={{ fontSize: 12, color: 'white', fontWeight: 700 }}>{lugar.calificacion || '—'}</span>
          </div>
          {lugar.distancia && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <MapPin size={10} color="rgba(255,255,255,0.7)" />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{lugar.distancia}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ListCard({ lugar, index, navigate, esFav }) {
  const [pressed, setPressed] = useState(false)
  const meta = CATEGORIA_META[lugar.categoria?.toLowerCase()] || CATEGORIA_META.turismo
  const Icon = meta.icon

  return (
    <div
      onClick={() => navigate(`/detail/${lugar.id}`, { state: { lugar } })}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 18,
        background: 'white', border: '1px solid #F3F4F6',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.15s, box-shadow 0.2s',
        boxShadow: pressed ? '0 2px 8px rgba(0,0,0,0.08)' : '0 4px 16px rgba(0,0,0,0.06)',
        animation: `fadeSlideUp 0.45s ease both`,
        animationDelay: `${index * 0.06}s`,
      }}
    >
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {meta.label}
          </span>
          {esFav && <Heart size={10} color="#EF4444" fill="#EF4444" />}
        </div>
        <h4 style={{
          margin: 0, fontSize: 15, fontWeight: 700, color: '#1A1A2E',
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
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{lugar.horario}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: '#F0FBF7',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <ArrowRight size={15} color="#1D9E75" />
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle, color = '#1D9E75' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12, background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A1A2E' }}>{title}</h2>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9CA3AF' }}>{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Recommendations() {
  const navigate = useNavigate()
  const user = auth.currentUser

  const [intereses, setIntereses] = useState([])
  const [favoritos, setFavoritos] = useState([])
  const [lugares, setLugares] = useState([])
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    async function cargar() {
      try {
        if (user) {
          setNombre(user.displayName?.split(' ')[0] || 'viajero')
          const snap = await getDoc(doc(db, 'usuarios', user.uid))
          if (snap.exists()) {
            setIntereses(snap.data().intereses || [])
            setFavoritos(snap.data().favoritos || [])
          }
        }
        const lugaresSnap = await getDocs(collection(db, 'lugares'))
        const data = lugaresSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setLugares(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [user])

  // ── Secciones calculadas dinámicamente ──
  
  // 1. "Para ti": ordenado por score de intereses del usuario
  const paraTi = [...lugares]
    .sort((a, b) => calcularScore(b, intereses) - calcularScore(a, intereses))
    .slice(0, 6)

  // 2. Tendencias: top por calificación
  const tendencias = [...lugares]
    .sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0))
    .slice(0, 4)

  // 3. Por explorar: no marcados como favorito, priorizando categorías de interés
  const porExplorar = [...lugares]
    .filter(l => !favoritos.includes(l.id))
    .sort((a, b) => calcularScore(b, intereses) - calcularScore(a, intereses))
    .slice(0, 4)

  // Categorías con intereses activos del usuario (para mostrar chips con color)
  const categoriasActivas = [...new Set(
    intereses.map(i => INTERES_A_CATEGORIA[i.toLowerCase()]).filter(Boolean)
  )]

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#F9FAFB' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #E8F7F2', borderTopColor: '#1D9E75', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>Preparando tus recomendaciones…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', paddingBottom: 100, overflowY: 'auto' }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(160deg, #0F4C35 0%, #1D9E75 60%, #22C55E 100%)',
        padding: '52px 20px 28px',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Sparkles size={20} color="rgba(255,255,255,0.8)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Para ti
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
          Hola, {nombre} 👋
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
          {intereses.length > 0
            ? `Basado en tus intereses: ${intereses.slice(0, 3).join(', ')}`
            : 'Descubre los mejores lugares de Montería'}
        </p>

        {/* Chips de intereses */}
        {intereses.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {intereses.map(i => {
              const cat = INTERES_A_CATEGORIA[i.toLowerCase()]
              const meta = cat ? CATEGORIA_META[cat] : null
              return (
                <span key={i} style={{
                  padding: '4px 12px', borderRadius: 999,
                  background: meta ? meta.color + '30' : 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${meta ? meta.color + '50' : 'rgba(255,255,255,0.2)'}`,
                  fontSize: 11, fontWeight: 700, color: 'white'
                }}>
                  {i}
                </span>
              )
            })}
          </div>
        )}

        {/* Aviso si no tiene intereses */}
        {intereses.length === 0 && (
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <Target size={16} color="rgba(255,255,255,0.8)" />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
              Configura tus intereses en el perfil para recomendaciones personalizadas
            </span>
          </div>
        )}
      </div>

      <div style={{ paddingTop: 24 }}>

        {/* ── Sección 1: Para ti (scroll horizontal) ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ padding: '0 20px' }}>
            <SectionHeader
              icon={Sparkles}
              title={intereses.length > 0 ? 'Recomendados para ti' : 'Lugares destacados'}
              subtitle={
                intereses.length > 0
                  ? `Seleccionados según tus intereses en ${categoriasActivas.map(c => CATEGORIA_META[c]?.label).join(', ')}`
                  : 'Los mejores lugares de Montería'
              }
            />
          </div>
          <div
            ref={scrollRef}
            style={{
              display: 'flex', gap: 14, overflowX: 'auto',
              paddingLeft: 20, paddingRight: 20, paddingBottom: 8,
              scrollbarWidth: 'none', msOverflowStyle: 'none',
            }}
          >
            {paraTi.map((lugar, i) => (
              <HeroCard
                key={lugar.id}
                lugar={lugar}
                index={i}
                navigate={navigate}
                esFav={favoritos.includes(lugar.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Sección 2: Tendencias ── */}
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <SectionHeader
            icon={Flame}
            title="Trending en Montería"
            subtitle="Los más visitados y mejor calificados"
            color="#EA580C"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tendencias.map((lugar, i) => (
              <ListCard
                key={lugar.id}
                lugar={lugar}
                index={i}
                navigate={navigate}
                esFav={favoritos.includes(lugar.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Sección 3: Por explorar (sin favoritos) ── */}
        {porExplorar.length > 0 && (
          <div style={{ padding: '0 20px', marginBottom: 32 }}>
            <SectionHeader
              icon={Compass}
              title="Por explorar"
              subtitle={
                intereses.length > 0
                  ? 'Lugares que te pueden gustar y aún no has guardado'
                  : 'Lugares que aún no has marcado como favorito'
              }
              color="#7C3AED"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {porExplorar.map((lugar, i) => (
                <ListCard
                  key={lugar.id}
                  lugar={lugar}
                  index={i}
                  navigate={navigate}
                  esFav={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── CTA: Actualizar intereses ── */}
        <div style={{ padding: '0 20px' }}>
          <div
            style={{
              borderRadius: 20,
              background: intereses.length > 0
                ? 'linear-gradient(135deg, #0F4C35 0%, #1D9E75 100%)'
                : 'linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%)',
              padding: '20px',
              display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
            }}
            onClick={() => navigate('/profile')}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {intereses.length > 0
                ? <Heart size={22} color="white" />
                : <Target size={22} color="white" />
              }
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'white' }}>
                {intereses.length > 0 ? 'Mejora tus recomendaciones' : 'Personaliza tu experiencia'}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                {intereses.length > 0
                  ? 'Actualiza tus intereses en el perfil'
                  : 'Agrega tus intereses para recomendaciones a medida'}
              </p>
            </div>
            <ArrowRight size={18} color="white" />
          </div>
        </div>

      </div>
    </div>
  )
}