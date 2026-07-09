import axios from 'axios'

/**
 * ============================================================
 * CONFIGURACIÓN DE AXIOS
 * ============================================================
 * 
 * Este archivo es el "centro de comunicaciones" de la app.
 * Todas las peticiones al backend pasan por aquí.
 * 
 * ¿Por qué centralizar?
 * - Si cambia la URL del backend, solo lo modificamos aquí
 * - Los interceptores agregan el token automáticamente
 * - Manejamos errores globales en un solo lugar
 */

// ============================================================
// 1. URL BASE DEL BACKEND
// ============================================================

/**
 * Definimos la URL base del backend.
 * 
 * 💡 TIP: En producción (Render.com), esta URL cambiará.
 * Por eso usamos una variable de entorno con un fallback.
 * 
 * import.meta.env.VITE_API_URL es una variable de Vite.
 * Si no está definida, usamos 'http://localhost:5000/api'
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ============================================================
// 2. CREAR LA INSTANCIA DE AXIOS
// ============================================================

/**
 * Creamos una "instancia" personalizada de Axios.
 * 
 * ¿Qué es una instancia?
 * Es como crear un Axios "a medida" con configuraciones específicas.
 * Así no afectamos al Axios global (por si otras librerías lo usan).
 * 
 * Configuraciones que aplicamos:
 * - baseURL: Se agrega automáticamente a todas las URLs
 * - timeout: Si una petición tarda más de 10s, se cancela
 * - headers: Por defecto enviamos JSON
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json'
  }
})

// ============================================================
// 3. INTERCEPTOR DE PETICIÓN (REQUEST)
// ============================================================

/**
 * Este interceptor se ejecuta ANTES de cada petición.
 * 
 * ¿Qué hace?
 * - Busca el token en localStorage
 * - Si existe, lo agrega al header Authorization
 * 
 * ¿Por qué es útil?
 * - No tenemos que escribir el token manualmente en cada petición
 * - Si el token cambia (ej: después de login), se actualiza automáticamente
 * - Si no hay token, simplemente no agrega el header
 */
api.interceptors.request.use(
  (config) => {
    // Buscar el token en localStorage
    const token = localStorage.getItem('token')
    
    // Si existe un token, agregarlo al header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // ⚠️ IMPORTANTE: Siempre hay que retornar el config
    // Si no lo retornas, la petición nunca se enviará
    return config
  },
  (error) => {
    // Si hay un error al configurar la petición
    console.error('Error en request interceptor:', error)
    return Promise.reject(error)
  }
)

// ============================================================
// 4. INTERCEPTOR DE RESPUESTA (RESPONSE)
// ============================================================

/**
 * Este interceptor se ejecuta DESPUÉS de cada respuesta.
 * 
 * ¿Qué hace?
 * - Si la respuesta es exitosa: la devuelve tal cual
 * - Si hay error 401 (no autorizado): hace logout automático
 * - Si hay otro error: lo maneja de forma centralizada
 * 
 * ¿Por qué es útil?
 * - Si el token expira, automáticamente cerramos la sesión
 * - No tenemos que manejar el 401 en cada componente
 * - Centralizamos el manejo de errores
 */
api.interceptors.response.use(
  // Caso 1: Respuesta exitosa (códigos 2xx)
  (response) => {
    return response
  },
  // Caso 2: Error en la respuesta (códigos 4xx, 5xx)
  async (error) => {
    // Extraer el status y los datos del error
    const status = error.response?.status
    const errorData = error.response?.data
    
    // Caso especial: Token expirado o inválido (401)
    if (status === 401) {
      console.warn('⚠️ Token expirado o inválido. Cerrando sesión...')
      
      // Limpiar el token del localStorage
      localStorage.removeItem('token')
      
      // Si NO estamos ya en la página de login, redirigir
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    // Caso especial: TokenForbidden (403)
    if (status === 403) {
      console.warn('⚠️ No tienes permisos para esta acción')
    }
    
    // Caso especial: Servidor caído (5xx)
    if (status >= 500) {
      console.error('❌ Error del servidor:', errorData)
    }
    
    // Retornar el error para que el componente que hizo la petición lo maneje
    return Promise.reject(error)
  }
)

// ============================================================
// 5. EXPORTAR LA INSTANCIA
// ============================================================

/**
 * Exportamos la instancia configurada para usarla en otros archivos.
 * 
 * Ejemplo de uso en otro archivo:
 * import api from './services/api'
 * const response = await api.get('/auth/me')
 */
export default api