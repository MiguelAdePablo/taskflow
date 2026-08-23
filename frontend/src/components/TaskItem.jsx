import { Link } from 'react-router-dom'

// ============================================================
// PROPÓSITO: Obtener información visual de estado y prioridad.
// CRÍTICO: Funciones movidas fuera del componente para evitar recreación en cada renderizado. Se unificó el nombre de la función de prioridad (`getPriorityInfo`) para corregir un bug de referencia (`getPriorityBadge` no estaba definido en el scope superior).
// ============================================================
const getStatusInfo = (status) => {
  const statuses = {
    pending: { label: '⏳ Pendiente', color: '#6c757d', bgColor: '#e9ecef' },
    in_progress: { label: '🔄 En progreso', color: '#0d6efd', bgColor: '#cfe2ff' },
    completed: { label: '✅ Completada', color: '#198754', bgColor: '#d1e7dd' }
  }
  return statuses[status] || statuses.pending
}

const getPriorityInfo = (priority) => {
  const priorities = {
    low: { label: '🟢 Baja', color: '#198754' },
    medium: { label: '🟡 Media', color: '#fd7e14' },
    high: { label: '🔴 Alta', color: '#dc3545' }
  }
  return priorities[priority] || priorities.medium
}

const formatDueDate = (dateString) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

// ============================================================
// PROPÓSITO: Renderizar una tarea en formato de lista compacta.
// CRÍTICO: Se usa `inset: 0` en lugar de top/left/right/bottom para mayor limpieza. Se añade validación de `task` al inicio.
// ============================================================
function TaskItem({ task, onEdit }) {
  if (!task) return null
  
  const statusInfo = getStatusInfo(task.status)
  const priorityInfo = getPriorityInfo(task.priority)
  const dueDate = formatDueDate(task.due_date)

  const handleEditClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(task)
  }
  
  return (
    <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--bg-primary, white)',
        border: '1px solid var(--border-color, #e0e0e0)',
        borderRadius: '8px',
        marginBottom: '0.75rem',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary-color, #007bff)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
        const editBtn = e.currentTarget.querySelector('.task-edit-btn')
        if (editBtn) editBtn.style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color, #e0e0e0)'
        e.currentTarget.style.boxShadow = 'none'
        const editBtn = e.currentTarget.querySelector('.task-edit-btn')
        if (editBtn) editBtn.style.opacity = '0'
      }}
      >
        {onEdit && (
          <button
            className="task-edit-btn"
            onClick={handleEditClick}
            title="Editar tarea"
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'var(--bg-primary, white)',
              border: '1px solid var(--border-color, #ced4da)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              opacity: 0,
              transition: 'opacity 0.2s, background 0.2s, color 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-color, #007bff)'
              e.currentTarget.style.color = 'white'
              e.currentTarget.style.borderColor = 'var(--primary-color, #007bff)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary, white)'
              e.currentTarget.style.color = 'var(--text-primary, #212529)'
              e.currentTarget.style.borderColor = 'var(--border-color, #ced4da)'
            }}
          >
            ✏️
          </button>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', paddingRight: onEdit ? '2.5rem' : '0' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary, #212529)', flex: 1, marginRight: '1rem' }}>
            {task.title}
          </h4>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ padding: '0.2rem 0.6rem', backgroundColor: statusInfo.bgColor, color: statusInfo.color, borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500' }}>
              {statusInfo.label}
            </span>
            <span style={{ padding: '0.2rem 0.6rem', backgroundColor: 'var(--bg-secondary, #f8f9fa)', color: priorityInfo.color, borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500', border: `1px solid ${priorityInfo.color}` }}>
              {priorityInfo.label}
            </span>
          </div>
        </div>
        
        {task.description && (
          <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary, #6c757d)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.description}
          </p>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary, #6c757d)' }}>
          <div>
            {task.assigned_user ? (
              <span>{task.assigned_user.full_name || task.assigned_user.username}</span>
            ) : (
              <span style={{ color: '#adb5bd' }}>👤 Sin asignar</span>
            )}
          </div>
          {dueDate && <div>📅 {dueDate}</div>}
        </div>
      </div>
    </Link>
  )
}

export default TaskItem