import { useState, useEffect } from 'react'
import userService from '../services/userService'
import projectService from '../services/projectService'

/**
 * ============================================================
 * COMPONENTE: AddMemberModal
 * ============================================================
 * 
 * Modal para buscar y añadir miembros a un proyecto.
 * Incluye un botón compacto para crear usuarios nuevos en modo standalone.
 */
function AddMemberModal({ isOpen, onClose, projectId, existingMemberIds = [], onMemberAdded }) {
  
  // ============================================================
  // 1. TODOS los Hooks van PRIMERO, sin condiciones.
  // ============================================================
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ============================================================
  // 2. Efectos y lógica
  // ============================================================
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    
    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true)
        const users = await userService.searchUsers(searchQuery)
        const filtered = users.filter(u => !existingMemberIds.includes(u.id))
        setSearchResults(filtered)
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
      
      if (onMemberAdded) {
        onMemberAdded()
      }
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message)
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

  /**
   * Abre una nueva pestaña con el formulario de registro en modo standalone
   */
  const handleOpenRegister = () => {
    window.open(
      '/register?standalone=1',
      '_blank',
      'width=500,height=700,left=200,top=100'
    )
  }

  // ============================================================
  // 3. Condición de retorno AL FINAL
  // ============================================================
  if (!isOpen) return null

  // ============================================================
  // 4. JSX del modal
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
          maxWidth: '550px',
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
          <h2 style={{ margin: 0, color: '#212529', fontSize: '1.3rem' }}>
            👥 Añadir Miembro
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
        
        {/* Mensajes */}
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
        
        {success && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {success}
          </div>
        )}
        
        {/* Campo de búsqueda */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
            🔍 Buscar usuario:
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Escribe username, email o nombre..."
            autoFocus
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '0.95rem',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
              Escribe al menos 2 caracteres
            </small>
          )}
        </div>
        
        {/* Resultados de búsqueda */}
        <div style={{ marginBottom: '1rem' }}>
          {searching && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>
              ⏳ Buscando...
            </div>
          )}
          
          {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '1.5rem', 
              color: '#6c757d',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}>
              <p style={{ margin: '0 0 0.75rem 0' }}>🔍 No se encontraron usuarios</p>
              {/* <button
                onClick={handleOpenRegister}
                style={{
                  padding: '0.4rem 0.9rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}
              >
                ✨ Crear usuario nuevo
              </button> */}
            </div>
          )}
          
          {!searching && searchResults.length > 0 && (
            <div>
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#495057',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Resultados ({searchResults.length})
              </div>
              {searchResults.map(user => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#212529', fontSize: '0.95rem' }}>
                      {user.full_name || user.username}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                      @{user.username}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user.id, user.full_name || user.username)}
                    disabled={adding}
                    style={{
                      padding: '0.4rem 0.9rem',
                      backgroundColor: adding ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: adding ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}
                  >
                    {adding ? '...' : '+ Añadir'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón compacto para crear usuarios nuevos */}
        <div style={{
          paddingTop: '1rem',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>
            ¿No encuentras a la persona?
          </span>
          <button
            onClick={handleOpenRegister}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: '#28a745',  // ✅ CAMBIADO: fondo verde
              color: 'white',               // ✅ CAMBIADO: texto blanco
              border: 'none',               // ✅ CAMBIADO: sin borde
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.color = '#28a745'
            }}
          >
            ✨ Crear usuario
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddMemberModal