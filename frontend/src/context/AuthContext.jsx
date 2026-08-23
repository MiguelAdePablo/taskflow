import { createContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

export const AuthContext = createContext(null)

// ============================================================
// PROPÓSITO: Gestionar el estado de autenticación global, token y datos del usuario.
// CRÍTICO: `isAuthenticated` se deriva estrictamente de la existencia del `token`, no del objeto `user`, para evitar estados inconsistentes durante la carga de datos. Se manejan los errores de red (500/Network) sin expulsar al usuario, reservando el logout solo para 401 (No autorizado).
// ============================================================
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const isAuthenticated = !!token

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('token')
      
      if (!savedToken) {
        setLoading(false)
        return
      }
      
      try {
        const data = await authService.getCurrentUser()
        setUser(data.user)
      } catch (error) {
        console.error('Error verificando token:', error)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        } else {
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