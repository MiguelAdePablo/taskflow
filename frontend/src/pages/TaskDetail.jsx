import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import taskService from '../services/taskService'
import commentService from '../services/commentService'
import CommentItem from '../components/CommentItem'

/**
 * ============================================================
 * PÁGINA: TaskDetail
 * ============================================================
 * 
 * Muestra el detalle de una tarea:
 * - Información completa (título, descripción, estado, prioridad, asignado, fecha)
 * - Selectores compactos para cambiar el estado y la prioridad
 * - Lista de comentarios
 * - Formulario para añadir nuevos comentarios
 */
function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Estados principales
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Estado para el nuevo comentario
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Cargar datos al montar el componente
  useEffect(() => {
    loadTaskData()
  }, [id])

  /**
   * Cargar la tarea y sus comentarios
   */
  const loadTaskData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Cargar tarea
      const taskData = await taskService.getTask(id)
      setTask(taskData)
      
      // Cargar comentarios
      const commentsData = await commentService.getTaskComments(id)
      setComments(commentsData)
    } catch (error) {
      console.error('Error cargando tarea:', error)
      setError(error.message || 'No se pudo cargar la tarea')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cambiar el estado de la tarea
   */
  const handleStatusChange = async (newStatus) => {
    if (!task || task.status === newStatus) return
    
    try {
      setUpdatingStatus(true)
      const updatedTask = await taskService.updateTask(id, { status: newStatus })
      setTask(updatedTask)
    } catch (error) {
      alert('Error al actualizar el estado: ' + error.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  /**
   * Cambiar la prioridad de la tarea
   */
  const handlePriorityChange = async (newPriority) => {
    if (!task || task.priority === newPriority) return
    
    try {
      setUpdatingStatus(true)
      const updatedTask = await taskService.updateTask(id, { priority: newPriority })
      setTask(updatedTask)
    } catch (error) {
      alert('Error al actualizar la prioridad: ' + error.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  /**
   * Enviar un nuevo comentario
   */
  const handleAddComment = async (e) => {
    e.preventDefault()
    
    if (!newComment.trim()) return
    
    try {
      setSubmittingComment(true)
      const createdComment = await commentService.createComment(id, newComment)
      
      // Añadir el nuevo comentario al final de la lista
      setComments([...comments, createdComment])
      setNewComment('') // Limpiar el input
    } catch (error) {
      alert('Error al añadir comentario: ' + error.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  /**
   * Eliminar un comentario de la lista local
   */
  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId))
  }

  // ============================================================
  // ESTADOS DE CARGA Y ERROR
  // ============================================================
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: '#6c757d' }}>
        ⏳ Cargando tarea...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          ← Volver atrás
        </button>
      </div>
    )
  }

  if (!task) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Tarea no encontrada</h2>
        <Link to="/dashboard">Volver al Dashboard</Link>
      </div>
    )
  }

  // ============================================================
  // RENDERIZADO PRINCIPAL
  // ============================================================
  
  // Funciones auxiliares para badges
  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: '⏳ Pendiente', color: '#6c757d', bg: '#e9ecef' },
      in_progress: { label: '🔄 En progreso', color: '#0d6efd', bg: '#cfe2ff' },
      completed: { label: '✅ Completada', color: '#198754', bg: '#d1e7dd' }
    }
    return statuses[status] || statuses.pending
  }

  const getPriorityBadge = (priority) => {
    const priorities = {
      low: { label: '🟢 Baja', color: '#198754' },
      medium: { label: '🟡 Media', color: '#fd7e14' },
      high: { label: '🔴 Alta', color: '#dc3545' }
    }
    return priorities[priority] || priorities.medium
  }

  const statusInfo = getStatusBadge(task.status)
  const priorityInfo = getPriorityBadge(task.priority)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header con navegación */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', padding: '1rem 2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link 
            to={task.project ? `/projects/${task.project.id}` : '/dashboard'} 
            style={{ color: '#007bff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            ← Volver a {task.project ? task.project.name : 'Proyectos'}
          </Link>
        </div>
      </header>
      
      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Sección 1: Información de la Tarea */}
        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ margin: 0, color: '#212529', fontSize: '1.75rem', flex: 1 }}>
              {task.title}
            </h1>
            
            {/* Badges */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ padding: '0.4rem 0.8rem', backgroundColor: statusInfo.bg, color: statusInfo.color, borderRadius: '16px', fontSize: '0.9rem', fontWeight: '600' }}>
                {statusInfo.label}
              </span>
              <span style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f8f9fa', color: priorityInfo.color, borderRadius: '16px', fontSize: '0.9rem', fontWeight: '600', border: `1px solid ${priorityInfo.color}` }}>
                {priorityInfo.label}
              </span>
            </div>
          </div>
          
          {/* Metadatos de la tarea */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>👤 Asignado a</div>
              <div style={{ fontWeight: '500', color: '#212529' }}>
                {task.assigned_user ? (task.assigned_user.full_name || task.assigned_user.username) : 'Sin asignar'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}> Fecha límite</div>
              <div style={{ fontWeight: '500', color: '#212529' }}>
                {task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : 'Sin fecha'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.25rem' }}>🏢 Proyecto</div>
              <div style={{ fontWeight: '500', color: '#212529' }}>
                {task.project?.name || 'Desconocido'}
              </div>
            </div>
          </div>

          {/* Selectores Compactos de Estado y Prioridad */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1.5rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Selector de Estado */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                color: '#495057', 
                marginBottom: '0.35rem' 
              }}>
                Estado:
              </label>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                style={{
                  padding: '0.4rem 0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  backgroundColor: '#f8f9fa',
                  color: '#212529',
                  cursor: updatingStatus ? 'not-allowed' : 'pointer',
                  minWidth: '150px'
                }}
              >
                <option value="pending">⏳ Pendiente</option>
                <option value="in_progress">🔄 En progreso</option>
                <option value="completed">✅ Completada</option>
              </select>
            </div>
            
            {/* Selector de Prioridad */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                color: '#495057', 
                marginBottom: '0.35rem' 
              }}>
                Prioridad:
              </label>
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                disabled={updatingStatus}
                style={{
                  padding: '0.4rem 0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  backgroundColor: '#f8f9fa',
                  color: '#212529',
                  cursor: updatingStatus ? 'not-allowed' : 'pointer',
                  minWidth: '150px'
                }}
              >
                <option value="low">🟢 Baja</option>
                <option value="medium">🟡 Media</option>
                <option value="high">🔴 Alta</option>
              </select>
            </div>
          </div>
          
          {/* Descripción */}
          {task.description && (
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#212529', marginBottom: '0.75rem' }}>📝 Descripción</h3>
              <p style={{ color: '#495057', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {task.description}
              </p>
            </div>
          )}
        </section>
        
        {/* Sección 2: Comentarios */}
        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#212529' }}>
            💬 Comentarios ({comments.length})
          </h2>
          
          {/* Lista de comentarios */}
          <div style={{ marginBottom: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ margin: 0 }}>Aún no hay comentarios. ¡Sé el primero en opinar!</p>
              </div>
            ) : (
              comments.map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onCommentDeleted={handleCommentDeleted} 
                />
              ))
            )}
          </div>
          
          {/* Formulario para añadir comentario */}
          <form onSubmit={handleAddComment}>
            <label htmlFor="new-comment" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#495057', marginBottom: '0.5rem' }}>
              Añadir un comentario:
            </label>
            <textarea
              id="new-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu comentario aquí..."
              disabled={submittingComment}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                marginBottom: '0.75rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                style={{
                  padding: '0.6rem 1.25rem',
                  backgroundColor: (!newComment.trim() || submittingComment) ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (!newComment.trim() || submittingComment) ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}
              >
                {submittingComment ? 'Enviando...' : 'Enviar Comentario'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default TaskDetail