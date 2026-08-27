import axios from 'axios'

// ============================================================
// PROPÓSITO: Configurar la instancia central de Axios para todas las peticiones HTTP.
// CRÍTICO: Se mantiene la redirección hard (window.location.href) en errores 401 para garantizar un "hard reset" del estado de la aplicación. Esto previene que datos protegidos queden residuales en la memoria de React tras la expiración del token, tal como estaba diseñado originalmente.
// ============================================================

// ✅ CAMBIO REALIZADO: Si existe la variable de entorno (Producción), le añadimos '/api'. 
// Si no existe (Desarrollo local), usamos el fallback que ya incluye '/api'.
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    
    if (status === 401) {
      console.warn('⚠️ Token expirado o inválido. Cerrando sesión...')
      localStorage.removeItem('token')
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    if (status === 403) {
      console.warn('⚠️ No tienes permisos para esta acción')
    }
    
    if (status >= 500) {
      console.error(' Error del servidor:', error.response?.data)
    }
    
    return Promise.reject(error)
  }
)

export default api