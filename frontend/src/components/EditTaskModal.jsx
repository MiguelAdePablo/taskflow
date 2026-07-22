import { useState, useEffect } from 'react'
import taskService from '../services/taskService'

/**
 * ============================================================
 * COMPONENTE: EditTaskModal
 * ============================================================
 * 
 * Modal para editar una tarea existente.
 * 
 * Props:
 * - isOpen: Booleano que indica si el modal está visible
 * - onClose: Función para cerrar el modal
 * - task: Objeto con los datos actuales de la tarea
 * - members: Lista de miembros del proyecto (para el selector de asignado)
 * - onTaskUpdated: Función callback para actualizar la lista en el padre
 */
function EditTaskModal({ isOpen, onClose, task, members = [], onTaskUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Cargar los datos actuales de la tarea cuando se abre el modal
  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        assigned_to: task.assigned_to ? task.assigned_to.toString() : ''
      })
      setError('')
    }
  }, [isOpen, task])

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.title.trim()) {
      setError('El título es obligatorio')
      setLoading(false)
      return
    }

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null
      }

      const updatedTask = await taskService.updateTask(task.id, taskData)
      
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask)
      }
      
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  return (
    <div 
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0 }}>✏️ Editar Tarea</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6c757d'
            }}
          >
            ×
          </button>
        </div>
        
        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Título *
            </label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Diseñar homepage"
              disabled={loading}
              maxLength={200}
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Descripción (opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe los detalles de la tarea..."
              disabled={loading}
              rows={3}
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '0.95rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                Prioridad
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  backgroundColor: '#f8f9fa',
                  color: '#212529',
                  boxSizing: 'border-box'
                }}
              >
                <option value="low">🟢 Baja</option>
                <option value="medium">🟡 Media</option>
                <option value="high">🔴 Alta</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
                Fecha límite (opcional)
              </label>
              <input
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Asignar a (opcional)
            </label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '0.95rem',
                backgroundColor: '#f8f9fa',
                color: '#212529',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Sin asignar</option>
              {members.map(member => (
                <option key={member.user_id} value={member.user_id}>
                  {member.user?.full_name || member.user?.username || 'Usuario'}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: 'white',
                color: '#6c757d',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              {loading ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaskModal