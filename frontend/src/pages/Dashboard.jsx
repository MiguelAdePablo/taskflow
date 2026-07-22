import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import projectService from '../services/projectService'
import ProjectCard from '../components/ProjectCard'
import CreateProjectModal from '../components/CreateProjectModal'
import EditProfileModal from '../components/EditProfileModal'

function Dashboard() {
  const { user, logout } = useAuth()
  
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // ✅ NUEVO: Estado para modal de edición de perfil
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
    } catch (error) {
      console.error('Error cargando proyectos:', error)
      setError('No se pudieron cargar los proyectos. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects])
  }

  // ✅ NUEVO: Callback para cuando se actualiza el perfil
  const handleProfileUpdated = (updatedUser) => {
    // La actualización del contexto se maneja en EditProfileModal
    // Aquí solo recargamos para reflejar los cambios
    window.location.reload()
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      {/* ✅ MODIFICADO: Header con botón de editar perfil */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#212529' }}>
            🏠 TaskFlow
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
            Gestión colaborativa de tareas
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '500', color: '#212529' }}>
              👋 Hola, {user?.full_name || user?.username}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
              {user?.email}
            </div>
          </div>
          
          {/* ✅ NUEVO: Botón para editar perfil */}
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            style={{
              padding: '0.4rem 0.8rem',
              backgroundColor: 'white',
              color: '#007bff',
              border: '1px solid #007bff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.color = '#007bff'
            }}
          >
            ✏️ Editar Perfil
          </button>
          
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <section style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <StatCard 
              icon="📁" 
              label="Proyectos" 
              value={projects.length} 
              color="#007bff"
            />
            <StatCard 
              icon="✅" 
              label="Total de miembros" 
              value={projects.reduce((sum, p) => sum + (p.member_count || 0), 0)}
              color="#28a745"
            />
            <StatCard 
              icon="👤" 
              label="Tu rol principal" 
              value="Owner" 
              color="#6f42c1"
            />
          </div>
        </section>
        
        <section>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h2 style={{ margin: 0, color: '#212529' }}>
              📋 Mis Proyectos
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
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
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <p>Cargando tus proyectos...</p>
            </div>
          )}
          
          {error && !loading && (
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #f5c6cb'
            }}>
              <p style={{ margin: '0 0 1rem 0' }}>❌ {error}</p>
              <button
                onClick={loadProjects}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                 Reintentar
              </button>
            </div>
          )}
          
          {!loading && !error && projects.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '2px dashed #ced4da'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ color: '#212529', marginBottom: '0.5rem' }}>
                Aún no tienes proyectos
              </h3>
              <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                Crea tu primer proyecto para empezar a organizar tus tareas
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ✨ Crear mi primer proyecto
              </button>
            </div>
          )}
          
          {!loading && !error && projects.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      </main>
      
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
      
      {/* ✅ NUEVO: Modal de edición de perfil */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      borderLeft: `4px solid ${color}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: color }}>
        {value}
      </div>
      <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
        {label}
      </div>
    </div>
  )
}

export default Dashboard