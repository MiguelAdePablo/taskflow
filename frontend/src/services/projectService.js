import api from './api'

/**
 * ============================================================
 * SERVICIO DE PROYECTOS
 * ============================================================
 * 
 * Este servicio agrupa todas las funciones relacionadas con
 * la gestión de proyectos.
 * 
 * Funciones disponibles:
 * - getMyProjects(): Listar mis proyectos
 * - getProject(id): Ver detalle de un proyecto
 * - createProject(data): Crear un proyecto nuevo
 * - updateProject(id, data): Actualizar un proyecto
 * - deleteProject(id): Eliminar un proyecto
 * - addMember(projectId, userId, role): Añadir miembro
 * - removeMember(projectId, userId): Eliminar miembro
 */

// ============================================================
// FUNCIÓN: Listar mis proyectos
// ============================================================

/**
 * Obtiene todos los proyectos donde el usuario actual es miembro.
 * 
 * @returns {Promise<Array>} Lista de proyectos
 * 
 * Ejemplo de uso:
 * const projects = await projectService.getMyProjects()
 */
export async function getMyProjects() {
  try {
    const response = await api.get('/projects')
    return response.data.projects
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al obtener proyectos'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Ver detalle de un proyecto
// ============================================================

/**
 * Obtiene el detalle completo de un proyecto, incluyendo miembros.
 * 
 * @param {number} projectId - ID del proyecto
 * @returns {Promise<Object>} Datos del proyecto con miembros
 */
export async function getProject(projectId) {
  try {
    const response = await api.get(`/projects/${projectId}`)
    return response.data.project
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al obtener el proyecto'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Crear proyecto
// ============================================================

/**
 * Crea un nuevo proyecto. El usuario actual se convierte en el owner.
 * 
 * @param {Object} projectData - Datos del proyecto
 * @param {string} projectData.name - Nombre del proyecto (obligatorio)
 * @param {string} [projectData.description] - Descripción (opcional)
 * @returns {Promise<Object>} Proyecto creado
 */
export async function createProject(projectData) {
  try {
    // Validación básica en el frontend
    if (!projectData.name || !projectData.name.trim()) {
      throw new Error('El nombre del proyecto es obligatorio')
    }
    
    const response = await api.post('/projects', {
      name: projectData.name.trim(),
      description: projectData.description?.trim() || null
    })
    return response.data.project
  } catch (error) {
    // Si es un error de validación nuestro, lo lanzamos tal cual
    if (error.message === 'El nombre del proyecto es obligatorio') {
      throw error
    }
    const errorMessage = error.response?.data?.error || 'Error al crear el proyecto'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Actualizar proyecto
// ============================================================

/**
 * Actualiza un proyecto existente. Solo el owner puede hacerlo.
 * 
 * @param {number} projectId - ID del proyecto
 * @param {Object} projectData - Datos a actualizar
 * @returns {Promise<Object>} Proyecto actualizado
 */
export async function updateProject(projectId, projectData) {
  try {
    const response = await api.put(`/projects/${projectId}`, projectData)
    return response.data.project
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al actualizar el proyecto'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Eliminar proyecto
// ============================================================

/**
 * Elimina un proyecto y todas sus tareas/miembros. Solo el owner puede hacerlo.
 * 
 * @param {number} projectId - ID del proyecto
 * @returns {Promise<string>} Mensaje de confirmación
 */
export async function deleteProject(projectId) {
  try {
    const response = await api.delete(`/projects/${projectId}`)
    return response.data.message
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al eliminar el proyecto'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Añadir miembro al proyecto
// ============================================================

/**
 * Añade un miembro al proyecto. Solo el owner puede hacerlo.
 * 
 * @param {number} projectId - ID del proyecto
 * @param {number} userId - ID del usuario a añadir
 * @param {string} [role='member'] - Rol del usuario ('owner', 'admin', 'member')
 * @returns {Promise<Object>} Membresía creada
 */
export async function addMember(projectId, userId, role = 'member') {
  try {
    const response = await api.post(`/projects/${projectId}/members`, {
      user_id: userId,
      role: role
    })
    return response.data.member
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al añadir miembro'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Eliminar miembro del proyecto
// ============================================================

/**
 * Elimina un miembro del proyecto. Solo el owner puede hacerlo.
 * 
 * @param {number} projectId - ID del proyecto
 * @param {number} userId - ID del usuario a eliminar
 * @returns {Promise<string>} Mensaje de confirmación
 */
export async function removeMember(projectId, userId) {
  try {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`)
    return response.data.message
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al eliminar miembro'
    throw new Error(errorMessage)
  }
}

// ============================================================
// EXPORTAR TODO EL SERVICIO COMO OBJETO
// ============================================================

export default {
  getMyProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
}