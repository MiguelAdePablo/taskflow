import api from './api'

/**
 * ============================================================
 * SERVICIO DE COMENTARIOS
 * ============================================================
 * 
 * Funciones disponibles:
 * - getTaskComments(taskId): Listar comentarios de una tarea
 * - createComment(taskId, content): Crear un comentario
 * - deleteComment(commentId): Eliminar un comentario
 */

/**
 * Obtiene todos los comentarios de una tarea.
 * 
 * @param {number} taskId - ID de la tarea
 * @returns {Promise<Array>} Lista de comentarios
 */
export async function getTaskComments(taskId) {
  try {
    const response = await api.get(`/tasks/${taskId}/comments`)
    return response.data.comments
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al obtener comentarios'
    throw new Error(errorMessage)
  }
}

/**
 * Crea un nuevo comentario en una tarea.
 * 
 * @param {number} taskId - ID de la tarea
 * @param {string} content - Contenido del comentario
 * @returns {Promise<Object>} Comentario creado
 */
export async function createComment(taskId, content) {
  try {
    if (!content || !content.trim()) {
      throw new Error('El contenido del comentario es obligatorio')
    }
    
    if (content.length > 1000) {
      throw new Error('El comentario no puede tener más de 1000 caracteres')
    }
    
    const response = await api.post(`/tasks/${taskId}/comments`, {
      content: content.trim()
    })
    return response.data.comment
  } catch (error) {
    if (error.message.includes('obligatorio') || error.message.includes('caracteres')) {
      throw error
    }
    const errorMessage = error.response?.data?.error || 'Error al crear el comentario'
    throw new Error(errorMessage)
  }
}

/**
 * Elimina un comentario. Solo el autor puede eliminarlo.
 * 
 * @param {number} commentId - ID del comentario
 * @returns {Promise<string>} Mensaje de confirmación
 */
export async function deleteComment(commentId) {
  try {
    const response = await api.delete(`/comments/${commentId}`)
    return response.data.message
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Error al eliminar el comentario'
    throw new Error(errorMessage)
  }
}

export default {
  getTaskComments,
  createComment,
  deleteComment
}