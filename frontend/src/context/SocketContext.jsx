import { useAuth } from '../hooks/useAuth'
import { io } from 'socket.io-client'
import { createContext, useState, useEffect, useCallback, useRef } from 'react'

export const SocketContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function SocketProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth()
  
  // Estados del contexto
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  
  // Refs para evitar problemas de stale closure en los listeners del socket
  const socketRef = useRef(null)
  const notificationsRef = useRef(notifications)
  
  // Actualizar el ref cada vez que cambian las notificaciones
  useEffect(() => {
    notificationsRef.current = notifications
  }, [notifications])

  /**
   * Conectar al servidor Socket.io cuando el usuario está autenticado
   */
  useEffect(() => {
    if (isAuthenticated && token && !socketRef.current) {
      console.log('🔌 Intentando conectar a Socket.io...')
      
      const newSocket = io(SOCKET_URL, {
        query: { token: token },    
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })
      
      socketRef.current = newSocket
      
      // Función helper para añadir notificaciones usando el ref actualizado
      const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 50))
      }
      
      // Eventos de conexión/desconexión
      newSocket.on('connect', () => {
        console.log('✅ Socket.io conectado:', newSocket.id)
        setIsConnected(true)
      })
      
      newSocket.on('disconnect', () => {
        console.log('❌ Socket.io desconectado')
        setIsConnected(false)
      })
      
      newSocket.on('connect_error', (error) => {
        console.error('⚠️ Error de conexión Socket.io:', error.message)
        setIsConnected(false)
      })
      
      newSocket.on('connection_success', (data) => {
        console.log('👋 Bienvenido, usuario ID:', data.user_id)
      })
      
      // ============================================================
      // LISTENERS DE EVENTOS DEL BACKEND
      // Usamos handleNewNotification para evitar referencias muertas
      // ============================================================
      
      newSocket.on('task:created', (data) => {
        console.log(' Nueva tarea creada:', data)
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
        console.log('✏️ Tarea actualizada:', data)
        handleNewNotification({
          type: 'task:updated',
          message: `Tarea "${data.task.title}" fue actualizada`,
          projectId: data.project_id,
          taskId: data.task.id,
          timestamp: data.timestamp,
          read: false
        })
      })
      
      newSocket.on('task:commented', (data) => {
        console.log('💬 Nuevo comentario:', data)
        handleNewNotification({
          type: 'task:commented',
          message: `Nuevo comentario en "${data.comment.content?.substring(0, 30)}..."`,
          projectId: data.project_id,
          taskId: data.task_id,
          commentId: data.comment.id,
          timestamp: data.timestamp,
          read: false
        })
      })
      
      newSocket.on('project:member_added', (data) => {
        console.log('👥 Miembro añadido:', data)
        handleNewNotification({
          type: 'project:member_added',
          message: data.message || 'Has sido añadido a un proyecto',
          projectId: data.project.id,
          timestamp: data.timestamp,
          read: false
        })
      })
      
      newSocket.on('project:member_removed', (data) => {
        console.log('🚪 Miembro eliminado:', data)
        handleNewNotification({
          type: 'project:member_removed',
          message: data.message || 'Has sido eliminado de un proyecto',
          projectId: data.project_id,
          timestamp: data.timestamp,
          read: false
        })
      })
      
      newSocket.on('task:assigned', (data) => {
        console.log('🎯 Tarea asignada:', data)
        handleNewNotification({
          type: 'task:assigned',
          message: data.message || `Se te ha asignado: ${data.task.title}`,
          projectId: data.project_id,
          taskId: data.task.id,
          timestamp: data.timestamp,
          read: false
        })
      })
      
      setSocket(newSocket)
      
      // Limpieza al desmontar o cambiar dependencias
      return () => {
        console.log('🔌 Desconectando Socket.io...')
        newSocket.off('connect')
        newSocket.off('disconnect')
        newSocket.off('connect_error')
        newSocket.off('connection_success')
        newSocket.off('task:created')
        newSocket.off('task:updated')
        newSocket.off('task:commented')
        newSocket.off('project:member_added')
        newSocket.off('project:member_removed')
        newSocket.off('task:assigned')
        newSocket.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
      }
    } else if (!isAuthenticated && socketRef.current) {
      console.log('🔌 Usuario no autenticado, desconectando Socket.io...')
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [isAuthenticated, token])

  // Funciones expuestas al contexto (ahora sí pueden estar después del useEffect)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50))
  }, [])

  const markAsRead = useCallback((index) => {
    setNotifications(prev => 
      prev.map((n, i) => i === index ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const joinProject = useCallback((projectId) => {
    if (socket && isConnected) {
      socket.emit('join_project', { project_id: projectId })
      console.log(`📁 Unido a la sala del proyecto ${projectId}`)
    }
  }, [socket, isConnected])

  const leaveProject = useCallback((projectId) => {
    if (socket && isConnected) {
      socket.emit('leave_project', { project_id: projectId })
      console.log(`🚪 Salido de la sala del proyecto ${projectId}`)
    }
  }, [socket, isConnected])

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
    leaveProject
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}