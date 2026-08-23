import { useState, useEffect } from 'react'
import taskService from '../services/taskService'

// ============================================================
// PROPÓSITO: Modal para editar una tarea existente.
// CRÍTICO: Se corrige la serialización de la fecha (mismo bug que en CreateTaskModal). Se usa `${date}T00:00:00` para evitar que la conversión a UTC cambie el día seleccionado por el usuario.
// ============================================================
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

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        assigned_to: task.assigned_to != null ? String(task.assigned_to) : ''
      })
      setError('')
    }
  }, [isOpen, task])

  if (!isOpen) return null

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

      const updatedTask = await taskService.updateTask(task.id, taskData)
      onTaskUpdated?.(updatedTask)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al actualizar la tarea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-primary, white)', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary, #212529)' }}>✏️ Editar Tarea</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary, #6c757d)' }}>×</button>
        </div>
        
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-primary, #212529)' }}>Título *</label>
            <input name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Ej: Diseñar homepage" disabled={loading} maxLength={200} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }} autoFocus />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-primary, #212529)' }}>Descripción (opcional)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe los detalles..." disabled={loading} rows={3} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-primary, #212529)' }}>Prioridad</label>
              <select name="priority" value={formData.priority} onChange={handleChange} disabled={loading} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)', boxSizing: 'border-box' }}>
                <option value="low">🟢 Baja</option>
                <option value="medium">🟡 Media</option>
                <option value="high">🔴 Alta</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-primary, #212529)' }}>Fecha límite</label>
              <input name="due_date" type="date" value={formData.due_date} onChange={handleChange} disabled={loading} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }} />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-primary, #212529)' }}>Asignar a</label>
            <select name="assigned_to" value={formData.assigned_to} onChange={handleChange} disabled={loading} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)', boxSizing: 'border-box' }}>
              <option value="">Sin asignar</option>
              {members.map(member => (
                <option key={member.user_id} value={member.user_id}>
                  {member.user?.full_name || member.user?.username || 'Usuario'}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ padding: '0.6rem 1.25rem', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-secondary, #6c757d)', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.25rem', backgroundColor: loading ? 'var(--text-secondary, #6c757d)' : 'var(--primary-color, #007bff)', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
              {loading ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaskModal