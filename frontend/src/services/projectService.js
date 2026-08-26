import api from './api'

// ============================================================
// PROPÓSITO: Centralizar la lógica de comunicación con la API para la gestión de proyectos y sus miembros.
// CRÍTICO: Se aplica un patrón consistente y DRY de extracción de mensajes de error (`error.response?.data?.error`) para garantizar que los mensajes de validación personalizados del backend se propaguen correctamente a la interfaz de usuario sin perder contexto.
// ============================================================
export async function getMyProjects() {
  try {
    const response = await api.get('/projects')
    return response.data.projects
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener los proyectos')
  }
}

export async function getProject(projectId) {
  try {
    const response = await api.get(`/projects/${projectId}`)
    return response.data.project
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener el detalle del proyecto')
  }
}

export async function createProject(projectData) {
  try {
    const name = projectData.name?.trim()
    if (!name) {
      throw new Error('El nombre del proyecto es obligatorio')
    }
    
    const response = await api.post('/projects', {
      name,
      description: projectData.description?.trim() || null
    })
    return response.data.project
  } catch (error) {
    if (error.message === 'El nombre del proyecto es obligatorio') throw error
    throw new Error(error.response?.data?.error || 'Error al crear el proyecto')
  }
}

export async function updateProject(projectId, projectData) {
  try {
    const response = await api.put(`/projects/${projectId}`, projectData)
    return response.data.project
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al actualizar el proyecto')
  }
}

export async function deleteProject(projectId) {
  try {
    const response = await api.delete(`/projects/${projectId}`)
    return response.data.message
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al eliminar el proyecto')
  }
}

export async function addMember(projectId, userId, role = 'member') {
  try {
    const response = await api.post(`/projects/${projectId}/members`, { user_id: userId, role })
    return response.data.member
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al añadir el miembro')
  }
}

export async function removeMember(projectId, userId) {
  try {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`)
    return response.data.message
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al eliminar el miembro')
  }
}

export default { getMyProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember }