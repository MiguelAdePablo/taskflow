import { useState, useEffect } from 'react'
import userService from '../services/userService'
import projectService from '../services/projectService'

// ============================================================
// PROPÓSITO: Modal para buscar y añadir miembros a un proyecto.
// CRÍTICO: Se corrige el efecto hover del botón "Crear usuario" para que use variables CSS en lugar de hardcodear 'white', previniendo rupturas visuales en modo oscuro.
// ============================================================
function AddMemberModal({ isOpen, onClose, projectId, existingMemberIds = [], onMemberAdded }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    
    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true)
        const users = await userService.searchUsers(searchQuery)
        setSearchResults(users.filter(u => !existingMemberIds.includes(u.id)))
      } catch (error) {
        console.error('Error buscando usuarios:', error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, existingMemberIds])

  const handleAddMember = async (userId, username) => {
    try {
      setAdding(true)
      setError('')
      setSuccess('')
      
      await projectService.addMember(projectId, userId, 'member')
      setSuccess(`✅ ${username} ha sido añadido al proyecto`)
      setSearchQuery('')
      setSearchResults([])
      onMemberAdded?.()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Error al añadir miembro')
    } finally {
      setAdding(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setError('')
    setSuccess('')
    onClose()
  }

  const handleOpenRegister = () => {
    window.open('/register?standalone=1', '_blank', 'width=500,height=700,left=200,top=100')
  }

  if (!isOpen) return null

  return (
    <div onClick={handleClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-primary, white)', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary, #212529)', fontSize: '1.3rem' }}>👥 Añadir Miembro</h2>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary, #6c757d)' }}>×</button>
        </div>
        
        {error && <div style={{ padding: '0.75rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>❌ {error}</div>}
        {success && <div style={{ padding: '0.75rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-primary, #212529)' }}>🔍 Buscar usuario:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Escribe username, email o nombre..."
            autoFocus
            style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color, #ced4da)', borderRadius: '4px', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: 'var(--bg-primary, white)', color: 'var(--text-primary, #212529)' }}
          />
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <small style={{ color: 'var(--text-secondary, #6c757d)', marginTop: '0.25rem', display: 'block' }}>Escribe al menos 2 caracteres</small>
          )}
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          {searching && <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary, #6c757d)' }}>⏳ Buscando...</div>}
          
          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary, #6c757d)', backgroundColor: 'var(--bg-secondary, #f8f9fa)', borderRadius: '4px' }}>
              <p style={{ margin: '0 0 0.75rem 0' }}>🔍 No se encontraron usuarios</p>
            </div>
          )}
          
          {!searching && searchResults.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary, #495057)', marginBottom: '0.5rem', fontWeight: '500' }}>Resultados ({searchResults.length})</div>
              {searchResults.map(user => (
                <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', backgroundColor: 'var(--bg-secondary, #f8f9fa)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary, #212529)', fontSize: '0.95rem' }}>{user.full_name || user.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6c757d)' }}>@{user.username}</div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user.id, user.full_name || user.username)}
                    disabled={adding}
                    style={{ padding: '0.4rem 0.9rem', backgroundColor: adding ? 'var(--text-secondary, #6c757d)' : 'var(--primary-color, #007bff)', color: 'white', border: 'none', borderRadius: '4px', cursor: adding ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                  >
                    {adding ? '...' : '+ Añadir'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color, #e0e0e0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary, #6c757d)', fontSize: '0.85rem' }}>¿No encuentras a la persona?</span>
          <button
            onClick={handleOpenRegister}
            style={{ padding: '0.35rem 0.75rem', backgroundColor: 'var(--success-color, #28a745)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            ✨ Crear usuario
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddMemberModal