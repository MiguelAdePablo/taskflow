import { createContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'  // ← NUEVO: Importar el servicio

/**
 * ============================================================
 * AUTH CONTEXT
 * ============================================================
 * 
 * Contexto que provee el estado de autenticación a toda la app.
 * 
 * Cambios en esta versión:
 * - Antes: Usábamos fetch directamente
 * - Ahora: Usamos authService (más limpio y mantenible)
 * - Los interceptores de Axios manejan el token automáticamente
 */
export const AuthContext = createContext(null)

/**
 * AuthProvider: Componente que envuelve a toda la app y provee
 * el estado de autenticación.
 */
export function AuthProvider({ children }) {
  // ============================================================
  // ESTADOS
  // ============================================================
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // ============================================================
  // EFECTO INICIAL: Verificar si hay un token guardado
  // ============================================================
  
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Buscar el token en localStorage
        const savedToken = localStorage.getItem('token')
        
        if (!savedToken) {
          setLoading(false)
          return
        }
        
        // ✅ ANTES: Usábamos fetch directamente
        // const response = await fetch(`${API_URL}/auth/me`, { ... })
        
        // ✅ AHORA: Usamos el servicio (más limpio)
        // El interceptor de Axios agrega automáticamente el token
        const data = await authService.getCurrentUser()
        
        // Si llegamos aquí, el token es válido
        setToken(savedToken)
        setUser(data.user)
      } catch (error) {
        console.error('Error verificando token:', error)
        // Token inválido o expirado, eliminarlo
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }
    
    verifyToken()
  }, [])
  
  // ============================================================
  // FUNCIÓN: Login
  // ============================================================
  
  const login = useCallback(async (email, password) => {
    try {
      // ✅ ANTES: Usábamos fetch
      // const response = await fetch(`${API_URL}/auth/login`, { ... })
      
      // ✅ AHORA: Usamos el servicio
      const data = await authService.login(email, password)
      
      // Guardar el token en localStorage
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.message  // El servicio ya nos da el mensaje formateado
      }
    }
  }, [])
  
  // ============================================================
  // FUNCIÓN: Register
  // ============================================================
  
  const register = useCallback(async (username, email, password, full_name) => {
    try {
      // ✅ ANTES: Usábamos fetch
      // ✅ AHORA: Usamos el servicio
      const userData = { 
        username, 
        email, 
        password,
        full_name: full_name || undefined
      }
      
      // El servicio register devuelve los datos del usuario
      // Pero NO hace login automático, así que hacemos login después
      await authService.register(userData)
      
      // Hacer login automáticamente después del registro
      return await login(email, password)
    } catch (error) {
      return { 
        success: false, 
        error: error.message
      }
    }
  }, [login])
  
  // ============================================================
  // FUNCIÓN: Logout
  // ============================================================
  
  const logout = useCallback(async () => {
    // ✅ ANTES: Solo limpiábamos localStorage
    // localStorage.removeItem('token')
    
    // ✅ AHORA: Llamamos al servicio (que hace logout en el servidor también)
    await authService.logout()
    
    setToken(null)
    setUser(null)
  }, [])
  
  // ============================================================
  // VALOR DEL CONTEXTO
  // ============================================================
  
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}