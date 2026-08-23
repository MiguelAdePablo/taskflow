import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import authService from '../services/authService'

// ============================================================
// PROPÓSITO: Página de registro de usuarios con soporte para modo "standalone" (creación rápida sin afectar la sesión actual).
// CRÍTICO: Se valida la longitud de la contraseña en el frontend antes de enviar la petición, ahorrando recursos de red y proporcionando feedback inmediato al usuario.
// ============================================================
function Register() {
  const [searchParams] = useSearchParams()
  const isStandalone = searchParams.get('standalone') === '1'
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  if (isAuthenticated && !isStandalone) {
    navigate('/dashboard', { replace: true })
    return null
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    const { username, email, password, full_name } = formData
    
    if (!username || !email || !password) {
      setError('Username, email y contraseña son obligatorios')
      setLoading(false)
      return
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }
    
    try {
      if (isStandalone) {
        await authService.register({
          username,
          email,
          password,
          full_name: full_name || undefined
        })
        setSuccess(`✅ Usuario "${username}" creado exitosamente. Puedes cerrar esta pestaña.`)
        setFormData({ username: '', email: '', password: '', full_name: '' })
      } else {
        const result = await register(username, email, password, full_name)
        if (result.success) {
          navigate('/dashboard', { replace: true })
        } else {
          setError(result.error || 'Error al registrar el usuario')
        }
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }
  
  const containerStyle = isStandalone 
    ? { 
        maxWidth: '400px', 
        margin: '2rem auto', 
        padding: '1.5rem',
        border: '2px solid var(--accent-green, #28a745)',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-secondary, #f8f9fa)'
      }
    : { 
        maxWidth: '400px', 
        margin: '4rem auto', 
        padding: '2rem',
        border: '1px solid var(--border-color, #ddd)',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-primary, #ffffff)',
        boxShadow: 'var(--shadow, 0 4px 6px rgba(0,0,0,0.1))'
      }
  
  return (
    <div style={containerStyle}>
      {isStandalone && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          color: '#004085'
        }}>
          💡 <strong>Modo creación rápida:</strong> Este usuario se creará sin afectar tu sesión actual.
        </div>
      )}
      
      <h1 style={{ textAlign: 'center', color: 'var(--text-primary, #212529)', marginBottom: '1.5rem' }}>
        {isStandalone ? '✨ Crear Nuevo Usuario' : '📝 Registro'}
      </h1>
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f5c6cb' }}>
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div style={{ padding: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #c3e6cb' }}>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>Username:</label>
          <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} placeholder="miguel" disabled={loading || !!success} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--input-border, #ced4da)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: 'var(--input-bg, #ffffff)', color: 'var(--text-primary, #212529)' }} />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>Email:</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" disabled={loading || !!success} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--input-border, #ced4da)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: 'var(--input-bg, #ffffff)', color: 'var(--text-primary, #212529)' }} />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="full_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>Nombre completo (opcional):</label>
          <input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} placeholder="Miguel Ángel" disabled={loading || !!success} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--input-border, #ced4da)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: 'var(--input-bg, #ffffff)', color: 'var(--text-primary, #212529)' }} />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary, #212529)' }}>Contraseña:</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" disabled={loading || !!success} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--input-border, #ced4da)', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: 'var(--input-bg, #ffffff)', color: 'var(--text-primary, #212529)' }} />
        </div>
        
        {!success && (
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', backgroundColor: loading ? 'var(--text-muted, #6c757d)' : (isStandalone ? 'var(--accent-green, #28a745)' : 'var(--accent-blue, #007bff)'), color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500', transition: 'background-color 0.2s' }}>
            {loading ? 'Creando...' : (isStandalone ? '✨ Crear Usuario' : 'Registrarse')}
          </button>
        )}
      </form>
      
      {!isStandalone && (
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary, #6c757d)' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent-blue, #007bff)', textDecoration: 'none', fontWeight: '500' }}>Inicia sesión aquí</Link>
        </p>
      )}
      
      {isStandalone && success && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary, #6c757d)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Ahora vuelve a la pestaña original y busca al usuario en el modal.
          </p>
          <button onClick={() => window.close()} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--text-muted, #6c757d)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
            Cerrar esta pestaña
          </button>
        </div>
      )}
    </div>
  )
}

export default Register