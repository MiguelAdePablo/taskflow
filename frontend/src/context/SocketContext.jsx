import { io } from 'socket.io-client'
import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'

export const SocketContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function SocketProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth()
  
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  
  const socketRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated && token) {
      if (socketRef.current) return

      console.log('🔌 Intentando conectar a Socket.io...')
      const newSocket = io(SOCKET_URL, {
        query: { token: token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      })
      
      socketRef.current = newSocket
      setSocket(newSocket)

      const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50))
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
      
      // Listeners de eventos
      newSocket.on('task:created', (data) => {
        console.log('📥 [Socket] Evento recibido: task:created', data)
        handleNewNotification({
          type: 'task:created', message: `Nueva tarea: ${data.task.title}`,
          projectId: data.project_id, taskId: data.task.id, timestamp: data.timestamp, read: false
        })
      })
      
      // ✅ LISTENER MEJORADO: Mensaje dinámico según el campo actualizado
      newSocket.on('task:updated', (data) => {
        console.log('📥 [Socket] Evento recibido: task:updated', data)
        
        let message = `Tarea "${data.task.title}" fue actualizada`
        
        if (data.updated_field === 'status') {
          const statusLabels = { 
            pending: 'Pendiente', 
            in_progress: 'En progreso', 
            completed: 'Completada' 
          }
          const label = statusLabels[data.new_value] || data.new_value
          message = `Tarea "${data.task.title}": Estado ${label}`
          
        } else if (data.updated_field === 'priority') {
          const priorityLabels = { 
            low: 'Baja', 
            medium: 'Media', 
            high: 'Alta' 
          }
          const label = priorityLabels[data.new_value] || data.new_value
          message = `Tarea "${data.task.title}": Prioridad ${label}`
        }

        handleNewNotification({
          type: 'task:updated', 
          message: message,
          projectId: data.project_id, 
          taskId: data.task.id, 
          timestamp: data.timestamp, 
          read: false
        })
      })
      
      newSocket.on('task:commented', (data) => {
        console.log('📥 [Socket] Evento recibido: task:commented', data)
        handleNewNotification({
          type: 'task:commented', message: `Nuevo comentario en "${data.comment.content?.substring(0, 30)}..."`,
          projectId: data.project_id, taskId: data.task_id, commentId: data.comment.id, timestamp: data.timestamp, read: false
        })
      })
      
      newSocket.on('project:member_added', (data) => {
        handleNewNotification({
          type: 'project:member_added', message: data.message || 'Has sido añadido a un proyecto',
          projectId: data.project.id, timestamp: data.timestamp, read: false
        })
      })
      
      newSocket.on('project:member_removed', (data) => {
        handleNewNotification({
          type: 'project:member_removed', message: data.message || 'Has sido eliminado de un proyecto',
          projectId: data.project_id, timestamp: data.timestamp, read: false
        })
      })
      
      newSocket.on('task:assigned', (data) => {
        handleNewNotification({
          type: 'task:assigned', message: data.message || `Se te ha asignado: ${data.task.title}`,
          projectId: data.project_id, taskId: data.task.id, timestamp: data.timestamp, read: false
        })
      })

      return () => {
        // Limpieza controlada al desmontar
      }

    } else if (!isAuthenticated && socketRef.current) {
      console.log('🔌 Usuario no autenticado, desconectando Socket.io...')
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [isAuthenticated, token])

  const addNotification = useCallback((n) => setNotifications(p => [n, ...p].slice(0, 50)), [])
  const markAsRead = useCallback((i) => setNotifications(p => p.map((n, idx) => idx === i ? {...n, read: true} : n)), [])
  const markAllAsRead = useCallback(() => setNotifications(p => p.map(n => ({...n, read: true}))), [])
  const removeNotification = useCallback((i) => setNotifications(p => p.filter((_, idx) => idx !== i)), [])
  const clearNotifications = useCallback(() => setNotifications([]), [])
  
  const joinProject = useCallback((pid) => {
    if (socket && isConnected) { 
      socket.emit('join_project', { project_id: pid })
      console.log(`📁 Unido a sala project_${pid}`) 
    }
  }, [socket, isConnected])
  
  const leaveProject = useCallback((pid) => {
    if (socket && isConnected) { 
      socket.emit('leave_project', { project_id: pid })
      console.log(`🚪 Salido de sala project_${pid}`) 
    }
  }, [socket, isConnected])

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
    socket, isConnected, notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification, markAsRead, markAllAsRead, removeNotification, clearNotifications,
    joinProject, leaveProject, disconnectSocket
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}