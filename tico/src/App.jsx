import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/login'
import MapScreen from './pages/MapScreen'
import Detail from './pages/Detail'
import Recommendations from './pages/Recommendations'
import Profile from './pages/Profile'
import Favorites from './pages/favorites'
import Navbar from './components/Navbar'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase/config'

// Modal de invitación a login
function LoginInviteModal({ onClose, onLogin }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '28px 28px 0 0',
          padding: '32px 28px 48px',
          width: '100%',
          maxWidth: 480,
          animation: 'slideUp 0.35s cubic-bezier(.34,1.56,.64,1)'
        }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB', margin: '0 auto 24px' }} />

        {/* Ícono */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #E8F7F2, #D1FAE5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <span style={{ fontSize: 28 }}>🗺️</span>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px' }}>
          ¡Inicia sesión para continuar!
        </h2>
        <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', margin: '0 0 28px', lineHeight: 1.6 }}>
          Guarda tus lugares favoritos, obtén recomendaciones personalizadas y mucho más.
        </p>

        <button
          onClick={onLogin}
          style={{
            width: '100%', height: 52, borderRadius: 999,
            background: '#1D9E75', color: 'white',
            fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer',
            marginBottom: 12
          }}
        >
          Iniciar sesión
        </button>
        <button
          onClick={onClose}
          style={{
            width: '100%', height: 48, borderRadius: 999,
            background: 'transparent', color: '#9CA3AF',
            fontWeight: 600, fontSize: 14, border: '1.5px solid #E5E7EB', cursor: 'pointer'
          }}
        >
          Seguir explorando
        </button>
      </div>
    </div>
  )
}

// Rutas que requieren autenticación
function PrivateRoute({ children, user, loading, onRequireAuth }) {
  if (loading) return null
  if (!user) {
    // Muestra modal y redirige al mapa
    onRequireAuth()
    return <Navigate to="/map" replace />
  }
  return children
}

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, loading] = useAuthState(auth)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const hideNavbar = location.pathname === '/login'

  const handleRequireAuth = () => {
    setShowLoginModal(true)
  }

  const handleGoLogin = () => {
    setShowLoginModal(false)
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {showLoginModal && (
        <LoginInviteModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleGoLogin}
        />
      )}

      <div style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/map" element={<MapScreen onRequireAuth={handleRequireAuth} />} />
          <Route path="/detail/:id" element={<Detail onRequireAuth={handleRequireAuth} />} />

          {/* Rutas privadas */}
          <Route
            path="/recommendations"
            element={
              <PrivateRoute user={user} loading={loading} onRequireAuth={handleRequireAuth}>
                <Recommendations />
              </PrivateRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <PrivateRoute user={user} loading={loading} onRequireAuth={handleRequireAuth}>
                <Favorites />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute user={user} loading={loading} onRequireAuth={handleRequireAuth}>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      {!hideNavbar && (
        <Navbar
          user={user}
          onRequireAuth={handleRequireAuth}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}