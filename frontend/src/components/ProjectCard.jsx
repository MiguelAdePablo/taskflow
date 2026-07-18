import { Link } from 'react-router-dom'

/**
 * ============================================================
 * COMPONENTE: ProjectCard
 * ============================================================
 * 
 * Tarjeta reutilizable que muestra la información básica de un proyecto.
 * 
 * ¿Por qué un componente separado?
 * - Reutilizable: Lo usamos en Dashboard, búsqueda, etc.
 * - Mantenible: Si cambia el diseño, solo modificamos aquí
 * - Testeable: Podemos probarlo de forma aislada
 * 
 * Props que recibe:
 * - project: Objeto con los datos del proyecto
 * 
 * Ejemplo de uso:
 * <ProjectCard project={{ id: 1, name: "Mi Proyecto", ... }} />
 */
function ProjectCard({ project }) {
  // Validación de seguridad: si no hay proyecto, no renderizar nada
  if (!project) return null
  
  // Formatear la fecha de creación para mostrarla de forma amigable
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida'
    
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }
  
  // Determinar el color del badge según el número de miembros
  const getMemberBadgeColor = (count) => {
    if (count === 1) return '#6c757d'  // Gris: solo el owner
    if (count <= 3) return '#17a2b8'   // Azul: equipo pequeño
    return '#28a745'                    // Verde: equipo grande
  }
  
  return (
    <Link 
      to={`/projects/${project.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: 'white',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
        e.currentTarget.style.borderColor = '#007bff'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
        e.currentTarget.style.borderColor = '#e0e0e0'
      }}
      >
        {/* Header de la tarjeta */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.25rem',
            color: '#212529',
            flex: 1,
            marginRight: '1rem'
          }}>
            📁 {project.name}
          </h3>
          
          {/* Badge con el número de miembros */}
          <span style={{
            backgroundColor: getMemberBadgeColor(project.member_count),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}>
            👥 {project.member_count}
          </span>
        </div>
        
        {/* Descripción */}
        <p style={{
          margin: '0 0 1rem 0',
          color: '#6c757d',
          fontSize: '0.95rem',
          flex: 1,
          lineHeight: '1.5',
          // Truncar texto largo con ellipsis
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {project.description || 'Sin descripción'}
        </p>
        
        {/* Footer con fecha */}
        <div style={{
          borderTop: '1px solid #f0f0f0',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          color: '#6c757d'
        }}>
          <span>📅 Creado: {formatDate(project.created_at)}</span>
          <span style={{ color: '#007bff', fontWeight: '500' }}>
            Ver detalles →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ProjectCard