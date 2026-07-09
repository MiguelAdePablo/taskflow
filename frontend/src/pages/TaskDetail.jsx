/**
 * Detalle de una tarea (placeholder).
 */
import { useParams } from 'react-router-dom'

function TaskDetail() {
  const { id } = useParams()

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>✅ Detalle de Tarea</h1>
      <p>ID de la tarea: <strong>{id}</strong></p>
      <p>Aquí verás los detalles, comentarios y estado de esta tarea</p>
    </div>
  )
}

export default TaskDetail