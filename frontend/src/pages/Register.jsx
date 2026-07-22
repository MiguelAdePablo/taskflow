import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import authService from '../services/authService'
import { useState, useEffect } from 'react'  // ← Verificar esta línea

/**
 * ============================================================
 * PÁGINA: Register
 * ============================================================
 * 
 * Soporta DOS modos:
 * 
 * 1. Modo normal (/register):
 *    - Si estás logueado, te redirige al Dashboard
 *    - Después de registrarte, hace login automático
 * 
 * 2. Modo standalone (/register?standalone=1):
 *    - Muestra el formulario aunque estés logueado
 *    - NO hace login automático después del registro
 *    - NO toca el token actual (no corrompe tu sesión)
 *    - Útil para crear usuarios de prueba desde otra pestaña
 */
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
  
  // En modo normal: si ya está autenticado, redirigir al dashboard
  // En modo standalone: mostrar el formulario aunque esté autenticado
  if (isAuthenticated && !isStandalone) {
    navigate('/dashboard', { replace: true })
    return null
  }
  
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
    setSuccess('')
    setLoading(true)
    
    const { username, email, password, full_name } = formData
    
    // Validaciones básicas
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
        // ============================================================
        // MODO STANDALONE: Solo registrar, NO hacer login
        // ============================================================
        await authService.register({
          username,
          email,
          password,
          full_name: full_name || undefined
        })
        
        setSuccess(`✅ Usuario "${username}" creado exitosamente. Puedes cerrar esta pestaña.`)
        setFormData({ username: '', email: '', password: '', full_name: '' })
      } else {
        // ============================================================
        // MODO NORMAL: Registrar y hacer login automático
        // ============================================================
        const result = await register(username, email, password, full_name)
        
        if (result.success) {
          navigate('/dashboard', { replace: true })
        } else {
          setError(result.error)
        }
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  // Estilo diferente según el modo
  const containerStyle = isStandalone 
    ? { 
        maxWidth: '400px', 
        margin: '2rem auto', 
        padding: '1.5rem',
        border: '2px solid #28a745',
        borderRadius: '8px',
        backgroundColor: '#f8fff8'
      }
    : { 
        maxWidth: '400px', 
        margin: '2rem auto', 
        padding: '2rem',
        border: '1px solid #ddd',
        borderRadius: '8px'
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
      
      <h1 style={{ textAlign: 'center' }}>
        {isStandalone ? '✨ Crear Nuevo Usuario' : '📝 Registro'}
      </h1>
      
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
      
      {success && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Username:
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="miguel"
            disabled={loading || !!success}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            disabled={loading || !!success}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="full_name" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Nombre completo (opcional):
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Miguel Ángel"
            disabled={loading || !!success}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Contraseña:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            disabled={loading || !!success}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
        
        {!success && (
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#6c757d' : (isStandalone ? '#28a745' : '#007bff'),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Creando...' : (isStandalone ? '✨ Crear Usuario' : 'Registrarse')}
          </button>
        )}
      </form>
      
      {/* Enlaces diferentes según el modo */}
      {!isStandalone && (
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      )}
      
      {isStandalone && success && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
            Ahora vuelve a la pestaña original y busca al usuario en el modal.
          </p>
          <button
            onClick={() => window.close()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            Cerrar esta pestaña
          </button>
        </div>
      )}
    </div>
  )
}

export default Register