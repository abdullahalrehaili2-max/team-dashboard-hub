import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n.js'
import LangToggle from './LangToggle.jsx'
import { LayoutDashboard, Library, Sparkles, Palette, ClipboardList, LogOut, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { t, isRTL } = useI18n()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const links = [
    { to: '/dashboards', icon: <LayoutDashboard size={18} />, label: t('nav.dashboards') },
    { to: '/templates', icon: <Library size={18} />, label: t('nav.templates') },
    { to: '/themes', icon: <Palette size={18} />, label: t('nav.theme_editor') },
  ]

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[var(--color-primary)] text-white'
        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]'
    }`

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-50 border-b flex items-center justify-between px-4 h-14"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Logo */}
        <NavLink to="/dashboards" className="flex items-center gap-2 font-bold text-[var(--color-accent)] text-lg no-underline">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
            <rect x="6" y="6" width="8" height="8" rx="2" fill="var(--color-accent)" />
            <rect x="18" y="6" width="8" height="8" rx="2" fill="var(--color-accent)" opacity="0.7" />
            <rect x="6" y="18" width="8" height="8" rx="2" fill="var(--color-accent)" opacity="0.5" />
            <rect x="18" y="18" width="8" height="8" rx="2" fill="white" opacity="0.3" />
          </svg>
          <span className="hidden sm:block">{t('app_name')}</span>
        </NavLink>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LangToggle />
          <button
            onClick={logout}
            className="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
          >
            <LogOut size={16} />
          </button>
          <button
            className="md:hidden p-2 rounded-lg text-[var(--color-text-muted)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-b p-4 flex flex-col gap-1" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setMobileOpen(false)}>
              {l.icon} {l.label}
            </NavLink>
          ))}
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-danger)]">
            <LogOut size={16} /> {t('nav.logout')}
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
