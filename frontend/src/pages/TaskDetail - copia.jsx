import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import taskService from '../services/taskService'
import commentService from '../services/commentService'
import CommentItem from '../components/CommentItem'
import NotificationBell from '../components/NotificationBell'
import ThemeToggle from '../components/ThemeToggle'

function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket, joinProject, leaveProject } = useSocket()
  
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => { loadTaskData() }, [id])

  useEffect(() => {
    if (task && task.project && task.project.id) {
      joinProject(task.project.id)
    }
    return () => {
      if (task && task.project && task.project.id) {
        leaveProject(task.project.id)
      }
    }
  }, [task, joinProject, leaveProject])

  useEffect(() => {
    if (!socket || !id) return
    
    // Escuchar actualizaciones de la tarea en tiempo real (de otros usuarios)
    const handleTaskUpdated = (data) => {
      if (data.task.id === parseInt(id)) {
        console.log('🔄 [Socket] Tarea actualizada en tiempo real:', data.task)
        setTask(data.task)
      }
    }
    
    // Escuchar nuevos comentarios
    const handleTaskCommented = (data) => {
      if (data.task_id === parseInt(id)) {
        setComments(prevComments => {
          if (prevComments.some(c => c.id === data.comment.id)) return prevComments
          return [...prevComments, data.comment]
        })
      }
    }
    
    socket.on('task:updated', handleTaskUpdated)
    socket.on('task:commented', handleTaskCommented)
    
    return () => { 
      socket.off('task:updated', handleTaskUpdated)
      socket.off('task:commented', handleTaskCommented)
    }
  }, [socket, id])

  const loadTaskData = async () => {
    try {
      setLoading(true); setError('')
      const taskData = await taskService.getTask(id)
      setTask(taskData)
      const commentsData = await commentService.getTaskComments(id)
      setComments(commentsData)
    } catch (error) {
      console.error('Error cargando tarea:', error)
      setError(error.message || 'No se pudo cargar la tarea')
    } finally { setLoading(false) }
  }

  const handleDeleteTask = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return
    try {
      await taskService.deleteTask(id)
      navigate(`/projects/${task.project.id}`)
    } catch (error) { alert('Error al eliminar la tarea: ' + error.message) }
  }

  // ✅ ACTUALIZACIÓN OPTIMISTA: Paso a paso
  const handleStatusChange = async (newStatus) => {
    if (!task || task.status === newStatus) return
    
    // PASO 1: Guardar estado anterior (por si hay que revertir)
    const previousTask = { ...task }
    
    // PASO 2: Actualizar UI inmediatamente (notificación visual instantánea)
    setTask({ ...task, status: newStatus })
    
    // PASO 3: Llamar a la API
    try {
      setUpdatingStatus(true)
      await taskService.updateTask(id, { status: newStatus })
      // Éxito: la UI ya está actualizada, no necesitamos hacer nada más
      // El evento WebSocket también llegará, pero será redundante (mismo valor)
    } catch (error) { 
      // PASO 4 (solo si falla): Revertir al estado anterior
      alert('Error al actualizar el estado: ' + error.message)
      setTask(previousTask)
    } finally { 
      setUpdatingStatus(false) 
    }
  }

  // ✅ ACTUALIZACIÓN OPTIMISTA: Paso a paso
  const handlePriorityChange = async (newPriority) => {
    if (!task || task.priority === newPriority) return
    
    // PASO 1: Guardar estado anterior
    const previousTask = { ...task }
    
    // PASO 2: Actualizar UI inmediatamente
    setTask({ ...task, priority: newPriority })
    
    // PASO 3: Llamar a la API
    try {
      setUpdatingStatus(true)
      await taskService.updateTask(id, { priority: newPriority })
      // Éxito: la UI ya está actualizada
    } catch (error) { 
      // PASO 4 (solo si falla): Revertir
      alert('Error al actualizar la prioridad: ' + error.message)
      setTask(previousTask)
    } finally { 
      setUpdatingStatus(false) 
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      setSubmittingComment(true)
      const createdComment = await commentService.createComment(id, newComment)
      setComments(prev => {
        if (prev.some(c => c.id === createdComment.id)) return prev
        return [...prev, createdComment]
      })
      setNewComment('')
    } catch (error) { alert('Error al añadir comentario: ' + error.message) }
    finally { setSubmittingComment(false) }
  }

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>⏳ Cargando tarea...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center' }}><h2 style={{ color: 'var(--text-primary)' }}>❌ Error</h2><p style={{ color: 'var(--text-secondary)' }}>{error}</p><button onClick={() => navigate(-1)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>← Volver atrás</button></div>
  if (!task) return <div style={{ padding: '2rem', textAlign: 'center' }}><h2 style={{ color: 'var(--text-primary)' }}>Tarea no encontrada</h2><Link to="/dashboard" style={{ color: 'var(--accent-blue)' }}>Volver al Dashboard</Link></div>

  const getStatusBadge = (status) => {
    const statuses = { pending: { label: '⏳ Pendiente', color: '#6c757d', bg: '#e9ecef' }, in_progress: { label: ' En progreso', color: '#0d6efd', bg: '#cfe2ff' }, completed: { label: '✅ Completada', color: '#198754', bg: '#d1e7dd' } }
    return statuses[status] || statuses.pending
  }

  const getPriorityBadge = (priority) => {
    const priorities = { low: { label: '🟢 Baja', color: '#198754' }, medium: { label: '🟡 Media', color: '#fd7e14' }, high: { label: '🔴 Alta', color: '#dc3545' } }
    return priorities[priority] || priorities.medium
  }

  const statusInfo = getStatusBadge(task.status)
  const priorityInfo = getPriorityBadge(task.priority)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      <header style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border-color)', 
        padding: '1rem 2rem', 
        boxShadow: 'var(--shadow)',
        width: '100%',
        minHeight: '5rem'
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%'
        }}>
          <Link to={task.project ? `/projects/${task.project.id}` : '/dashboard'} style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
            ← Volver a {task.project ? task.project.name : 'Proyectos'}
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main style={{ padding: '2rem' }}>
        <div className="container-narrow">
          <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.75rem', flex: 1 }}>{task.title}</h1>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ padding: '0.4rem 0.8rem', backgroundColor: statusInfo.bg, color: statusInfo.color, borderRadius: '16px', fontSize: '0.9rem', fontWeight: '600' }}>{statusInfo.label}</span>
                <span style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--bg-tertiary)', color: priorityInfo.color, borderRadius: '16px', fontSize: '0.9rem', fontWeight: '600', border: `1px solid ${priorityInfo.color}` }}>{priorityInfo.label}</span>
                <button onClick={handleDeleteTask} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'transparent', color: 'var(--accent-red)', border: '1px solid var(--accent-red)', borderRadius: '16px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-red)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--accent-red)' }}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
            
            <div className="grid-auto-fit" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>👤 Asignado a</div><div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{task.assigned_user ? (task.assigned_user.full_name || task.assigned_user.username) : 'Sin asignar'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>📅 Fecha límite</div><div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : 'Sin fecha'}</div></div>
              <div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>🏢 Proyecto</div><div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{task.project?.name || 'Desconocido'}</div></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Estado:</label>
                <select value={task.status} onChange={(e) => handleStatusChange(e.target.value)} disabled={updatingStatus} style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--input-border)', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', cursor: updatingStatus ? 'not-allowed' : 'pointer', minWidth: '150px' }}>
                  <option value="pending">⏳ Pendiente</option>
                  <option value="in_progress">🔄 En progreso</option>
                  <option value="completed">✅ Completada</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Prioridad:</label>
                <select value={task.priority} onChange={(e) => handlePriorityChange(e.target.value)} disabled={updatingStatus} style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--input-border)', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', cursor: updatingStatus ? 'not-allowed' : 'pointer', minWidth: '150px' }}>
                  <option value="low">🟢 Baja</option>
                  <option value="medium"> Media</option>
                  <option value="high">🔴 Alta</option>
                </select>
              </div>
            </div>
            
            {task.description && (
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}> Descripción</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{task.description}</p>
              </div>
            )}
          </section>
          
          <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>💬 Comentarios ({comments.length})</h2>
            <div style={{ marginBottom: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}><p style={{ margin: 0 }}>Aún no hay comentarios. ¡Sé el primero en opinar!</p></div>
              ) : (
                comments.map(comment => <CommentItem key={comment.id} comment={comment} onCommentDeleted={handleCommentDeleted} />)
              )}
            </div>
            <form onSubmit={handleAddComment}>
              <label htmlFor="new-comment" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Añadir un comentario:</label>
              <textarea id="new-comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribe tu comentario aquí..." disabled={submittingComment} rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--input-border)', borderRadius: '6px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '0.75rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={!newComment.trim() || submittingComment} style={{ padding: '0.6rem 1.25rem', backgroundColor: (!newComment.trim() || submittingComment) ? 'var(--text-muted)' : 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '6px', cursor: (!newComment.trim() || submittingComment) ? 'not-allowed' : 'pointer', fontSize: '0.95rem', fontWeight: '500' }}>
                  {submittingComment ? 'Enviando...' : 'Enviar Comentario'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

export default TaskDetail