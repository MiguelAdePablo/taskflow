import { Link } from 'react-router-dom'

/**
 * ============================================================
 * COMPONENTE: TaskItem
 * ============================================================
 * 
 * Representa una tarea en una lista (vista compacta).
 * 
 * Props:
 * - task: Objeto con los datos de la tarea
 */
function TaskItem({ task }) {
  if (!task) return null
  
  // Colores según el estado
  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: '⏳ Pendiente', color: '#6c757d', bgColor: '#e9ecef' },
      in_progress: { label: '🔄 En progreso', color: '#0d6efd', bgColor: '#cfe2ff' },
      completed: { label: '✅ Completada', color: '#198754', bgColor: '#d1e7dd' }
    }
    return statuses[status] || statuses.pending
  }
  
  // Colores según la prioridad
  const getPriorityInfo = (priority) => {
    const priorities = {
      low: { label: '🟢 Baja', color: '#198754' },
      medium: { label: '🟡 Media', color: '#fd7e14' },
      high: { label: '🔴 Alta', color: '#dc3545' }
    }
    return priorities[priority] || priorities.medium
  }
  
  const statusInfo = getStatusInfo(task.status)
  const priorityInfo = getPriorityInfo(task.priority)
  
  // Formatear fecha límite
  const formatDueDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    })
  }
  
  const dueDate = formatDueDate(task.due_date)
  
  return (
    <Link 
      to={`/tasks/${task.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        marginBottom: '0.75rem',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#007bff'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e0e0e0'
        e.currentTarget.style.boxShadow = 'none'
      }}
      >
        {/* Fila principal */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '0.5rem'
        }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: '1rem',
            color: '#212529',
            flex: 1,
            marginRight: '1rem'
          }}>
            {task.title}
          </h4>
          
          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{
              padding: '0.2rem 0.6rem',
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {statusInfo.label}
            </span>
            <span style={{
              padding: '0.2rem 0.6rem',
              backgroundColor: '#f8f9fa',
              color: priorityInfo.color,
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '500',
              border: `1px solid ${priorityInfo.color}`
            }}>
              {priorityInfo.label}
            </span>
          </div>
        </div>
        
        {/* Descripción (si existe) */}
        {task.description && (
          <p style={{
            margin: '0 0 0.75rem 0',
            color: '#6c757d',
            fontSize: '0.9rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {task.description}
          </p>
        )}
        
        {/* Footer: asignado y fecha */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          color: '#6c757d'
        }}>
          <div>
            {task.assigned_user ? (
              <span>👤 {task.assigned_user.full_name || task.assigned_user.username}</span>
            ) : (
              <span style={{ color: '#adb5bd' }}>👤 Sin asignar</span>
            )}
          </div>
          
          {dueDate && (
            <div>📅 {dueDate}</div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default TaskItem