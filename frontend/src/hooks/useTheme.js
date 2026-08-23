import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

// ============================================================
// PROPÓSITO: Exponer el tema actual y la función de alternancia (toggle) del ThemeContext.
// CRÍTICO: Mismo patrón de validación de contexto para asegurar que los componentes de UI que dependen del tema (como ThemeToggle) tengan acceso garantizado a los valores, evitando crashes por desestructuración de `null`.
// ============================================================
export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider')
  }
  
  return context
}