import { useState, useRef, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'
import { useNavigate } from 'react-router-dom'

/**
 * ============================================================
 * COMPONENTE: NotificationBell
 * ============================================================
 * 
 * Muestra la campana de notificaciones con el contador de no leídas
 * y un desplegable con el historial de eventos en tiempo real.
 */
function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, markAsRead, removeNotification } = useSocket()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Cerrar el desplegable si se hace clic fuera de él
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
    markAsRead(notifications.indexOf(notification))
    setIsOpen(false)
    
    // Navegar según el tipo de notificación
    if (notification.taskId) {
      navigate(`/tasks/${notification.taskId}`)
    } else if (notification.projectId) {
      navigate(`/projects/${notification.projectId}`)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} min`
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Botón de la campana */}
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
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        🔔
        {/* Badge de no leídas */}
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

      {/* Desplegable de notificaciones */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: '0',
          top: '100%',
          marginTop: '0.5rem',
          width: '320px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          {/* Header del desplegable */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f9fafb'
          }}>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#111827' }}>
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

          {/* Lista de notificaciones */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                No tienes notificaciones nuevas
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={index}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: notif.read ? 'white' : '#eff6ff',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notif.read ? '#f9fafb' : '#dbeafe'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'white' : '#eff6ff'}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#111827', lineHeight: '1.4' }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  {/* Botón de eliminar individual */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeNotification(index)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '0.25rem'
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