import { Link } from 'react-router-dom'

// ============================================================
// PROPÓSITO: Formatear fecha y determinar color de badge.
// CRÍTICO: Funciones extraídas fuera del componente para evitar su recreación innecesaria en cada renderizado (optimización de memoria y rendimiento).
// ============================================================
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha desconocida'
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getMemberBadgeColor = (count) => {
  if (count === 1) return '#6c757d'
  if (count <= 3) return '#17a2b8'
  return '#28a745'
}

// ============================================================
// PROPÓSITO: Renderizar tarjeta reutilizable con información básica de un proyecto.
// CRÍTICO: Se valida la existencia de la prop `project` al inicio para evitar errores de desestructuración (TypeError) si el dato llega nulo desde la API.
// ============================================================
function ProjectCard({ project }) {
  if (!project) return null
  
  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        border: '1px solid var(--border-color, #e0e0e0)',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-primary, white)',
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
        e.currentTarget.style.borderColor = 'var(--primary-color, #007bff)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
        e.currentTarget.style.borderColor = 'var(--border-color, #e0e0e0)'
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary, #212529)', flex: 1, marginRight: '1rem' }}>
            📁 {project.name}
          </h3>
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
        
        <p style={{
          margin: '0 0 1rem 0',
          color: 'var(--text-secondary, #6c757d)',
          fontSize: '0.95rem',
          flex: 1,
          lineHeight: '1.5',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {project.description || 'Sin descripción'}
        </p>
        
        <div style={{
          borderTop: '1px solid var(--border-color, #f0f0f0)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary, #6c757d)'
        }}>
          <span>📅 Creado: {formatDate(project.created_at)}</span>
          <span style={{ color: 'var(--primary-color, #007bff)', fontWeight: '500' }}>
            Ver detalles →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ProjectCard