import { useState } from 'react'
import taskService from '../services/taskService'

/**
 * ============================================================
 * COMPONENTE: CreateTaskModal
 * ============================================================
 * 
 * Modal para crear una nueva tarea en un proyecto.
 * 
 * Props:
 * - isOpen: Booleano que indica si el modal está visible
 * - onClose: Función para cerrar el modal
 * - projectId: ID del proyecto
 * - members: Lista de miembros del proyecto (para el selector de asignado)
 * - onTaskCreated: Función que se ejecuta cuando se crea la tarea
 */
function CreateTaskModal({ isOpen, onClose, projectId, members = [], onTaskCreated }) {
  
  // ============================================================
  // 1. TODOS los Hooks van PRIMERO, sin condiciones.
  // ============================================================
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // ============================================================
  // 2. Funciones auxiliares (sin hooks)
  // ============================================================
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
    
    // Validaciones del frontend
    if (!formData.title.trim()) {
      setError('El título es obligatorio')
      setLoading(false)
      return
    }
    
    try {
      // Preparar los datos
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null
      }
      
      const newTask = await taskService.createTask(projectId, taskData)
      
      // Notificar al componente padre
      if (onTaskCreated) {
        onTaskCreated(newTask)
      }
      
      // Limpiar formulario y cerrar
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to: ''
      })
      onClose()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      assigned_to: ''
    })
    setError('')
    onClose()
  }

  // ============================================================
  // 3. La condición de retorno va AL FINAL, justo antes del JSX.
  // Esto garantiza que si en el futuro agregas un useEffect, no rompa las reglas de React.
  // ============================================================
  if (!isOpen) return null
  
  // ============================================================
  // 4. El JSX del modal
  // ============================================================
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
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0 }}>✨ Crear Nueva Tarea</h2>
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
            padding: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>
          
          {/* Descripción */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {/* Prioridad y Fecha (en la misma fila) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Prioridad
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: 'white',  // ← Asegurar fondo blanco
                  color: '#212529',           // ← Texto oscuro
                  appearance: 'auto'          // ← Usar estilo nativo del navegador
                }}
              >
                <option value="low">🟢 Baja</option>
                <option value="medium">🟡 Media</option>
                <option value="high">🔴 Alta</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                  padding: '0.75rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          
          {/* Asignado a */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Asignar a (opcional)
            </label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: 'white',  // ← Asegurar fondo blanco
                color: '#212529',           // ← Texto oscuro
                appearance: 'auto'          // ← Usar estilo nativo del navegador
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
          
          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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
                cursor: 'pointer',
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
              {loading ? 'Creando...' : '✨ Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal