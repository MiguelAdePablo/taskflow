import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Importar las páginas
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import TaskDetail from './pages/TaskDetail'

/**
 * Componente raíz de la aplicación.
 * Define todas las rutas disponibles.
 * 
 * Rutas públicas: /login, /register
 * Rutas privadas: /dashboard, /projects/:id, /tasks/:id
 */
function App() {
  return (
    <Routes>
      {/* Rutas públicas (no requieren autenticación) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Ruta raíz: redirige al dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Rutas privadas (requieren autenticación) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects/:id" 
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks/:id" 
        element={
          <ProtectedRoute>
            <TaskDetail />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta 404: para URLs que no existen */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🔍 404 - Página no encontrada</h1>
      <p>La ruta que buscas no existe</p>
      <a href="/dashboard">Volver al dashboard</a>
    </div>
  )
}

export default App