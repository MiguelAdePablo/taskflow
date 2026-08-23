import { createContext, useState, useEffect } from 'react'

export const ThemeContext = createContext(null)

// ============================================================
// PROPÓSITO: Proveedor de contexto para gestionar el tema claro/oscuro de la aplicación.
// CRÍTICO: Se inicializa el estado directamente con una función lazy para evitar lecturas innecesarias de localStorage en cada renderizado inicial.
// ============================================================
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}