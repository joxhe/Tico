import { useLocation, useNavigate } from 'react-router-dom'
import { Compass, Heart, Sparkles, User } from 'lucide-react'

const tabs = [
  { path: '/map',             icon: Compass,  label: 'Explorar',  public: true  },
  { path: '/favorites',       icon: Heart,    label: 'Favoritos', public: false },
  { path: '/recommendations', icon: Sparkles, label: 'Para ti',   public: false },
  { path: '/profile',         icon: User,     label: 'Perfil',    public: false },
]

export default function Navbar({ user, onRequireAuth }) {
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  const handleTabPress = (tab) => {
    if (!tab.public && !user) {
      onRequireAuth?.()
      return
    }
    navigate(tab.path)
  }

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
        const locked = !tab.public && !user

        const isFavTab  = tab.path === '/favorites'
        const iconColor = active
          ? (isFavTab ? '#EF4444' : '#1D9E75')
          : locked
            ? '#D1D5DB'
            : '#9CA3AF'

        return (
          <button
            key={tab.path}
            onClick={() => handleTabPress(tab)}
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
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 1.8}
              color={iconColor}
              fill={active && isFavTab ? '#EF4444' : 'none'}
            />
            {/* Candadito pequeño si está bloqueado */}
            {locked && (
              <span style={{
                position: 'absolute',
                top: 8,
                right: 'calc(50% - 16px)',
                fontSize: 8,
                lineHeight: 1,
                color: '#9CA3AF'
              }}>
                🔒
              </span>
            )}
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: iconColor
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}