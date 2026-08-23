import { useState } from 'react'
import projectService from '../services/projectService'

// ============================================================
// PROPÓSITO: Modal para crear un nuevo proyecto.
// CRÍTICO: Se usa desestructuración en `handleChange` para mayor limpieza y se valida la longitud del nombre antes de enviar la petición.
// ============================================================
function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
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
      const newProject = await projectService.createProject({
        name: trimmedName,
        description: formData.description.trim() || null
      })
      
      onProjectCreated?.(newProject)
      setFormData({ name: '', description: '' })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al crear el proyecto')
    } finally {
      setLoading(false)
    }
  }
  
  const handleClose = () => {
    setFormData({ name: '', description: '' })
    setError('')
    onClose()
  }
  
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
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary, #212529)' }}>🆕 Crear Nuevo Proyecto</h2>
          <button onClick={handleClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary, #6c757d)', padding: 0, width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ×
          </button>
        </div>
        
        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f5c6cb' }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="project-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>
              Nombre del proyecto *
            </label>
            <input
              id="project-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Rediseño del sitio web"
              disabled={loading}
              maxLength={100}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }}
              autoFocus
            />
            <small style={{ color: 'var(--text-secondary, #6c757d)', marginTop: '0.25rem', display: 'block' }}>
              {formData.name.length}/100 caracteres
            </small>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="project-description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>
              Descripción (opcional)
            </label>
            <textarea
              id="project-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe brevemente el objetivo del proyecto..."
              disabled={loading}
              maxLength={500}
              rows={4}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }}
            />
            <small style={{ color: 'var(--text-secondary, #6c757d)', marginTop: '0.25rem', display: 'block' }}>
              {formData.description.length}/500 caracteres
            </small>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleClose} disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-secondary, #6c757d)', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: loading ? 'var(--text-secondary, #6c757d)' : 'var(--primary-color, #007bff)', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500' }}>
              {loading ? 'Creando...' : '✨ Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal