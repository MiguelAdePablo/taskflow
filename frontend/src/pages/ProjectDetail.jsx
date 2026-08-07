import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import projectService from '../services/projectService'
import taskService from '../services/taskService'
import MemberCard from '../components/MemberCard'
import AddMemberModal from '../components/AddMemberModal'
import TaskItem from '../components/TaskItem'
import CreateTaskModal from '../components/CreateTaskModal'
import EditProjectModal from '../components/EditProjectModal'
import EditTaskModal from '../components/EditTaskModal'
import NotificationBell from '../components/NotificationBell'
import ThemeToggle from '../components/ThemeToggle'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket, joinProject, leaveProject } = useSocket()
  
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)
  
  const [filters, setFilters] = useState({ status: '', priority: '', assigned_to: '' })

  useEffect(() => { loadProjectData() }, [id])

  useEffect(() => {
    if (project) {
      joinProject(project.id)
      loadTasks()
    }
    return () => { if (project) leaveProject(project.id) }
  }, [project])

  useEffect(() => {
    if (!socket || !project) return
    const handleTaskCreated = (data) => {
      if (data.project_id === project.id) {
        setTasks(prev => prev.some(t => t.id === data.task.id) ? prev : [data.task, ...prev])
      }
    }
    const handleTaskUpdated = (data) => {
      if (data.project_id === project.id) {
        setTasks(prev => prev.map(t => t.id === data.task.id ? data.task : t))
      }
    }
    socket.on('task:created', handleTaskCreated)
    socket.on('task:updated', handleTaskUpdated)
    return () => { socket.off('task:created', handleTaskCreated); socket.off('task:updated', handleTaskUpdated) }
  }, [socket, project])

  const loadProjectData = async () => {
    try {
      setLoading(true); setError('')
      const projectData = await projectService.getProject(id)
      setProject(projectData)
    } catch (error) {
      console.error('Error cargando proyecto:', error)
      setError(error.message || 'No se pudo cargar el proyecto')
    } finally { setLoading(false) }
  }

  const loadTasks = async () => {
    try {
      const activeFilters = {}
      if (filters.status) activeFilters.status = filters.status
      if (filters.priority) activeFilters.priority = filters.priority
      if (filters.assigned_to) activeFilters.assigned_to = parseInt(filters.assigned_to)
      const tasksData = await taskService.getProjectTasks(id, activeFilters)
      setTasks(tasksData)
    } catch (error) { console.error('Error cargando tareas:', error) }
  }

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })
  const clearFilters = () => setFilters({ status: '', priority: '', assigned_to: '' })

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('¿Expulsar a este miembro?')) return
    try { await projectService.removeMember(id, userId); await loadProjectData() } 
    catch (error) { alert('Error: ' + error.message) }
  }

  const handleMemberAdded = async () => { await loadProjectData() }
  const handleTaskCreated = (newTask) => { setTasks([newTask, ...tasks]) }
  
  const handleProjectUpdated = async () => { await loadProjectData() }
  const handleTaskUpdated = (updatedTask) => { setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t)) }
  const handleEditTask = (task) => { setTaskToEdit(task); setIsEditTaskModalOpen(true) }

  const handleDeleteProject = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer y eliminará todas las tareas y comentarios asociados.')) {
      return
    }
    
    const projectName = project.name
    const userInput = window.prompt(`Para confirmar, escribe el nombre exacto del proyecto: "${projectName}"`)
    
    if (userInput !== projectName) {
      alert('El nombre no coincide. La operación fue cancelada.')
      return
    }
    
    try {
      await projectService.deleteProject(id)
      navigate('/dashboard')
    } catch (error) {
      alert('Error al eliminar el proyecto: ' + error.message)
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>⏳ Cargando proyecto...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center' }}><h2 style={{ color: 'var(--text-primary)' }}>❌ Error</h2><p style={{ color: 'var(--text-secondary)' }}>{error}</p><button onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Volver</button></div>
  if (!project) return <div style={{ padding: '2rem', textAlign: 'center' }}><h2 style={{ color: 'var(--text-primary)' }}>Proyecto no encontrado</h2><Link to="/dashboard" style={{ color: 'var(--accent-blue)' }}>Volver</Link></div>

  const isOwner = project && user && project.owner_id === user.id

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
          <Link to="/dashboard" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>← Volver al Dashboard</Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main style={{ padding: '2rem' }}>
        <div className="container-narrow">
          
          <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            
            {/* ✅ CONTENEDOR FLEX: Izquierda (Título + Descripción) | Derecha (Botones) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              
              {/* Columna Izquierda: Título y Descripción agrupados */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h1 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1.75rem' }}>
                  📁 {project.name}
                </h1>
                <p>
                <br></br>
                </p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {project.description || 'Sin descripción'}
                </p>
              </div>
              
              {/* Columna Derecha: Botones en vertical */}
              {isOwner ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f3e8ff', color: '#6f42c1', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' }}>👑 Owner</span>
                  <button onClick={() => setIsEditProjectModalOpen(true)} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'transparent', color: 'var(--accent-blue)', border: '1px solid var(--accent-blue)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>✏️ Editar</button>
                  <button onClick={handleDeleteProject} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'transparent', color: 'var(--accent-red)', border: '1px solid var(--accent-red)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-red)'; e.currentTarget.style.color = 'white' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--accent-red)' }}>🗑️ Eliminar</button>
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'right' }}>(Solo el owner puede editar o eliminar)</span>
              )}
            </div>
            
            {/* Stats abajo */}
            <div style={{ display: 'flex', gap: '2rem', paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.9rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span>👥 {project.member_count || project.members?.length || 0} miembros</span>
              <span>📅 Creado: {project.created_at ? new Date(project.created_at).toLocaleDateString('es-ES') : 'Fecha desconocida'}</span>
            </div>
            
          </section>   
          
          <div className="grid-2-cols">
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>👥 Miembros ({project.members?.length || 0})</h2>
                {isOwner ? (
                  <button onClick={() => setIsAddMemberModalOpen(true)} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>+ Añadir</button>
                ) : <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(Solo owner)</span>}
              </div>
              <div>
                {project.members?.map(member => (
                  <MemberCard key={member.id} member={member} onRemove={isOwner ? handleRemoveMember : null} />
                ))}
              </div>
            </section>
            
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>✅ Tareas ({tasks.length})</h2>
                <button onClick={() => setIsCreateTaskModalOpen(true)} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>+ Nueva Tarea</button>
              </div>
              
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <div className="filters-row">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Estado</label>
                    <select name="status" value={filters.status} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                      <option value="">Todos</option>
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En progreso</option>
                      <option value="completed">Completada</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Prioridad</label>
                    <select name="priority" value={filters.priority} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                      <option value="">Todas</option>
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Asignado a</label>
                    <select name="assigned_to" value={filters.assigned_to} onChange={handleFilterChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--input-border)', borderRadius: '4px', fontSize: '0.9rem', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                      <option value="">Todos</option>
                      {project.members?.map(member => <option key={member.user_id} value={member.user_id}>{member.user?.full_name || member.user?.username}</option>)}
                    </select>
                  </div>
                  <button onClick={clearFilters} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>🔄 Limpiar</button>
                </div>
              </div>
              
              <div>
                {tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '2px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No hay tareas</h3>
                    <p>Crea la primera tarea de este proyecto</p>
                  </div>
                ) : (
                  tasks.map(task => <TaskItem key={task.id} task={task} onEdit={handleEditTask} />)
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <AddMemberModal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} projectId={parseInt(id)} existingMemberIds={project.members?.map(m => m.user_id) || []} onMemberAdded={handleMemberAdded} />
      <CreateTaskModal isOpen={isCreateTaskModalOpen} onClose={() => setIsCreateTaskModalOpen(false)} projectId={parseInt(id)} members={project.members || []} onTaskCreated={handleTaskCreated} />
      <EditProjectModal isOpen={isEditProjectModalOpen} onClose={() => setIsEditProjectModalOpen(false)} project={project} onProjectUpdated={handleProjectUpdated} />
      <EditTaskModal isOpen={isEditTaskModalOpen} onClose={() => { setIsEditTaskModalOpen(false); setTaskToEdit(null) }} task={taskToEdit} members={project.members || []} onTaskUpdated={handleTaskUpdated} />
    </div>
  )
}

export default ProjectDetail