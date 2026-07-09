import api from './api'

/**
 * ============================================================
 * SERVICIO DE USUARIOS
 * ============================================================
 * 
 * Funciones disponibles:
 * - searchUsers(query): Buscar usuarios
 * - getUserProfile(userId): Ver perfil de un usuario
 * - updateUserProfile(userId, data): Actualizar mi perfil
 */

/**
 * Busca usuarios por username, email o nombre completo.
 * 
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} Lista de usuarios encontrados
 */
export async function searchUsers(query = '') {
  try {
    const url = query ? `/users?q=${encodeURIComponent(query)}` : '/users'
    const response = await api.get(url)
    return response.data.users
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al buscar usuarios'
    throw new Error(errorMessage)
  }
}

/**
 * Obtiene el perfil público de un usuario.
 * 
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export async function getUserProfile(userId) {
  try {
    const response = await api.get(`/users/${userId}`)
    return response.data.user
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al obtener el perfil'
    throw new Error(errorMessage)
  }
}

/**
 * Actualiza el perfil del usuario autenticado.
 * 
 * @param {number} userId - ID del usuario (debe ser el propio)
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
export async function updateUserProfile(userId, userData) {
  try {
    const response = await api.put(`/users/${userId}`, userData)
    return response.data.user
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al actualizar el perfil'
    throw new Error(errorMessage)
  }
}

export default {
  searchUsers,
  getUserProfile,
  updateUserProfile
}