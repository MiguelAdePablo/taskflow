import { io } from 'socket.io-client'
import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'

export const SocketContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// ============================================================
// PROPÓSITO: Gestionar la conexión WebSocket global, eventos en tiempo real y notificaciones.
// CRÍTICO: Las funciones de manipulación de notificaciones (`markAsRead`, `removeNotification`) se han refactorizado para operar por `id` en lugar de por `índice` de array. Esto previene la eliminación o modificación de la notificación equivocada si el array muta entre el renderizado y la acción del usuario.
// ============================================================
export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth()
  
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  
  const socketRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated && token) {
      if (socketRef.current) return

      console.log('🔌 Intentando conectar a Socket.io...')
      const newSocket = io(SOCKET_URL, {
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 60000
      })
      
      socketRef.current = newSocket
      setSocket(newSocket)

      const handleNewNotification = (notification) => {
        setNotifications(prev => [{ ...notification, id: notification.id || Date.now().toString() }, ...prev].slice(0, 50))
      }

      newSocket.on('connect', () => {
        console.log('✅ Socket.io conectado:', newSocket.id)
        setIsConnected(true)
      })
      
      newSocket.on('disconnect', () => {
        console.log('❌ Socket.io desconectado (se reintentará automáticamente)')
        setIsConnected(false)
      })
      
      newSocket.on('connect_error', (error) => {
        console.error('⚠️ Error de conexión Socket.io:', error.message)
        if (error.message.includes('auth') || error.message.includes('token')) {
          console.log('🔌 Token inválido, deteniendo reintentos.')
          newSocket.disconnect()
          socketRef.current = null
          setSocket(null)
        }
      })
      
      newSocket.on('connection_success', (data) => {
        console.log('👋 Bienvenido, usuario ID:', data.user_id)
      })
      
      newSocket.on('task:created', (data) => {
        handleNewNotification({
          type: 'task:created',
          message: `Nueva tarea: ${data.task.title}`,
          projectId: data.project_id,
          taskId: data.task.id,
          timestamp: data.timestamp,
          read: false
        })
      })
      
      newSocket.on('task:updated', (data) => {
        let message = `Tarea "${data.task.title}" fue actualizada`
        if (data.updated_field === 'status') {
          const labels = { pending: 'Pendiente', in_progress: 'En progreso', completed: 'Completada' }
          message = `Tarea "${data.task.title}": Estado ${labels[data.new_value] || data.new_value}`
        } else if (data.updated_field === 'priority') {
          const labels = { low: 'Baja', medium: 'Media', high: 'Alta' }
          message = `Tarea "${data.task.title}": Prioridad ${labels[data.new_value] || data.new_value}`
        }
        handleNewNotification({
          type: 'task:updated',
          message,
          projectId: data.project_id,
          taskId: data.task.id,
          timestamp: data.timestamp,
          read: false
        })
      })
      
      newSocket.on('task:commented', (data) => {
        const contentPreview = data.comment.content ? data.comment.content.substring(0, 30) : 'Comentario'
        handleNewNotification({
          type: 'task:commented',
          message: `Nuevo comentario: "${contentPreview}${data.comment.content?.length > 30 ? '...' : ''}"`,
          projectId: data.project_id,
          taskId: data.task_id,
          commentId: data.comment.id,
          timestamp: data.timestamp,
          read: false
        })
      })

      return () => {
        // No desconectamos aquí para permitir reconexiones automáticas si el componente se desmonta temporalmente
      }

    } else if (!isAuthenticated && socketRef.current) {
      console.log('🔌 Usuario no autenticado, desconectando Socket.io...')
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
      setNotifications([])
    }
  }, [isAuthenticated, token])

  const addNotification = useCallback((n) => {
    setNotifications(prev => [{ ...n, id: n.id || Date.now().toString() }, ...prev].slice(0, 50))
  }, [])

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])
  
  const joinProject = useCallback((projectId) => {
    if (socketRef.current) { 
      socketRef.current.emit('join_project', { project_id: projectId })
    }
  }, [])
  
  const leaveProject = useCallback((projectId) => {
    if (socketRef.current) { 
      socketRef.current.emit('leave_project', { project_id: projectId })
    }
  }, [])

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Desconectando Socket.io de forma segura...')
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [])

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    joinProject,
    leaveProject,
    disconnectSocket
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}