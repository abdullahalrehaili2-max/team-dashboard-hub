import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'

// Lazy load pages
const Login = React.lazy(() => import('./pages/Login.jsx'))
const DashboardList = React.lazy(() => import('./pages/DashboardList.jsx'))
const DashboardView = React.lazy(() => import('./pages/DashboardView.jsx'))
const DashboardEditor = React.lazy(() => import('./pages/DashboardEditor.jsx'))
const DesignMode = React.lazy(() => import('./pages/DesignMode.jsx'))
const ThemeEditor = React.lazy(() => import('./pages/ThemeEditor.jsx'))
const WeeklyEntry = React.lazy(() => import('./pages/WeeklyEntry.jsx'))
const PublicView = React.lazy(() => import('./pages/PublicView.jsx'))
const Presentation = React.lazy(() => import('./pages/Presentation.jsx'))
const TemplateLibrary = React.lazy(() => import('./pages/TemplateLibrary.jsx'))
const TemplateDetail = React.lazy(() => import('./pages/TemplateDetail.jsx'))
const AISuggester = React.lazy(() => import('./pages/AISuggester.jsx'))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/share/:token" element={<PublicView />} />

            {/* Protected */}
            <Route path="/" element={<ProtectedRoute><Navbar /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboards" replace />} />
              <Route path="dashboards" element={<DashboardList />} />
              <Route path="dashboards/:id" element={<DashboardView />} />
              <Route path="dashboards/:id/edit" element={<DashboardEditor />} />
              <Route path="dashboards/:id/design" element={<DesignMode />} />
              <Route path="dashboards/:id/entry" element={<WeeklyEntry />} />
              <Route path="dashboards/:id/present" element={<Presentation />} />
              <Route path="dashboards/:id/ai" element={<AISuggester />} />
              <Route path="themes" element={<ThemeEditor />} />
              <Route path="templates" element={<TemplateLibrary />} />
              <Route path="templates/:id" element={<TemplateDetail />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
