import api from './api'

// ============================================================
// PROPÓSITO: Centralizar las operaciones relacionadas con la búsqueda y gestión de perfiles de usuario.
// CRÍTICO: Se aplica `encodeURIComponent` a la consulta de búsqueda para prevenir ataques de inyección en la URL y garantizar que caracteres especiales (como espacios o símbolos) sean manejados correctamente por el backend sin romper la petición.
// ============================================================
export async function searchUsers(query = '') {
  try {
    const url = query ? `/users?q=${encodeURIComponent(query)}` : '/users'
    const response = await api.get(url)
    return response.data.users
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al buscar usuarios')
  }
}

export async function getUserProfile(userId) {
  try {
    const response = await api.get(`/users/${userId}`)
    return response.data.user
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener el perfil del usuario')
  }
}

export async function updateUserProfile(userId, userData) {
  try {
    const response = await api.put(`/users/${userId}`, userData)
    return response.data.user
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al actualizar el perfil')
  }
}

export default { searchUsers, getUserProfile, updateUserProfile }