import { useState, useEffect } from 'react'
import projectService from '../services/projectService'

/**
 * ============================================================
 * COMPONENTE: EditProjectModal
 * ============================================================
 * 
 * Modal para editar un proyecto existente.
 * Solo el owner puede usar este modal.
 * 
 * Props:
 * - isOpen: Booleano que indica si el modal está visible
 * - onClose: Función para cerrar el modal
 * - project: Objeto con los datos actuales del proyecto
 * - onProjectUpdated: Función callback para actualizar la lista en el padre
 */
function EditProjectModal({ isOpen, onClose, project, onProjectUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Cargar los datos actuales del proyecto cuando se abre el modal
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

    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre del proyecto es obligatorio')
      setLoading(false)
      return
    }

    if (formData.name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      setLoading(false)
      return
    }

    try {
      const updatedProject = await projectService.updateProject(project.id, formData)
      
      if (onProjectUpdated) {
        onProjectUpdated(updatedProject)
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
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, color: '#212529' }}>
            ✏️ Editar Proyecto
          </h2>
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
              Nombre del proyecto *
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Rediseño del sitio web"
              disabled={loading}
              maxLength={100}
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
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Descripción (opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe brevemente el objetivo del proyecto..."
              disabled={loading}
              rows={4}
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

export default EditProjectModal