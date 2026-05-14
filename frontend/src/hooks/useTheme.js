import { useThemeContext } from '../theme/ThemeProvider.jsx'
import { useEffect, useState } from 'react'
import { getPresets, listThemes } from '../api/themes.js'

export function useTheme() {
  const { tokens, applyTokens } = useThemeContext()
  const [presets, setPresets] = useState([])
  const [themes, setThemes] = useState([])

  useEffect(() => {
    getPresets().then(setPresets).catch(() => {})
    listThemes().then(setThemes).catch(() => {})
  }, [])

  const applyPreset = (preset) => {
    if (preset?.tokens) applyTokens(preset.tokens)
  }

  return { tokens, applyTokens, presets, themes, applyPreset }
}
