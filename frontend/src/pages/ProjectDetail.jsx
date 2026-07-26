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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: '#6c757d' }}>⏳ Cargando proyecto...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>❌ Error</h2><p>{error}</p><button onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Volver</button></div>
  if (!project) return <div style={{ padding: '2rem', textAlign: 'center' }}><h2>Proyecto no encontrado</h2><Link to="/dashboard">Volver</Link></div>

  const isOwner = project && user && project.owner_id === user.id

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* ✅ HEADER CON CLASE RESPONSIVA */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', padding: '1rem 2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div className="container header-flex">
          <Link to="/dashboard" style={{ color: '#007bff', textDecoration: 'none' }}>← Volver al Dashboard</Link>
          <NotificationBell />
        </div>
      </header>
      
      <main style={{ padding: '2rem' }}>
        <div className="container-narrow">
          {/* Tarjeta de Información del Proyecto */}
          <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e0e0e0' }}>
            <div className="header-flex" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: '0 0 0.5rem 0', color: '#212529' }}>📁 {project.name}</h1>
                <p style={{ margin: 0, color: '#6c757d' }}>{project.description || 'Sin descripción'}</p>
              </div>
              {isOwner ? (
                <div className="header-flex-right">
                  <span style={{ padding: '0.5rem 1rem', backgroundColor: '#f3e8ff', color: '#6f42c1', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '500' }}>👑 Owner</span>
                  <button onClick={() => setIsEditProjectModalOpen(true)} style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#007bff', border: '1px solid #007bff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>✏️ Editar</button>
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#6c757d', fontStyle: 'italic' }}>(Solo el owner puede editar)</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '2rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0', fontSize: '0.9rem', color: '#6c757d', flexWrap: 'wrap' }}>
              <span>👥 {project.member_count || project.members?.length || 0} miembros</span>
              <span>📅 Creado: {project.created_at ? new Date(project.created_at).toLocaleDateString('es-ES') : 'Fecha desconocida'}</span>
            </div>
          </section>
          
          {/* ✅ GRID RESPONSIVO: 2 columnas en PC, 1 en móvil */}
          <div className="grid-2-cols">
            {/* Columna Izquierda: Miembros */}
            <section>
              <div className="header-flex" style={{ marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}> Miembros ({project.members?.length || 0})</h2>
                {isOwner ? (
                  <button onClick={() => setIsAddMemberModalOpen(true)} style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>+ Añadir</button>
                ) : <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>(Solo owner)</span>}
              </div>
              <div>
                {project.members?.map(member => (
                  <MemberCard key={member.id} member={member} onRemove={isOwner ? handleRemoveMember : null} />
                ))}
              </div>
            </section>
            
            {/* Columna Derecha: Tareas */}
            <section>
              <div className="header-flex" style={{ marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>✅ Tareas ({tasks.length})</h2>
                <button onClick={() => setIsCreateTaskModalOpen(true)} style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>+ Nueva Tarea</button>
              </div>
              
              {/* Filtros */}
              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e0e0e0' }}>
                {/* ✅ FILTROS RESPONSIVOS */}
                <div className="filters-row">
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
                      {project.members?.map(member => <option key={member.user_id} value={member.user_id}>{member.user?.full_name || member.user?.username}</option>)}
                    </select>
                  </div>
                  <button onClick={clearFilters} style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#6c757d', border: '1px solid #ced4da', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}> Limpiar</button>
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
                  tasks.map(task => <TaskItem key={task.id} task={task} onEdit={handleEditTask} />)
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      
      {/* Modales */}
      <AddMemberModal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} projectId={parseInt(id)} existingMemberIds={project.members?.map(m => m.user_id) || []} onMemberAdded={handleMemberAdded} />
      <CreateTaskModal isOpen={isCreateTaskModalOpen} onClose={() => setIsCreateTaskModalOpen(false)} projectId={parseInt(id)} members={project.members || []} onTaskCreated={handleTaskCreated} />
      <EditProjectModal isOpen={isEditProjectModalOpen} onClose={() => setIsEditProjectModalOpen(false)} project={project} onProjectUpdated={handleProjectUpdated} />
      <EditTaskModal isOpen={isEditTaskModalOpen} onClose={() => { setIsEditTaskModalOpen(false); setTaskToEdit(null) }} task={taskToEdit} members={project.members || []} onTaskUpdated={handleTaskUpdated} />
    </div>
  )
}

export default ProjectDetail