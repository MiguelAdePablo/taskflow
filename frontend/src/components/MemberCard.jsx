import { useAuth } from '../hooks/useAuth'

/**
 * ============================================================
 * COMPONENTE: MemberCard
 * ============================================================
 * 
 * Muestra la información de un miembro del proyecto.
 * Si el usuario actual es el owner, muestra un botón para eliminar.
 * 
 * Props:
 * - member: Objeto con los datos de la membresía
 * - onRemove: Función que se ejecuta al hacer clic en "Eliminar"
 */
function MemberCard({ member, onRemove }) {
  const { user } = useAuth()
  
  if (!member || !member.user) return null
  
  // Determinar si el usuario actual puede eliminar a este miembro
  // No puede eliminarse a sí mismo ni al owner
  const canRemove = 
    user?.id !== member.user_id &&  // No es él mismo
    member.role !== 'owner'          // No es el owner del proyecto
  
  // Badge de color según el rol
  const getRoleBadge = (role) => {
    const badges = {
      owner: { label: '👑 Owner', color: '#6f42c1', bgColor: '#f3e8ff' },
      admin: { label: '⭐ Admin', color: '#fd7e14', bgColor: '#fff4e6' },
      member: { label: '👤 Miembro', color: '#17a2b8', bgColor: '#e7f5ff' }
    }
    return badges[role] || badges.member
  }
  
  const roleBadge = getRoleBadge(member.role)
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '0.75rem'
    }}>
      {/* Información del usuario */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {/* Avatar (inicial del nombre si no hay imagen) */}
        <div style={{
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          backgroundColor: roleBadge.bgColor,
          color: roleBadge.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          fontWeight: '600',
          border: `2px solid ${roleBadge.color}`
        }}>
          {member.user.avatar_url 
            ? <img src={member.user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : (member.user.full_name || member.user.username || '?').charAt(0).toUpperCase()
          }
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: '#212529', marginBottom: '0.25rem' }}>
            {member.user.full_name || member.user.username}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
            @{member.user.username} • {member.user.email}
          </div>
        </div>
        
        {/* Badge del rol */}
        <span style={{
          padding: '0.25rem 0.75rem',
          backgroundColor: roleBadge.bgColor,
          color: roleBadge.color,
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '500'
        }}>
          {roleBadge.label}
        </span>
      </div>
      
      {/* Botón eliminar (solo si se puede) */}
      {canRemove && onRemove && (
        <button
          onClick={() => onRemove(member.user_id)}
          style={{
            marginLeft: '1rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: 'white',
            color: '#dc3545',
            border: '1px solid #dc3545',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc3545'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
            e.currentTarget.style.color = '#dc3545'
          }}
        >
          ✕ Expulsar
        </button>
      )}
    </div>
  )
}

export default MemberCard