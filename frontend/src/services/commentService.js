import api from './api'

// ============================================================
// PROPÓSITO: Gestionar las operaciones CRUD de los comentarios en las tareas.
// CRÍTICO: Se valida la longitud y existencia del contenido en el frontend para proporcionar feedback inmediato al usuario, evitando peticiones de red innecesarias que el backend rechazaría de todos modos (principio de fallo rápido).
// ============================================================
export async function getTaskComments(taskId) {
  try {
    const response = await api.get(`/tasks/${taskId}/comments`)
    return response.data.comments
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al obtener los comentarios')
  }
}

export async function createComment(taskId, content) {
  try {
    const trimmedContent = content?.trim()
    if (!trimmedContent) {
      throw new Error('El contenido del comentario es obligatorio')
    }
    if (trimmedContent.length > 1000) {
      throw new Error('El comentario no puede superar los 1000 caracteres')
    }
    
    const response = await api.post(`/tasks/${taskId}/comments`, { content: trimmedContent })
    return response.data.comment
  } catch (error) {
    if (error.message.includes('obligatorio') || error.message.includes('caracteres')) {
      throw error
    }
    throw new Error(error.response?.data?.error || 'Error al crear el comentario')
  }
}

export async function deleteComment(commentId) {
  try {
    const response = await api.delete(`/comments/${commentId}`)
    return response.data.message
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al eliminar el comentario')
  }
}

export default { getTaskComments, createComment, deleteComment }