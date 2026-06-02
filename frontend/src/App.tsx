import { useEffect } from 'react'
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CvEditor } from './components/CvEditor'
import { CvPrintView } from './components/CvPrintView'
import { AuthScreen } from './components/AuthScreen'
import { LandingPage } from './components/LandingPage'
import { Dashboard } from './components/Dashboard'
import { OAuthCallback } from './components/OAuthCallback'
import { useCvStore } from './store/cvStore'
import { useAuthStore } from './store/authStore'

/* ── Auth guard ────────────────────────────────────────────────────────── */

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return <>{children}</>
}

/* ── /auth ─────────────────────────────────────────────────────────────── */

function AuthPage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  return <AuthScreen onSuccess={() => navigate('/dashboard', { replace: true })} />
}

/* ── /cv/:id ────────────────────────────────────────────────────────────── */

function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { loaded, loadCvs } = useCvStore()

  useEffect(() => {
    if (!loaded) loadCvs()
  }, [loaded, loadCvs])

  if (!id) return null

  return (
    <div className="h-screen overflow-hidden">
      <CvEditor cvId={id} onBack={() => navigate('/dashboard')} />
    </div>
  )
}

/* ── /print/:id ─────────────────────────────────────────────────────────── */

function PrintPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  return <CvPrintView cvId={id} />
}

/* ── Root App ────────────────────────────────────────────────────────────── */

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#111111',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: '500',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
          },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/print/:id" element={<PrintPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/cv/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
