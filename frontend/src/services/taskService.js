import api from './api'

// ============================================================
// PROPÓSITO: Gestionar las operaciones CRUD de las tareas, incluyendo la construcción dinámica de parámetros de consulta para filtros.
// CRÍTICO: Se utiliza `URLSearchParams` para construir las query strings de forma segura. Esto previene vulnerabilidades de inyección en URLs y garantiza un codificado correcto de los valores, evitando errores de sintaxis en la petición HTTP.
// ============================================================
export async function getProjectTasks(projectId, filters = {}) {
  try {
    const queryParams = new URLSearchParams()
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.priority) queryParams.append('priority', filters.priority)
    if (filters.assigned_to) queryParams.append('assigned_to', filters.assigned_to)
    if (filters.created_by) queryParams.append('created_by', filters.created_by)
    
    const queryString = queryParams.toString()
    const url = `/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get(url)
    return response.data.tasks
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener las tareas')
  }
}

export async function getTask(taskId) {
  try {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data.task
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener el detalle de la tarea')
  }
}

export async function createTask(projectId, taskData) {
  try {
    const title = taskData.title?.trim()
    if (!title) {
      throw new Error('El título de la tarea es obligatorio')
    }
    
    const validPriorities = ['low', 'medium', 'high']
    if (taskData.priority && !validPriorities.includes(taskData.priority)) {
      throw new Error(`La prioridad debe ser: ${validPriorities.join(', ')}`)
    }
    
    const cleanData = {
      title,
      description: taskData.description?.trim() || null,
      priority: taskData.priority || 'medium',
      due_date: taskData.due_date || null,
      assigned_to: taskData.assigned_to || null
    }
    
    const response = await api.post(`/projects/${projectId}/tasks`, cleanData)
    return response.data.task
  } catch (error) {
    if (error.message.includes('obligatorio') || error.message.includes('prioridad')) {
      throw error
    }
    throw new Error(error.response?.data?.error || 'Error al crear la tarea')
  }
}

export async function updateTask(taskId, taskData) {
  try {
    const response = await api.put(`/tasks/${taskId}`, taskData)
    return response.data.task
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al actualizar la tarea')
  }
}

export async function deleteTask(taskId) {
  try {
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data.message
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al eliminar la tarea')
  }
}

export default { getProjectTasks, getTask, createTask, updateTask, deleteTask }