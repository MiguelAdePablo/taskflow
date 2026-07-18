import { createContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // ✅ CORRECCIÓN 1: Inicializar el token directamente desde localStorage
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // ✅ CORRECCIÓN 2: isAuthenticated depende del token, no de user
  const isAuthenticated = !!token

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('token')
      
      if (!savedToken) {
        setLoading(false)
        return
      }
      
      try {
        // Intentamos obtener los datos del usuario
        const data = await authService.getCurrentUser()
        setUser(data.user)
      } catch (error) {
        console.error('Error verificando token:', error)
        
        // ✅ CORRECCIÓN 3: SOLO borramos todo si el servidor dice explícitamente "401 No autorizado"
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        } else {
          // Si es un error de red (Network Error) o 500, NO hacemos nada.
          // El token sigue en el estado y en localStorage, por lo que 
          // isAuthenticated sigue siendo true y el usuario no es expulsado.
          console.warn('Backend no disponible, manteniendo sesión localmente.')
        }
      } finally {
        setLoading(false)
      }
    }
    
    verifyToken()
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password)
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const register = useCallback(async (username, email, password, full_name) => {
    try {
      const userData = { username, email, password, full_name: full_name || undefined }
      await authService.register(userData)
      return await login(email, password)
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [login])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.warn('Error al cerrar sesión en el servidor:', error)
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}