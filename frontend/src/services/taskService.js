import api from './api'

/**
 * ============================================================
 * SERVICIO DE TAREAS
 * ============================================================
 * 
 * Este servicio agrupa todas las funciones relacionadas con
 * la gestión de tareas.
 * 
 * Funciones disponibles:
 * - getProjectTasks(projectId, filters): Listar tareas con filtros
 * - getTask(taskId): Ver detalle de una tarea
 * - createTask(projectId, data): Crear una tarea nueva
 * - updateTask(taskId, data): Actualizar una tarea
 * - deleteTask(taskId): Eliminar una tarea
 */

// ============================================================
// FUNCIÓN: Listar tareas de un proyecto (con filtros)
// ============================================================

/**
 * Obtiene todas las tareas de un proyecto, con filtros opcionales.
 * 
 * @param {number} projectId - ID del proyecto
 * @param {Object} [filters={}] - Filtros opcionales
 * @param {string} [filters.status] - Estado: 'pending', 'in_progress', 'completed'
 * @param {string} [filters.priority] - Prioridad: 'low', 'medium', 'high'
 * @param {number} [filters.assigned_to] - ID del usuario asignado
 * @param {number} [filters.created_by] - ID del creador
 * @returns {Promise<Array>} Lista de tareas
 */
export async function getProjectTasks(projectId, filters = {}) {
  try {
    // Construir los query params dinámicamente
    const queryParams = new URLSearchParams()
    
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.priority) queryParams.append('priority', filters.priority)
    if (filters.assigned_to) queryParams.append('assigned_to', filters.assigned_to)
    if (filters.created_by) queryParams.append('created_by', filters.created_by)
    
    // Construir la URL con los query params
    const queryString = queryParams.toString()
    const url = `/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get(url)
    return response.data.tasks
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al obtener tareas'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Ver detalle de una tarea
// ============================================================

/**
 * Obtiene el detalle completo de una tarea.
 * 
 * @param {number} taskId - ID de la tarea
 * @returns {Promise<Object>} Datos de la tarea
 */
export async function getTask(taskId) {
  try {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data.task
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al obtener la tarea'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Crear tarea
// ============================================================

/**
 * Crea una nueva tarea en un proyecto.
 * 
 * @param {number} projectId - ID del proyecto
 * @param {Object} taskData - Datos de la tarea
 * @param {string} taskData.title - Título (obligatorio)
 * @param {string} [taskData.description] - Descripción
 * @param {string} [taskData.priority='medium'] - Prioridad
 * @param {string} [taskData.due_date] - Fecha límite (ISO 8601)
 * @param {number} [taskData.assigned_to] - ID del usuario asignado
 * @returns {Promise<Object>} Tarea creada
 */
export async function createTask(projectId, taskData) {
  try {
    // Validación básica en el frontend
    if (!taskData.title || !taskData.title.trim()) {
      throw new Error('El título de la tarea es obligatorio')
    }
    
    // Validar prioridad si viene
    const validPriorities = ['low', 'medium', 'high']
    if (taskData.priority && !validPriorities.includes(taskData.priority)) {
      throw new Error(`La prioridad debe ser: ${validPriorities.join(', ')}`)
    }
    
    // Preparar los datos, eliminando campos vacíos
    const cleanData = {
      title: taskData.title.trim(),
      description: taskData.description?.trim() || null,
      priority: taskData.priority || 'medium',
      due_date: taskData.due_date || null,
      assigned_to: taskData.assigned_to || null
    }
    
    const response = await api.post(`/projects/${projectId}/tasks`, cleanData)
    return response.data.task
  } catch (error) {
    // Si es un error de validación nuestro, lo lanzamos tal cual
    if (error.message.includes('obligatorio') || error.message.includes('prioridad')) {
      throw error
    }
    const errorMessage = error.response?.data?.error || 'Error al crear la tarea'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Actualizar tarea
// ============================================================

/**
 * Actualiza una tarea existente.
 * 
 * @param {number} taskId - ID de la tarea
 * @param {Object} taskData - Datos a actualizar (todos opcionales)
 * @returns {Promise<Object>} Tarea actualizada
 */
export async function updateTask(taskId, taskData) {
  try {
    const response = await api.put(`/tasks/${taskId}`, taskData)
    return response.data.task
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al actualizar la tarea'
    throw new Error(errorMessage)
  }
}

// ============================================================
// FUNCIÓN: Eliminar tarea
// ============================================================

/**
 * Elimina una tarea.
 * 
 * @param {number} taskId - ID de la tarea
 * @returns {Promise<string>} Mensaje de confirmación
 */
export async function deleteTask(taskId) {
  try {
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data.message
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al eliminar la tarea'
    throw new Error(errorMessage)
  }
}

// ============================================================
// EXPORTAR TODO EL SERVICIO COMO OBJETO
// ============================================================

export default {
  getProjectTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
}