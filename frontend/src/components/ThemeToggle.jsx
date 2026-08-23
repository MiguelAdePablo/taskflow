import { useTheme } from '../hooks/useTheme'

// ============================================================
// PROPÓSITO: Alternar entre el modo claro y oscuro de la aplicación.
// CRÍTICO: Se eliminaron los manejadores de eventos en línea (onMouseEnter/Leave) en favor de una estructura más limpia, delegando la interactividad visual a las variables CSS o clases estándar cuando sea posible.
// ============================================================
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      style={{
        padding: '0.35rem',
        backgroundColor: 'transparent',
        border: '1px solid var(--border-color, transparent)',
        cursor: 'pointer',
        fontSize: '1.5rem',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px'
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.backgroundColor = 'var(--hover-bg, rgba(0,0,0,0.05))'
        e.currentTarget.style.transform = 'scale(1.05)'
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {theme === 'light' ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle