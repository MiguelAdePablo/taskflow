import { useState } from 'react'
import projectService from '../services/projectService'

/**
 * ============================================================
 * COMPONENTE: CreateProjectModal
 * ============================================================
 * 
 * Modal para crear un nuevo proyecto.
 * 
 * Props que recibe:
 * - isOpen: Booleano que indica si el modal está visible
 * - onClose: Función que se ejecuta al cerrar el modal
 * - onProjectCreated: Función que se ejecuta cuando se crea un proyecto
 * 
 * ¿Por qué usar un modal?
 * - No interrumpe el flujo del usuario
 * - Mantiene el contexto (sigue viendo el dashboard)
 * - Es más rápido que navegar a otra página
 */
function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null
  
  /**
   * Manejador de cambios en los inputs
   * Usa el atributo "name" del input para actualizar el estado
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Limpiar error cuando el usuario empieza a escribir
    if (error) setError('')
  }
  
  /**
   * Manejador del submit del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    // Validaciones del frontend
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
      // Llamar al servicio para crear el proyecto
      const newProject = await projectService.createProject(formData)
      
      // Notificar al componente padre que se creó un proyecto
      onProjectCreated(newProject)
      
      // Limpiar el formulario
      setFormData({ name: '', description: '' })
      
      // Cerrar el modal
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Manejador para cerrar el modal
   * Limpia el formulario y los errores
   */
  const handleClose = () => {
    setFormData({ name: '', description: '' })
    setError('')
    onClose()
  }
  
  return (
    <>
      {/* Overlay oscuro detrás del modal */}
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
        {/* Modal */}
        <div 
          onClick={(e) => e.stopPropagation()}  // Evitar cerrar al hacer clic dentro
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
          {/* Header del modal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: 0, color: '#212529' }}>
              🆕 Crear Nuevo Proyecto
            </h2>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6c757d',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          
          {/* Mensaje de error */}
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '1px solid #f5c6cb'
            }}>
              ❌ {error}
            </div>
          )}
          
          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="project-name"
                style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#212529'
                }}
              >
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
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
              <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
                {formData.name.length}/100 caracteres
              </small>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="project-description"
                style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#212529'
                }}
              >
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
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
                {formData.description.length}/500 caracteres
              </small>
            </div>
            
            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#6c757d',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: loading ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                {loading ? 'Creando...' : '✨ Crear Proyecto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateProjectModal