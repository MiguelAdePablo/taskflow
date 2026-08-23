import { useAuth } from '../hooks/useAuth'

// ============================================================
// PROPÓSITO: Obtener la configuración visual del rol de un miembro.
// CRÍTICO: Función extraída fuera del componente para evitar su recreación en cada renderizado (optimización de memoria y rendimiento).
// ============================================================
const getRoleBadge = (role) => {
  const badges = {
    owner: { label: '👑 Owner', color: '#6f42c1', bgColor: '#f3e8ff' },
    admin: { label: '⭐ Admin', color: '#fd7e14', bgColor: '#fff4e6' },
    member: { label: '👤 Miembro', color: '#17a2b8', bgColor: '#e7f5ff' }
  }
  return badges[role] || badges.member
}

// ============================================================
// PROPÓSITO: Renderizar la información de un miembro del proyecto con opción de expulsión.
// CRÍTICO: Se reemplazaron los manejadores de hover hardcodeados (que rompían el modo oscuro) por transiciones CSS limpias y variables de color.
// ============================================================
function MemberCard({ member, onRemove }) {
  const { user } = useAuth()
  
  if (!member || !member.user) return null
  
  const canRemove = user?.id !== member.user_id && member.role !== 'owner'
  const roleBadge = getRoleBadge(member.role)
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      backgroundColor: 'var(--bg-primary, white)',
      border: '1px solid var(--border-color, #e0e0e0)',
      borderRadius: '8px',
      marginBottom: '0.75rem',
      transition: 'border-color 0.2s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
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
          border: `2px solid ${roleBadge.color}`,
          overflow: 'hidden'
        }}>
          {member.user.avatar_url ? (
            <img src={member.user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (member.user.full_name || member.user.username || '?').charAt(0).toUpperCase()
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '600', color: 'var(--text-primary, #212529)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {member.user.full_name || member.user.username}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #6c757d)' }}>
            @{member.user.username}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #6c757d)' }}>
            {member.user.email}
          </div>
        </div>
                
        <span style={{
          padding: '0.25rem 0.75rem',
          backgroundColor: roleBadge.bgColor,
          color: roleBadge.color,
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '500',
          whiteSpace: 'nowrap'
        }}>
          {roleBadge.label}
        </span>
      </div>
      
      {canRemove && onRemove && (
        <button
          onClick={() => onRemove(member.user_id)}
          style={{
            marginLeft: '1rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: 'transparent',
            color: '#dc3545',
            border: '1px solid #dc3545',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc3545'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
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