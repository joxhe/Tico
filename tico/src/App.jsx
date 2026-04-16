import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import MapScreen from './pages/MapScreen'
import Detail from './pages/Detail'
import Recommendations from './pages/Recommendations'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'

function AppContent() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/login'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MapScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/profile" element={<Profile />} />
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