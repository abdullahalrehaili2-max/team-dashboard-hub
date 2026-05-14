import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useI18n } from '../hooks/useI18n.js'
import { useAuth } from '../hooks/useAuth.js'
import LangToggle from '../components/LangToggle.jsx'

export default function Login() {
  const { t } = useI18n()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('changeme')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const from = location.state?.from?.pathname || '/dashboards'
      navigate(from, { replace: true })
    } catch {
      setError(t('auth.invalid_credentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'var(--color-bg)' }}>
      {/* Glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--color-primary)' }} />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={{ background: 'var(--color-accent)' }} />
      </div>

      <div className="absolute top-4 end-4">
        <LangToggle />
      </div>

      <motion.div
        className="w-full max-w-sm mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--color-primary)' }}>
            <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
              <rect x="4" y="4" width="10" height="10" rx="2" fill="var(--color-accent)" />
              <rect x="18" y="4" width="10" height="10" rx="2" fill="var(--color-accent)" opacity="0.7" />
              <rect x="4" y="18" width="10" height="10" rx="2" fill="var(--color-accent)" opacity="0.5" />
              <rect x="18" y="18" width="10" height="10" rx="2" fill="white" opacity="0.3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{t('app_name')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>GASTAT Dashboard Platform</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
            {error && <p className="text-sm text-center" style={{ color: 'var(--color-danger)' }}>{error}</p>}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: 'var(--color-primary)' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? t('auth.logging_in') : t('auth.login_btn')}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
