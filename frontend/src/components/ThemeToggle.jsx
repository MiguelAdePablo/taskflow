import { useTheme } from '../hooks/useTheme'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      style={{
        padding: '0.35rem',
        backgroundColor: 'transparent',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        fontSize: '1rem',
        borderRadius: '4px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px'
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
        e.currentTarget.style.transform = 'scale(1.05)'
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

export default ThemeToggle