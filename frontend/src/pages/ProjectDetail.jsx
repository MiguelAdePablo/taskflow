/**
 * Detalle de un proyecto (placeholder).
 * Recibe el ID del proyecto como parámetro de la URL.
 */
import { useParams } from 'react-router-dom'

function ProjectDetail() {
  // useParams() nos permite acceder a los parámetros de la URL
  // Por ejemplo, en /projects/5, params.id sería "5"
  const { id } = useParams()

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>📁 Detalle del Proyecto</h1>
      <p>ID del proyecto: <strong>{id}</strong></p>
      <p>Aquí verás las tareas y miembros de este proyecto</p>
    </div>
  )
}

export default ProjectDetail