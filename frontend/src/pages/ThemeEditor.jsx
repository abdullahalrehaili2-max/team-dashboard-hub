import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import { useI18n } from '../hooks/useI18n.js'
import { useTheme } from '../hooks/useTheme.js'

export default function ThemeEditor() {
  const { t } = useI18n()
  const { tokens, applyTokens, presets } = useTheme()
  const [selectedPreset, setSelectedPreset] = useState(null)

  const handleApplyPreset = (preset) => {
    setSelectedPreset(preset.slug)
    applyTokens(preset.tokens)
  }

  const presetNames = {
    gastat_executive: 'GASTAT Executive',
    executive_light: 'Executive Light',
    midnight_pro: 'Midnight Pro',
    glass_aurora: 'Glass Aurora',
    terminal: 'Terminal',
    pastel_soft: 'Pastel Soft',
    high_contrast: 'High Contrast',
    brand_blank: 'Brand Blank',
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Palette size={24} style={{ color: 'var(--color-primary)' }} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{t('theme.editor')}</h1>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>{t('theme.presets')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const pal = preset.tokens?.palette || {}
            return (
              <motion.button
                key={preset.slug}
                onClick={() => handleApplyPreset(preset)}
                className="rounded-2xl p-4 border text-start transition-all hover:scale-105 relative"
                style={{
                  background: pal.bg || '#0f0e1c',
                  borderColor: selectedPreset === preset.slug ? pal.accent || '#27CED7' : 'transparent',
                  borderWidth: selectedPreset === preset.slug ? 2 : 1,
                }}
                whileTap={{ scale: 0.97 }}
              >
                {selectedPreset === preset.slug && (
                  <div className="absolute top-2 end-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: pal.accent || '#27CED7' }}>
                    <Check size={12} style={{ color: '#000' }} />
                  </div>
                )}
                <div className="flex gap-1 mb-3">
                  {[pal.primary, pal.accent, pal.danger].filter(Boolean).map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <div className="text-xs font-semibold" style={{ color: pal.text || '#f4f4f8' }}>
                  {preset.name || presetNames[preset.slug] || preset.slug}
                </div>
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* Current palette display */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>Current Tokens</h2>
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['--color-primary', '--color-accent', '--color-danger', '--color-success', '--color-bg', '--color-surface'].map(v => (
              <div key={v} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border" style={{ background: `var(${v})`, borderColor: 'var(--color-border)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{v.replace('--color-', '')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
