import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/config'
import { signOut, updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { lugares } from '../data/lugares'
import {
  User, MapPin, Phone, Heart, HelpCircle,
  ChevronDown, ChevronUp, Target, LogOut, Pencil, Bell
} from 'lucide-react'

const INTERESES = ['Naturaleza', 'Gastronomía', 'Cultura', 'Historia', 'Aventura', 'Fotografía']

export default function Profile() {
  const navigate = useNavigate()
  const user = auth.currentUser

  const [openSection, setOpenSection] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [nombre, setNombre] = useState(user?.displayName || '')
  const [ciudad, setCiudad] = useState('')
  const [telefono, setTelefono] = useState('')
  const [intereses, setIntereses] = useState([])
  const [favoritos, setFavoritos] = useState([])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const cargarPerfil = async () => {
      const ref = doc(db, 'usuarios', user.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        setCiudad(data.ciudad || '')
        setTelefono(data.telefono || '')
        setIntereses(data.intereses || [])
        setFavoritos(data.favoritos || [])
      }
    }
    cargarPerfil()
  }, [user])

  const toggleSeccion = (sec) => setOpenSection(openSection === sec ? null : sec)

  const toggleInteres = (interes) => {
    setIntereses(prev =>
      prev.includes(interes) ? prev.filter(i => i !== interes) : [...prev, interes]
    )
  }

  const guardarPerfil = async () => {
    setLoading(true)
    try {
      await updateProfile(user, { displayName: nombre })
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre, ciudad, telefono, intereses, favoritos,
        email: user.email,
        updatedAt: new Date()
      }, { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const cerrarSesion = async () => {
    await signOut(auth)
    window.location.href = '/login'
  }

  const lugarsFavoritos = lugares.filter(l => favoritos.includes(l.id))

  const secciones = [
    {
      id: 'perfil',
      icon: <User size={18} color="#1D9E75" />,
      label: 'Información personal',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          <div>
            <label style={labelStyle}>Nombre completo</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <input value={user?.email || ''} disabled
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label style={labelStyle}>Ciudad</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} color="#9CA3AF"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={ciudad} onChange={e => setCiudad(e.target.value)}
                placeholder="Ej: Montería"
                style={{ ...inputStyle, paddingLeft: 36 }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} color="#9CA3AF"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={telefono} onChange={e => setTelefono(e.target.value)}
                placeholder="Ej: 300 123 4567" type="tel"
                style={{ ...inputStyle, paddingLeft: 36 }} />
            </div>
          </div>
          <button onClick={guardarPerfil} disabled={loading} style={btnGuardarStyle}>
            {loading ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>
      )
    },
    {
      id: 'intereses',
      icon: <Target size={18} color="#1D9E75" />,
      label: 'Mis intereses',
      content: (
        <div style={{ paddingTop: 4 }}>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 12, marginTop: 0 }}>
            Selecciona tus intereses para recibir mejores recomendaciones
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INTERESES.map(i => (
              <button key={i} onClick={() => toggleInteres(i)} style={{
                padding: '8px 16px', borderRadius: 999,
                border: intereses.includes(i) ? '2px solid #1D9E75' : '2px solid #E5E7EB',
                background: intereses.includes(i) ? '#E8F7F2' : 'white',
                color: intereses.includes(i) ? '#1D9E75' : '#6B7280',
                fontWeight: 600, fontSize: 13, cursor: 'pointer'
              }}>
                {i}
              </button>
            ))}
          </div>
          <button onClick={guardarPerfil} disabled={loading}
            style={{ ...btnGuardarStyle, marginTop: 16 }}>
            {loading ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      )
    },
    {
      id: 'favoritos',
      icon: <Heart size={18} color="#1D9E75" />,
      label: `Mis favoritos (${lugarsFavoritos.length})`,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
          {lugarsFavoritos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#9CA3AF' }}>
              <Heart size={32} color="#E5E7EB" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, margin: 0 }}>Aún no tienes favoritos</p>
              <p style={{ fontSize: 12, margin: '4px 0 0' }}>Explora el mapa y guarda los lugares que te gusten</p>
            </div>
          ) : (
            lugarsFavoritos.map(lugar => (
              <div key={lugar.id} onClick={() => navigate(`/detail/${lugar.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 12,
                  border: '1px solid #F3F4F6', cursor: 'pointer', background: '#FAFAFA'
                }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, background: '#E8F7F2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <MapPin size={18} color="#1D9E75" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E', margin: 0 }}>
                    {lugar.nombre}
                  </p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                    {lugar.categoria} · {lugar.distancia}
                  </p>
                </div>
                <ChevronDown size={16} color="#D1D5DB" style={{ transform: 'rotate(-90deg)' }} />
              </div>
            ))
          )}
        </div>
      )
    },
    {
      id: 'notificaciones',
      icon: <Bell size={18} color="#1D9E75" />,
      label: 'Notificaciones',
      content: (
        <div style={{ paddingTop: 4 }}>
          {[
            { label: 'Nuevos lugares cerca de ti', desc: 'Te avisamos cuando haya lugares nuevos' },
            { label: 'Eventos en Montería', desc: 'Festivales, ferias y eventos locales' },
            { label: 'Recomendaciones semanales', desc: 'Un resumen de lugares para ti' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0',
              borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none'
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>{item.desc}</p>
              </div>
              <div style={{
                width: 44, height: 24, borderRadius: 999,
                background: '#1D9E75',
                display: 'flex', alignItems: 'center',
                padding: '0 3px', cursor: 'pointer', flexShrink: 0
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'white', marginLeft: 'auto'
                }} />
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'ayuda',
      icon: <HelpCircle size={18} color="#1D9E75" />,
      label: 'Ayuda y soporte',
      content: (
        <div style={{ paddingTop: 4 }}>
          {['Preguntas frecuentes', 'Reportar un problema', 'Términos y condiciones', 'Política de privacidad'].map((item, i, arr) => (
            <div key={item} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 0',
              borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>{item}</span>
              <ChevronDown size={16} color="#D1D5DB" style={{ transform: 'rotate(-90deg)' }} />
            </div>
          ))}
        </div>
      )
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', paddingBottom: 80, overflowY: 'auto' }}>

      {/* Header minimalista */}
      <div style={{
        background: 'white',
        padding: '52px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        borderBottom: '1px solid #F3F4F6'
      }}>

        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 104, height: 104, borderRadius: '50%',
            background: '#F3F4F6',
            border: '3px solid #E8F7F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {user?.photoURL
              ? <img src={user.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
              : <User size={38} color="#9CA3AF" />
            }
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: '50%',
            background: '#1D9E75', border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            <Pencil size={11} color="white" />
          </div>
        </div>

        {/* Nombre y correo */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: '#1A1A2E', margin: 0 }}>
            {user?.displayName || 'Usuario'}
          </h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: '4px 0 0' }}>
            {user?.email}
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 0,
          background: '#F9FAFB',
          borderRadius: 14, padding: '12px 0',
          width: '100%', marginTop: 4
        }}>
          <div style={statStyle}>
            <span style={{ fontWeight: 800, fontSize: 22, color: '#1D9E75' }}>{lugarsFavoritos.length}</span>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Favoritos</span>
          </div>
          <div style={{ width: 1, background: '#E5E7EB' }} />
          <div style={statStyle}>
            <span style={{ fontWeight: 800, fontSize: 22, color: '#1D9E75' }}>{intereses.length}</span>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Intereses</span>
          </div>
        </div>
      </div>

      {/* Secciones acordeón */}
      <div style={{ padding: '16px 16px 0' }}>
        {secciones.map((sec, idx) => (
          <div key={sec.id} style={{
            background: 'white',
            borderRadius: 14,
            marginBottom: 8,
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            border: '1px solid #F3F4F6'
          }}>
            <button onClick={() => toggleSeccion(sec.id)} style={{
              width: '100%', padding: '15px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'none', border: 'none', cursor: 'pointer'
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, background: '#F0FBF7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {sec.icon}
              </div>
              <span style={{ flex: 1, textAlign: 'left', fontWeight: 600, fontSize: 14, color: '#1A1A2E' }}>
                {sec.label}
              </span>
              {openSection === sec.id
                ? <ChevronUp size={16} color="#9CA3AF" />
                : <ChevronDown size={16} color="#9CA3AF" />
              }
            </button>

            {openSection === sec.id && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F9FAFB' }}>
                {sec.content}
              </div>
            )}
          </div>
        ))}

        {/* Cerrar sesión */}
        <button onClick={cerrarSesion} style={{
          width: '100%', padding: '15px', borderRadius: 14,
          border: '1px solid #FEE2E2', background: 'white',
          color: '#EF4444', fontWeight: 700, fontSize: 14,
          cursor: 'pointer', marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          <LogOut size={16} color="#EF4444" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#9CA3AF', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.5px'
}

const inputStyle = {
  width: '100%', height: 44, borderRadius: 10,
  border: '1.5px solid #E5E7EB', padding: '0 14px',
  fontSize: 14, color: '#1A1A2E', outline: 'none',
  boxSizing: 'border-box', background: '#FAFAFA'
}

const btnGuardarStyle = {
  width: '100%', height: 44, borderRadius: 10,
  background: '#1D9E75', color: 'white',
  fontWeight: 700, fontSize: 14, border: 'none',
  cursor: 'pointer'
}

const statStyle = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: 3, flex: 1
}