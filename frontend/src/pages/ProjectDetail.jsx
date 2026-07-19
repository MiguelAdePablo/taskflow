import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import projectService from '../services/projectService'
import taskService from '../services/taskService'
import MemberCard from '../components/MemberCard'
import AddMemberModal from '../components/AddMemberModal'
import TaskItem from '../components/TaskItem'
import CreateTaskModal from '../components/CreateTaskModal'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: ''
  })

  useEffect(() => {
    loadProjectData()
  }, [id])

  useEffect(() => {
    if (project) {
      loadTasks()
    }
  }, [project, filters])

  const loadProjectData = async () => {
    try {
      setLoading(true)
      setError('')
      const projectData = await projectService.getProject(id)
      setProject(projectData)
    } catch (error) {
      console.error('Error cargando proyecto:', error)
      setError(error.message || 'No se pudo cargar el proyecto')
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const activeFilters = {}
      if (filters.status) activeFilters.status = filters.status
      if (filters.priority) activeFilters.priority = filters.priority
      if (filters.assigned_to) activeFilters.assigned_to = parseInt(filters.assigned_to)
      
      const tasksData = await taskService.getProjectTasks(id, activeFilters)
      setTasks(tasksData)
    } catch (error) {
      console.error('Error cargando tareas:', error)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const clearFilters = () => {
    setFilters({ status: '', priority: '', assigned_to: '' })
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres expulsar a este miembro?')) return
    
    try {
      await projectService.removeMember(id, userId)
      await loadProjectData()
    } catch (error) {
      alert('Error al eliminar miembro: ' + error.message)
    }
  }

  const handleMemberAdded = async () => {
    await loadProjectData()
  }

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks])
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: '#6c757d' }}>
        ⏳ Cargando proyecto...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Volver al Dashboard
        </button>
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Proyecto no encontrado</h2>
        <Link to="/dashboard">Volver al Dashboard</Link>
      </div>
    )
  }

  // ✅ Lógica de permisos robusta
  const isOwner = project && user && project.owner_id === user.id
  
  // Debug en consola para que veas exactamente qué está pasando
  console.log("🔍 [DEBUG ProjectDetail] Usuario actual ID:", user?.id)
  console.log("🔍 [DEBUG ProjectDetail] Owner del proyecto ID:", project?.owner_id)
  console.log("🔍 [DEBUG ProjectDetail] ¿Es owner?:", isOwner)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', padding: '1rem 2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/dashboard" style={{ color: '#007bff', textDecoration: 'none' }}>
            ← Volver al Dashboard
          </Link>
        </div>
      </header>
      
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0', color: '#212529' }}>📁 {project.name}</h1>
              <p style={{ margin: 0, color: '#6c757d' }}>{project.description || 'Sin descripción'}</p>
            </div>
            {isOwner && (
              <span style={{ padding: '0.5rem 1rem', backgroundColor: '#f3e8ff', color: '#6f42c1', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '500' }}>
                👑 Eres el owner
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '2rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0', fontSize: '0.9rem', color: '#6c757d' }}>
            <span>👥 {project.member_count || project.members?.length || 0} miembros</span>
            <span>📅 Creado: {project.created_at ? new Date(project.created_at).toLocaleDateString('es-ES') : 'Fecha desconocida'}</span>
          </div>
        </section>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          
          {/* Columna izquierda: Miembros */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                👥 Miembros ({project.members?.length || 0})
              </h2>
              
              {/* ✅ AQUÍ ESTÁ EL CAMBIO: Si es owner muestra el botón, si no, muestra un mensaje explicativo */}
              {isOwner ? (
                <button
                  onClick={() => setIsAddMemberModalOpen(true)}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  + Añadir
                </button>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#6c757d', fontStyle: 'italic' }}>
                  (Solo el owner puede añadir)
                </span>
              )}
            </div>
            
            <div>
              {project.members?.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onRemove={isOwner ? handleRemoveMember : null}
                />
              ))}
            </div>
          </section>
          
          {/* Columna derecha: Tareas */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                ✅ Tareas ({tasks.length})
              </h2>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                + Nueva Tarea
              </button>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: '#495057' }}>Estado</label>
                  <select name="status" value={filters.status} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.9rem' }}>
                    <option value="">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En progreso</option>
                    <option value="completed">Completada</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: '#495057' }}>Prioridad</label>
                  <select name="priority" value={filters.priority} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.9rem' }}>
                    <option value="">Todas</option>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: '#495057' }}>Asignado a</label>
                  <select name="assigned_to" value={filters.assigned_to} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ced4da', borderRadius: '4px', fontSize: '0.9rem' }}>
                    <option value="">Todos</option>
                    {project.members?.map(member => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.user?.full_name || member.user?.username}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={clearFilters} style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#6c757d', border: '1px solid #ced4da', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  🔄 Limpiar
                </button>
              </div>
            </div>
            
            <div>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '8px', border: '2px dashed #ced4da', color: '#6c757d' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <h3 style={{ color: '#212529', marginBottom: '0.5rem' }}>No hay tareas</h3>
                  <p>Crea la primera tarea de este proyecto</p>
                </div>
              ) : (
                tasks.map(task => <TaskItem key={task.id} task={task} />)
              )}
            </div>
          </section>
        </div>
      </main>
      
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        projectId={parseInt(id)}
        existingMemberIds={project.members?.map(m => m.user_id) || []}
        onMemberAdded={handleMemberAdded}
      />
      
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projectId={parseInt(id)}
        members={project.members || []}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  )
}

export default ProjectDetail