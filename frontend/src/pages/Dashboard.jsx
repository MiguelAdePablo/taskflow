import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import { useTheme } from '../hooks/useTheme'
import projectService from '../services/projectService'
import ProjectCard from '../components/ProjectCard'
import CreateProjectModal from '../components/CreateProjectModal'
import EditProfileModal from '../components/EditProfileModal'
import NotificationBell from '../components/NotificationBell'
import ThemeToggle from '../components/ThemeToggle'

function Dashboard() {
  const { user, logout } = useAuth()
  const { disconnectSocket } = useSocket()
 
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)
  
  useEffect(() => { loadProjects() }, [])

  const loadProjects = async () => {
    try {
      setLoading(true); setError('')
      const projectsData = await projectService.getMyProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error('Error cargando proyectos:', error)
      setError('No se pudieron cargar los proyectos. Intenta de nuevo.')
    } finally { setLoading(false) }
  }

  const handleProjectCreated = (newProject) => setProjects([newProject, ...projects])
  const handleProfileUpdated = (updatedUser) => window.location.reload()

  const handleLogout = async () => {
    disconnectSocket()
    await logout()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* ✅ HEADER: width: 100% para ocupar todo el ancho */}
      <header style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border-color)', 
        boxShadow: 'var(--shadow)',
        width: '100%'
      }}>
        {/* ✅ Contenedor sin margin: 0 auto, con width: 100% */}
        <div style={{ 
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',  // ← MOVIDO AQUÍ el padding
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box'  // ← IMPORTANTE: incluye padding en el ancho
        }}>
          {/* COLUMNA IZQUIERDA: Logo */}
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏠 TaskFlow
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Gestión colaborativa de tareas
            </p>
          </div>
          
          {/* COLUMNA DERECHA: Todo agrupado */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem'
          }}>

            {/* Info usuario */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                👋 Hola, {user?.full_name || user?.username}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {user?.email}
              </div>
            </div>
            
            {/* ✅ NUEVO: Contenedor vertical para los botones */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem'
              }}>
                <button 
                  onClick={() => setIsEditProfileModalOpen(true)} 
                  style={{ 
                    padding: '0.4rem 0.8rem', 
                    backgroundColor: 'transparent', 
                    color: 'var(--accent-blue)', 
                    border: '1px solid var(--accent-blue)', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    fontSize: '0.85rem', 
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }} 
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'white' }} 
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--accent-blue)' }}
                >
                  ✏️ Editar Perfil
                </button>

                <button 
                  onClick={handleLogout} 
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: 'var(--accent-red)', 
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

            {/* Columna vertical de iconos */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0rem', 
              alignItems: 'center',
            }}>
              <NotificationBell />
              <ThemeToggle />
            </div>

          </div>
        </div>
      </header>
      
      <main style={{ padding: '2rem' }}>
        <div className="container">
          <section style={{ marginBottom: '2rem' }}>
            <div className="grid-auto-fit">
              <StatCard icon="📁" label="Proyectos" value={projects.length} color="var(--accent-blue)" />
              <StatCard icon="✅" label="Total de miembros" value={projects.reduce((sum, p) => sum + (p.member_count || 0), 0)} color="var(--accent-green)" />
              <StatCard icon="👤" label="Tu rol principal" value="Owner" color="var(--accent-purple)" />
            </div>
          </section>
          
          <section>
            <div className="header-flex" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>📋 Mis Proyectos</h2>
              <button onClick={() => setIsModalOpen(true)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>➕</span> Nuevo Proyecto
              </button>
            </div>
            
            {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}><div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div><p>Cargando tus proyectos...</p></div>}
            
            {error && !loading && (
              <div style={{ padding: '1.5rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', textAlign: 'center', border: '1px solid #f5c6cb' }}>
                <p style={{ margin: '0 0 1rem 0' }}>❌ {error}</p>
                <button onClick={loadProjects} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🔄 Reintentar</button>
              </div>
            )}
            
            {!loading && !error && projects.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '2px dashed var(--border-color)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Aún no tienes proyectos</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Crea tu primer proyecto para empezar a organizar tus tareas</p>
                <button onClick={() => setIsModalOpen(true)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
                  ✨ Crear mi primer proyecto
                </button>
              </div>
            )}
            
            {!loading && !error && projects.length > 0 && (
              <div className="grid-auto-fit">
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

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: `4px solid ${color}`, boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: color }}>{value}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</div>
    </div>
  )
}

export default Dashboard