import { useState } from 'react'
import taskService from '../services/taskService'

// ============================================================
// PROPÓSITO: Modal para crear una nueva tarea en un proyecto específico.
// CRÍTICO: Se corrige la serialización de la fecha. En lugar de `new Date().toISOString()` (que aplica la zona horaria local y puede cambiar el día), se usa `${date}T00:00:00` para garantizar que el backend reciba el día exacto seleccionado por el usuario.
// ============================================================
function CreateTaskModal({ isOpen, onClose, projectId, members = [], onTaskCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.title.trim()) {
      setError('El título es obligatorio')
      return
    }
    
    setLoading(true)
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        due_date: formData.due_date ? `${formData.due_date}T00:00:00` : null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null
      }
      
      const newTask = await taskService.createTask(projectId, taskData)
      
      if (onTaskCreated) onTaskCreated(newTask)
      
      setFormData({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al crear la tarea')
    } finally {
      setLoading(false)
    }
  }
  
  const handleClose = () => {
    setFormData({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' })
    setError('')
    onClose()
  }

  if (!isOpen) return null
  
  return (
    <div 
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
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
          backgroundColor: 'var(--bg-primary, white)',
          borderRadius: '8px',
          padding: '2rem',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary, #212529)' }}>✨ Crear Nueva Tarea</h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary, #6c757d)' }}>
            ×
          </button>
        </div>
        
        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>Título *</label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Diseñar homepage"
              disabled={loading}
              maxLength={200}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }}
              autoFocus
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>Descripción (opcional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe los detalles de la tarea..."
              disabled={loading}
              rows={3}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>Prioridad</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '1rem', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }}
              >
                <option value="low">🟢 Baja</option>
                <option value="medium">🟡 Media</option>
                <option value="high">🔴 Alta</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>Fecha límite (opcional)</label>
              <input
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>Asignar a (opcional)</label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '1rem', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }}
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
              style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-secondary, #6c757d)', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: loading ? 'var(--text-secondary, #6c757d)' : 'var(--primary-color, #007bff)', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500' }}
            >
              {loading ? 'Creando...' : '✨ Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal