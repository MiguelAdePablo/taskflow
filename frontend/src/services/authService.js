import api from './api'

/**
 * ============================================================
 * SERVICIO DE AUTENTICACIÓN
 * ============================================================
 * 
 * Este servicio agrupa todas las funciones relacionadas con
 * la autenticación de usuarios.
 * 
 * ¿Por qué separar en servicios?
 * - Código más organizado y mantenible
 * - Reutilizable en diferentes componentes
 * - Fácil de testear
 * - Si cambia la API, solo modificamos este archivo
 */

// ============================================================
// FUNCIÓN: Login
// ============================================================

/**
 * Inicia sesión con email y contraseña.
 * 
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario y token
 * 
 * Ejemplo de uso:
 * const { token, user } = await authService.login('miguel@example.com', 'miPassword123')
 */
export async function login(email, password) {
  try {
    // Hacer la petición POST a /auth/login
    // Nota: NO necesitamos poner la URL completa, solo el path relativo
    // El interceptor agrega automáticamente:
    // - La URL base (http://localhost:5000/api)
    // - El Content-Type: application/json
    const response = await api.post('/auth/login', { email, password })
    
    // Retornar los datos de la respuesta
    return response.data
  } catch (error) {
    // Manejar el error de forma más amigable
    const errorMessage = error.response?.data?.error || 'Error al iniciar sesión'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Register
// ============================================================

/**
 * Registra un nuevo usuario.
 * 
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.username - Nombre de usuario
 * @param {string} userData.email - Email
 * @param {string} userData.password - Contraseña
 * @param {string} [userData.full_name] - Nombre completo (opcional)
 * @returns {Promise<Object>} Datos del usuario registrado y token
 */
export async function register(userData) {
  try {
    const response = await api.post('/auth/register', userData)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al registrar'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Obtener usuario actual
// ============================================================

/**
 * Obtiene los datos del usuario actualmente autenticado.
 * Requiere que el token esté en localStorage (el interceptor lo agrega).
 * 
 * @returns {Promise<Object>} Datos del usuario
 */
export async function getCurrentUser() {
  try {
    const response = await api.get('/auth/me')
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al obtener usuario'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Logout
// ============================================================

/**
 * Cierra la sesión del usuario.
 * 
 * Nota: Con JWT, el logout es principalmente del lado del cliente
 * (borrar el token). El endpoint del servidor es más simbólico.
 */
export async function logout() {
  try {
    // Opcional: llamar al endpoint de logout del backend
    await api.post('/auth/logout')
  } catch (error) {
    // Ignorar errores de logout (no es crítico)
    console.warn('Error al cerrar sesión en el servidor:', error)
  } finally {
    // Siempre limpiar el token del localStorage
    localStorage.removeItem('token')
  }
}

// ============================================================
// EXPORTAR TODO EL SERVICIO COMO OBJETO
// ============================================================

/**
 * Exportamos todas las funciones como un objeto para importarlas así:
 * import authService from './services/authService'
 * authService.login(...)
 */
export default {
  login,
  register,
  getCurrentUser,
  logout
}