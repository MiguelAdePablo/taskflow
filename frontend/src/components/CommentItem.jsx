import { useAuth } from '../hooks/useAuth'
import commentService from '../services/commentService'

/**
 * ============================================================
 * COMPONENTE: CommentItem
 * ============================================================
 * 
 * Muestra un comentario individual con opción de eliminar 
 * si el usuario actual es el autor.
 * 
 * Props:
 * - comment: Objeto con los datos del comentario
 * - onCommentDeleted: Función callback para actualizar la lista en el padre
 */
function CommentItem({ comment, onCommentDeleted }) {
  const { user } = useAuth()
  
  if (!comment || !comment.author) return null
  
  // Verificar si el usuario actual es el autor del comentario
  const isAuthor = user?.id === comment.user_id
  
  /**
   * Manejar la eliminación del comentario
   */
  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return
    }
    
    try {
      await commentService.deleteComment(comment.id)
      // Notificar al componente padre para que lo quite de la lista
      if (onCommentDeleted) {
        onCommentDeleted(comment.id)
      }
    } catch (error) {
      alert('Error al eliminar el comentario: ' + error.message)
    }
  }
  
  // Formatear la fecha de forma amigable
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      marginBottom: '0.75rem',
      border: '1px solid #e9ecef'
    }}>
      {/* Header del comentario: Autor y Fecha */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Avatar con inicial */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            {(comment.author.full_name || comment.author.username || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#212529' }}>
              {comment.author.full_name || comment.author.username}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
              {formatDate(comment.created_at)}
            </div>
          </div>
        </div>
        
        {/* Botón eliminar (solo para el autor) */}
        {isAuthor && (
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8d7da'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            🗑️ Eliminar
          </button>
        )}
      </div>
      
      {/* Contenido del comentario */}
      <p style={{ 
        margin: 0, 
        color: '#495057', 
        fontSize: '0.95rem',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap' // Respeta los saltos de línea
      }}>
        {comment.content}
      </p>
    </div>
  )
}

export default CommentItem