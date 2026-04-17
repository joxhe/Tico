import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { auth, provider } from '../firebase/config'

function TicoLogo() {
  return (
    <svg width="140" height="70" viewBox="0 0 400 200" style={{ display: 'block' }}>
      <path
        d="M20 150 C80 60 140 130 200 100 C260 70 320 20 380 55"
        fill="none"
        stroke="white"
        strokeWidth="28"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="150" r="18" fill="white" />
      <circle cx="380" cy="55" r="18" fill="#F5A623" />
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [nombre, setNombre]         = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const handleGoogle = async () => {
    setError('')
    try {
      await signInWithPopup(auth, provider)
      navigate('/map')
    } catch (e) {
      setError('Error al iniciar sesión con Google')
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) { setError('Por favor completa todos los campos'); return }
    if (isRegister) {
      if (!nombre) { setError('Por favor ingresa tu nombre'); return }
      if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    }
    setLoading(true)
    try {
      if (isRegister) {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(result.user, { displayName: nombre })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/map')
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') setError('Este correo ya está registrado')
      else if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') setError('Correo o contraseña incorrectos')
      else if (e.code === 'auth/invalid-email') setError('Correo electrónico inválido')
      else setError('Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    height: '52px',
    borderRadius: '999px',
    padding: '0 20px',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

      {/* Foto de fondo */}
      <img
        src="/splash_bg.jpg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        alt="Río Sinú"
      />

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, transparent 0%, rgba(26,26,46,0.8) 35%, rgba(26,26,46,0.97) 100%)'
      }} />

      {/* Scroll container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 28px',
      }}>

        {/* Logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '80px',
          paddingBottom: '40px'
        }}>
          <TicoLogo />
          <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'white', letterSpacing: '12px', margin: 0 }}>TICO</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', fontWeight: 300, margin: 0 }}>Descubre Montería</p>
        </div>

        {/* Formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '40px' }}>

          {/* Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '999px',
            padding: '4px',
            marginBottom: '4px'
          }}>
            <button
              onClick={() => { setIsRegister(false); setError('') }}
              style={{
                flex: 1, padding: '10px', borderRadius: '999px', border: 'none',
                cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                background: !isRegister ? 'white' : 'transparent',
                color: !isRegister ? '#1A1A2E' : 'rgba(255,255,255,0.6)',
              }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setIsRegister(true); setError('') }}
              style={{
                flex: 1, padding: '10px', borderRadius: '999px', border: 'none',
                cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                background: isRegister ? 'white' : 'transparent',
                color: isRegister ? '#1A1A2E' : 'rgba(255,255,255,0.6)',
              }}
            >
              Registrarse
            </button>
          </div>

          {isRegister && (
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              style={inputStyle}
            />
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />

          {isRegister && (
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          )}

          {error && (
            <p style={{ color: '#FF6B6B', fontSize: '13px', textAlign: 'center', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', height: '52px', borderRadius: '999px',
              border: 'none', background: '#1D9E75', color: 'white',
              fontWeight: 700, fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>o continúa con</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
          </div>

          <button
            onClick={handleGoogle}
            style={{
              width: '100%', height: '52px', borderRadius: '999px',
              border: 'none', background: 'white', color: '#1A1A2E',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#4285F4' }}>G</span>
            Iniciar sesión con Google
          </button>

        </div>
      </div>
    </div>
  )
}