import { useState, useEffect } from 'react'
import projectService from '../services/projectService'

// ============================================================
// PROPÓSITO: Modal para editar un proyecto existente.
// CRÍTICO: Se eliminó la lectura directa del DOM (`document.documentElement`) para el tema, confiando únicamente en las variables CSS nativas para evitar parpadeos (flickering) y mejorar el rendimiento.
// ============================================================
function EditProjectModal({ isOpen, onClose, project, onProjectUpdated }) {
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        name: project.name || '',
        description: project.description || ''
      })
      setError('')
    }
  }, [isOpen, project])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      setError('El nombre del proyecto es obligatorio')
      return
    }
    if (trimmedName.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }

    setLoading(true)
    try {
      const updatedProject = await projectService.updateProject(project.id, {
        name: trimmedName,
        description: formData.description.trim() || null
      })
      onProjectUpdated?.(updatedProject)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al actualizar el proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary, white)', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg, 0 10px 40px rgba(0,0,0,0.2))', border: '1px solid var(--border-color, #e0e0e0)', color: 'var(--text-primary, #212529)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>✏️ Editar Proyecto</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary, #6c757d)' }}>×</button>
        </div>
        
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Nombre del proyecto *</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Rediseño del sitio web"
              disabled={loading}
              maxLength={100}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--input-border, #ced4da)', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: 'var(--input-bg, white)', color: 'var(--text-primary, #212529)' }}
              autoFocus
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Descripción (opcional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe brevemente el objetivo del proyecto..."
              disabled={loading}
              rows={4}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--input-border, #ced4da)', borderRadius: '4px', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', backgroundColor: 'var(--input-bg, white)', color: 'var(--text-primary, #212529)' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ padding: '0.6rem 1.25rem', backgroundColor: 'var(--bg-tertiary, #f8f9fa)', color: 'var(--text-secondary, #6c757d)', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.25rem', backgroundColor: loading ? 'var(--text-muted, #6c757d)' : 'var(--accent-blue, #007bff)', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
              {loading ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProjectModal