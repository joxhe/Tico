import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/login'
import MapScreen from './pages/MapScreen'
import Detail from './pages/Detail'
import Recommendations from './pages/Recommendations'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase/config'

function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth)
  if (loading) return null
  return user ? children : <Navigate to="/login" />
}

function AppContent() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/login'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/map" element={<PrivateRoute><MapScreen /></PrivateRoute>} />
          <Route path="/detail/:id" element={<PrivateRoute><Detail /></PrivateRoute>} />
          <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </div>
      {!hideNavbar && <Navbar />}
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