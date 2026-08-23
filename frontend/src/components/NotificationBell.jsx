import { useState, useRef, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'
import { useNavigate } from 'react-router-dom'

// ============================================================
// PROPÓSITO: Formatear la diferencia de tiempo de una marca temporal.
// CRÍTICO: Se extrae fuera del componente para evitar su recreación en cada renderizado, mejorando el rendimiento.
// ============================================================
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000)
  
  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins} min`
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// ============================================================
// PROPÓSITO: Mostrar campana de notificaciones con contador y desplegable de eventos en tiempo real.
// CRÍTICO: Se corrige el anti-patrón de usar `indexOf` para identificar notificaciones. Se pasa el `id` único a las funciones del contexto para evitar errores de eliminación/lectura si el array muta o tiene objetos duplicados.
// ============================================================
function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, markAsRead, removeNotification } = useSocket()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification) => {
    if (notification.id) markAsRead(notification.id)
    setIsOpen(false)
    
    if (notification.taskId) {
      navigate(`/tasks/${notification.taskId}`)
    } else if (notification.projectId) {
      navigate(`/projects/${notification.projectId}`)
    }
  }

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && unreadCount > 0) markAllAsRead()
        }}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '50%',
          transition: 'background 0.2s',
          fontSize: '1.5rem'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg, #f3f4f6)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: '0',
          top: '100%',
          marginTop: '0.5rem',
          width: '320px',
          backgroundColor: 'var(--bg-primary, white)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: '1px solid var(--border-color, #e5e7eb)',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--border-color, #e5e7eb)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary, #f9fafb)'
          }}>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary, #111827)' }}>
              Notificaciones
            </span>
            {notifications.length > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{ fontSize: '0.8rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Marcar todo como leído
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary, #6b7280)', fontSize: '0.9rem' }}>
                No tienes notificaciones nuevas
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id || notif.timestamp}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-color, #f3f4f6)',
                    backgroundColor: notif.read ? 'var(--bg-primary, white)' : 'var(--bg-unread, #eff6ff)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'var(--bg-secondary, #f9fafb)' : 'var(--bg-unread-hover, #dbeafe)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'var(--bg-primary, white)' : 'var(--bg-unread, #eff6ff)'}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary, #111827)', lineHeight: '1.4' }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #6b7280)', marginTop: '0.25rem', display: 'block' }}>
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (notif.id) removeNotification(notif.id)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0.25rem',
                      lineHeight: '1'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell