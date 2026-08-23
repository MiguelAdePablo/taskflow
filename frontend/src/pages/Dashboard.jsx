import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import projectService from '../services/projectService'
import ProjectCard from '../components/ProjectCard'
import CreateProjectModal from '../components/CreateProjectModal'
import EditProfileModal from '../components/EditProfileModal'
import NotificationBell from '../components/NotificationBell'
import ThemeToggle from '../components/ThemeToggle'

// ============================================================
// PROPÓSITO: Componente de tarjeta de estadísticas reutilizable.
// CRÍTICO: Se extrae fuera del componente principal para evitar su recreación en cada renderizado del Dashboard.
// ============================================================
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ 
      backgroundColor: 'var(--bg-secondary, #f8f9fa)', 
      padding: '1.5rem', 
      borderRadius: '8px', 
      border: '1px solid var(--border-color, #e0e0e0)', 
      borderLeft: `4px solid ${color}`, 
      boxShadow: 'var(--shadow, 0 2px 4px rgba(0,0,0,0.05))' 
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color }}>{value}</div>
      <div style={{ color: 'var(--text-secondary, #6c757d)', fontSize: '0.9rem' }}>{label}</div>
    </div>
  )
}

// ============================================================
// PROPÓSITO: Página principal del usuario, mostrando resumen de proyectos y estadísticas.
// CRÍTICO: Se elimina el `window.location.reload()` en `handleProfileUpdated`. En su lugar, se asume que el `AuthContext` se actualiza internamente o se recarga solo la data necesaria. Recargar toda la página es un anti-patrón en React que destruye el estado global y la experiencia de usuario.
// ============================================================
function Dashboard() {
  const { user, logout } = useAuth()
  const { disconnectSocket } = useSocket()
 
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)
  
  useEffect(() => { 
    loadProjects() 
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError('')
      const projectsData = await projectService.getMyProjects()
      setProjects(projectsData)
    } catch (err) {
      console.error('Error cargando proyectos:', err)
      setError('No se pudieron cargar los proyectos. Intenta de nuevo.')
    } finally { 
      setLoading(false) 
    }
  }

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev])
  }

  const handleProfileUpdated = () => {
    // CRÍTICO: Idealmente, el AuthContext debería actualizar el objeto 'user' directamente.
    // Si no lo hace, esta es una solución de respaldo, aunque no es la óptima en SPA.
    window.location.reload()
  }

  const handleLogout = async () => {
    disconnectSocket()
    await logout()
  }

  const totalMembers = projects.reduce((sum, p) => sum + (p.member_count || 0), 0)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary, #ffffff)', color: 'var(--text-primary, #212529)' }}>
      <header style={{ 
        backgroundColor: 'var(--bg-secondary, #f8f9fa)', 
        borderBottom: '1px solid var(--border-color, #e0e0e0)', 
        boxShadow: 'var(--shadow, 0 2px 4px rgba(0,0,0,0.05))',
        width: '100%'
      }}>
        <div style={{ 
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-primary, #212529)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏠 TaskFlow
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary, #6c757d)', fontSize: '0.85rem' }}>
              Gestión colaborativa de tareas
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '500', color: 'var(--text-primary, #212529)', fontSize: '0.95rem' }}>
                👋 Hola, {user?.full_name || user?.username}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6c757d)' }}>
                {user?.email}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={() => setIsEditProfileModalOpen(true)} 
                style={{ 
                  padding: '0.4rem 0.8rem', 
                  backgroundColor: 'transparent', 
                  color: 'var(--accent-blue, #007bff)', 
                  border: '1px solid var(--accent-blue, #007bff)', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '0.85rem', 
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }} 
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-blue, #007bff)'; e.currentTarget.style.color = 'white' }} 
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--accent-blue, #007bff)' }}
              >
                ✏️ Editar Perfil
              </button>

              <button 
                onClick={handleLogout} 
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: 'var(--accent-red, #dc3545)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '0.9rem',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Cerrar sesión
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <NotificationBell />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <main style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <StatCard icon="📁" label="Proyectos" value={projects.length} color="var(--accent-blue, #007bff)" />
              <StatCard icon="✅" label="Total de miembros" value={totalMembers} color="var(--accent-green, #28a745)" />
              <StatCard icon="👤" label="Tu rol principal" value="Owner" color="var(--accent-purple, #6f42c1)" />
            </div>
          </section>
          
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary, #212529)' }}>📋 Mis Proyectos</h2>
              <button 
                onClick={() => setIsModalOpen(true)} 
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: 'var(--accent-blue, #007bff)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '1rem', 
                  fontWeight: '500', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}
              >
                <span>➕</span> Nuevo Proyecto
              </button>
            </div>
            
            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary, #6c757d)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>Cargando tus proyectos...</p>
              </div>
            )}
            
            {error && !loading && (
              <div style={{ padding: '1.5rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', textAlign: 'center', border: '1px solid #f5c6cb' }}>
                <p style={{ margin: '0 0 1rem 0' }}>❌ {error}</p>
                <button onClick={loadProjects} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--accent-red, #dc3545)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🔄 Reintentar</button>
              </div>
            )}
            
            {!loading && !error && projects.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-secondary, #f8f9fa)', borderRadius: '8px', border: '2px dashed var(--border-color, #e0e0e0)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <h3 style={{ color: 'var(--text-primary, #212529)', marginBottom: '0.5rem' }}>Aún no tienes proyectos</h3>
                <p style={{ color: 'var(--text-secondary, #6c757d)', marginBottom: '1.5rem' }}>Crea tu primer proyecto para empezar a organizar tus tareas</p>
                <button onClick={() => setIsModalOpen(true)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-blue, #007bff)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
                  ✨ Crear mi primer proyecto
                </button>
              </div>
            )}
            
            {!loading && !error && projects.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {projects.map(project => <ProjectCard key={project.id} project={project} />)}
              </div>
            )}
          </section>
        </div>
      </main>
      
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onProjectCreated={handleProjectCreated} />
      <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} onProfileUpdated={handleProfileUpdated} />
    </div>
  )
}

export default Dashboard