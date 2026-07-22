import { useState, useEffect } from 'react'
import userService from '../services/userService'
import { useAuth } from '../hooks/useAuth'

/**
 * ============================================================
 * COMPONENTE: EditProfileModal
 * ============================================================
 * 
 * Modal para editar el perfil del usuario actual.
 * 
 * Props:
 * - isOpen: Booleano que indica si el modal está visible
 * - onClose: Función para cerrar el modal
 * - onProfileUpdated: Función callback para actualizar el contexto
 */
function EditProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        full_name: user.full_name || '',
        avatar_url: user.avatar_url || ''
      })
      setError('')
    }
  }, [isOpen, user])

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

    try {
      const updatedUser = await userService.updateUserProfile(user.id, {
        full_name: formData.full_name.trim() || null,
        avatar_url: formData.avatar_url.trim() || null
      })

      if (onProfileUpdated) {
        onProfileUpdated(updatedUser)
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0 }}>✏️ Editar Perfil</h2>
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
              Nombre completo (opcional)
            </label>
            <input
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Miguel Ángel de Pablo"
              disabled={loading}
              maxLength={120}
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
              URL del avatar (opcional)
            </label>
            <input
              name="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              disabled={loading}
              maxLength={255}
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
            <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block', fontSize: '0.8rem' }}>
              Pega la URL de una imagen de perfil
            </small>
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
                backgroundColor: loading ? '#6c757d' : '#28a745',
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

export default EditProfileModal