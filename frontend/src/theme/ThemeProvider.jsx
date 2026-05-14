import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ThemeContext = createContext({
  tokens: {},
  setTokens: () => {},
  applyTokens: () => {},
})

export function ThemeProvider({ children }) {
  const { i18n } = useTranslation()
  const [tokens, setTokensState] = useState({})

  // Sync document dir with language
  useEffect(() => {
    const dir = i18n.language?.startsWith('ar') ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language || 'ar'
  }, [i18n.language])

  function applyTokens(newTokens) {
    const root = document.documentElement
    const palette = newTokens.palette || {}
    const typography = newTokens.typography || {}

    // Apply palette
    if (palette.primary) root.style.setProperty('--color-primary', palette.primary)
    if (palette.accent) root.style.setProperty('--color-accent', palette.accent)
    if (palette.danger) root.style.setProperty('--color-danger', palette.danger)
    if (palette.warning) root.style.setProperty('--color-warning', palette.warning)
    if (palette.success) root.style.setProperty('--color-success', palette.success)
    if (palette.bg) root.style.setProperty('--color-bg', palette.bg)
    if (palette.surface) root.style.setProperty('--color-surface', palette.surface)
    if (palette.surface_alt) root.style.setProperty('--color-surface-alt', palette.surface_alt)
    if (palette.text) root.style.setProperty('--color-text', palette.text)
    if (palette.text_muted) root.style.setProperty('--color-text-muted', palette.text_muted)
    if (palette.border) root.style.setProperty('--color-border', palette.border)

    // Apply typography
    if (typography.fontFamilyHeading) root.style.setProperty('--font-heading', `'${typography.fontFamilyHeading}', sans-serif`)
    if (typography.fontFamilyBody) root.style.setProperty('--font-body', `'${typography.fontFamilyBody}', sans-serif`)
    if (typography.fontFamilyMono) root.style.setProperty('--font-mono', `'${typography.fontFamilyMono}', monospace`)

    // Apply radius
    const radiusMap = { sharp: '4px', soft: '10px', round: '20px' }
    if (newTokens.radius) root.style.setProperty('--radius', radiusMap[newTokens.radius] || '10px')

    // Apply background
    if (newTokens.background === 'gradient' && palette.bg) {
      document.body.style.background = `linear-gradient(135deg, ${palette.bg} 0%, ${palette.surface || palette.bg} 100%)`
    } else if (palette.bg) {
      document.body.style.background = palette.bg
    }

    setTokensState(newTokens)
  }

  return (
    <ThemeContext.Provider value={{ tokens, setTokens: applyTokens, applyTokens }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  return useContext(ThemeContext)
}
