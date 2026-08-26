import api from './api'

// ============================================================
// PROPÓSITO: Agrupar y gestionar todas las operaciones de comunicación relacionadas con la autenticación de usuarios.
// CRÍTICO: La función `logout` se limita estrictamente a limpiar el token en el cliente y notificar al backend. La gestión del estado global (user, isAuthenticated) es responsabilidad exclusiva del `AuthContext`, manteniendo una separación de preocupaciones (SoC) estricta.
// ============================================================
export async function login(email, password) {
  try {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al iniciar sesión')
  }
}

export async function register(userData) {
  try {
    const response = await api.post('/auth/register', userData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al registrar el usuario')
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get('/auth/me')
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener los datos del usuario')
  }
}

export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    console.warn('Error al cerrar sesión en el servidor:', error)
  } finally {
    localStorage.removeItem('token')
  }
}

export default { login, register, getCurrentUser, logout }