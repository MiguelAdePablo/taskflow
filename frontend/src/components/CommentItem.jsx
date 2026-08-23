import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import commentService from '../services/commentService'

// ============================================================
// PROPÓSITO: Formatear la fecha de creación del comentario.
// CRÍTICO: Extraída fuera del componente para evitar su recreación innecesaria en cada renderizado (optimización de memoria).
// ============================================================
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ============================================================
// PROPÓSITO: Renderizar un comentario individual con opción de eliminación para el autor.
// CRÍTICO: Se valida la existencia de `comment` y `comment.author` al inicio para prevenir errores de desestructuración (TypeError) si los datos llegan incompletos.
// ============================================================
function CommentItem({ comment, onCommentDeleted }) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  
  if (!comment || !comment.author) return null
  
  const isAuthor = user?.id === comment.user_id
  
  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) return
    
    setIsDeleting(true)
    try {
      await commentService.deleteComment(comment.id)
      if (onCommentDeleted) onCommentDeleted(comment.id)
    } catch (error) {
      console.error('Error al eliminar el comentario:', error)
      alert('Error al eliminar el comentario: ' + error.message)
    } finally {
      setIsDeleting(false)
    }
  }
  
  return (
    <div style={{
      padding: '1rem',
      backgroundColor: 'var(--bg-secondary, #f8f9fa)',
      borderRadius: '8px',
      marginBottom: '0.75rem',
      border: '1px solid var(--border-color, #e9ecef)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color, #007bff)',
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
            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary, #212529)' }}>
              {comment.author.full_name || comment.author.username}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6c757d)' }}>
              {formatDate(comment.created_at)}
            </div>
          </div>
        </div>
        
        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              background: 'none',
              border: 'none',
              color: isDeleting ? '#adb5bd' : '#dc3545',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => { if (!isDeleting) e.currentTarget.style.backgroundColor = '#f8d7da' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {isDeleting ? 'Eliminando...' : '🗑️ Eliminar'}
          </button>
        )}
      </div>
      
      <p style={{ 
        margin: 0, 
        color: 'var(--text-primary, #495057)', 
        fontSize: '0.95rem',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap'
      }}>
        {comment.content}
      </p>
    </div>
  )
}

export default CommentItem