import { useLocation, useNavigate } from 'react-router-dom'
import { Compass, Heart, Sparkles, User } from 'lucide-react'

const tabs = [
  { path: '/map',             icon: Compass,  label: 'Explorar'  },
  { path: '/favorites',       icon: Heart,    label: 'Favoritos' },
  { path: '/recommendations', icon: Sparkles, label: 'Para ti'   },
  { path: '/profile',         icon: User,     label: 'Perfil'    },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'white',
      borderTop: '1px solid #F3F4F6',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 8px)'
    }}>
      {tabs.map(tab => {
        const active = pathname === tab.path
        const Icon   = tab.icon
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '12px',
              paddingBottom: '4px',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 1.8}
              color={active ? '#1D9E75' : '#9CA3AF'}
            />
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: active ? '#1D9E75' : '#9CA3AF'
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}