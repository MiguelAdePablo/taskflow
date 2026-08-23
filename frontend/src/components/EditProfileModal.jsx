import { useState, useEffect } from 'react'
import userService from '../services/userService'
import { useAuth } from '../hooks/useAuth'

// ============================================================
// PROPÓSITO: Modal para editar el perfil del usuario autenticado.
// CRÍTICO: Se unificaron los estilos inline con variables CSS (`var(--...)`) para garantizar la compatibilidad total con el modo oscuro/claro, eliminando hardcodeos como 'white' o '#ced4da'.
// ============================================================
function EditProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({ full_name: '', avatar_url: '' })
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
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
      onProfileUpdated?.(updatedUser)
      onClose()
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-primary, white)', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg, 0 10px 40px rgba(0,0,0,0.2))' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary, #212529)' }}>✏️ Editar Perfil</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary, #6c757d)' }}>×</button>
        </div>
        
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-primary, #212529)' }}>Nombre completo (opcional)</label>
            <input
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Miguel Ángel de Pablo"
              disabled={loading}
              maxLength={120}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--input-border, #ced4da)', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: 'var(--input-bg, white)', color: 'var(--text-primary, #212529)' }}
              autoFocus
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-primary, #212529)' }}>URL del avatar (opcional)</label>
            <input
              name="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              disabled={loading}
              maxLength={255}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--input-border, #ced4da)', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: 'var(--input-bg, white)', color: 'var(--text-primary, #212529)' }}
            />
            <small style={{ color: 'var(--text-secondary, #6c757d)', marginTop: '0.25rem', display: 'block', fontSize: '0.8rem' }}>
              Pega la URL de una imagen de perfil
            </small>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ padding: '0.6rem 1.25rem', backgroundColor: 'var(--bg-tertiary, #f8f9fa)', color: 'var(--text-secondary, #6c757d)', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.25rem', backgroundColor: loading ? 'var(--text-muted, #6c757d)' : 'var(--success-color, #28a745)', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
              {loading ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal