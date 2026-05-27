import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CvEditor } from './components/CvEditor'
import { CvPrintView } from './components/CvPrintView'
import { AuthScreen } from './components/AuthScreen'
import { useCvStore } from './store/cvStore'
import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'

function Dashboard() {
  const navigate = useNavigate()
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const { cvs, loadCvs, createCv, deleteCv } = useCvStore()
  const { theme, toggleTheme } = useThemeStore()
  const { logout, user } = useAuthStore()

  useEffect(() => {
    loadCvs()
  }, [loadCvs])

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  const handleNewCv = async () => {
    const newCv = await createCv({
      title: 'New Document',
      templateId: 'CLASSIC',
      sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects'],
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedinUrl: '',
        githubUrl: '',
        summary: ''
      },
      experiences: [],
      educations: [],
      skills: [],
      projects: []
    })
    navigate(`/cv/${newCv.id}`)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteCv(id)
    }
    setActiveMenuId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <header className="mb-20 flex items-end justify-between border-b border-border-subtle pb-10 text-text-base">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black italic">B.</div>
             <span className="text-xs font-black tracking-[0.3em] text-zinc-500 uppercase">Pro Workspace</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-[0.8] mb-4">Your_Vault</h1>
          <p className="text-text-muted font-medium text-sm tracking-wide">Logged in as <span className="text-text-base font-bold underline decoration-primary/30">{user?.email}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-4 bg-bg-surface border border-border-subtle rounded-2xl hover:bg-bg-muted transition-all active:scale-95 text-text-base shadow-lg"
          >
            {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
          </button>
          <button
            onClick={logout}
            className="px-6 py-4 bg-bg-surface border border-border-subtle text-rose-500 font-bold rounded-2xl hover:bg-rose-500/5 transition-all active:scale-95 shadow-lg"
          >
            DISCONNECT
          </button>
          <button
            onClick={handleNewCv}
            className="btn-primary !py-4 !px-8 shadow-xl shadow-primary/20"
          >
            + NEW_DOCUMENT
          </button>
        </div>
      </header>

      {cvs.length === 0 ? (
        <div className="text-center py-40 glass-surface rounded-[3rem] border-dashed">
          <div className="w-24 h-24 mx-auto mb-10 bg-bg-muted rounded-3xl flex items-center justify-center micro-border">
            <svg className="w-10 h-10 text-text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-text-base mb-3 italic tracking-tight">VAULT_IS_VACANT</h2>
          <p className="text-text-muted mb-12 max-w-sm mx-auto text-sm font-medium">Initialize your professional trajectory by creating your first document signature.</p>
          <button
            onClick={handleNewCv}
            className="btn-primary !py-5 !px-10"
          >
            INITIALIZE_PROJECT
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {cvs.map(cv => (
            <div
              key={cv.id}
              onClick={() => navigate(`/cv/${cv.id}`)}
              className="group relative p-8 glass-surface rounded-[2.5rem] cursor-pointer transition-all hover:bg-white/[0.04] hover:-translate-y-2 active:scale-[0.98] premium-shadow"
            >
              <div className="flex items-start justify-between mb-12">
                <div className="w-16 h-16 bg-bg-surface rounded-2xl flex items-center justify-center text-text-muted font-black text-2xl micro-border group-hover:text-primary transition-all group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                  {cv.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-bg-muted text-text-muted text-[9px] font-black tracking-[0.2em] uppercase rounded-lg micro-border">
                    {cv.templateId}
                  </span>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenuId(activeMenuId === cv.id ? null : cv.id)
                      }}
                      className="p-2.5 text-text-muted hover:text-text-base rounded-xl hover:bg-bg-surface transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>

                    {activeMenuId === cv.id && (
                      <div className="absolute right-0 mt-4 w-48 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl z-20 overflow-hidden premium-shadow backdrop-blur-3xl">
                        <button
                          onClick={(e) => handleDelete(e, cv.id)}
                          className="w-full px-5 py-4 text-left text-[10px] font-black tracking-widest text-rose-500 hover:bg-rose-500/10 flex items-center gap-3 transition-colors uppercase"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a2 2 0 00-2 2v3M4 7h16" />
                          </svg>
                          Destroy_Record
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-black text-text-base mb-2 group-hover:text-primary transition-colors italic uppercase tracking-tighter leading-none">
                {cv.title}
              </h3>
              <div className="flex items-center gap-2 mt-4 opacity-60">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                   Synced {new Date(cv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                 </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { loaded, loadCvs } = useCvStore()

  // When the user refreshes directly on /cv/:id, the CV store is empty
  // (it is not persisted). Fetch the full list so CvEditor can find the CV.
  useEffect(() => {
    if (!loaded) loadCvs()
  }, [loaded, loadCvs])

  if (!id) return null

  return (
    <div className="h-screen overflow-hidden">
      <CvEditor cvId={id} onBack={() => navigate('/')} />
    </div>
  )
}

function PrintPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  return <CvPrintView cvId={id} />
}

function App() {
  const { theme, toggleTheme } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-bg-base selection:bg-primary/30 transition-colors duration-300">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#18181b' : '#ffffff',
            color: theme === 'dark' ? '#f4f4f5' : '#18181b',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: theme === 'dark' ? '#18181b' : '#ffffff',
            },
          },
        }}
      />

      <Routes>
        <Route path="/print/:id" element={<PrintPage />} />
        <Route
          path="*"
          element={
            !isAuthenticated ? (
              <div className="min-h-screen bg-bg-base flex flex-col transition-colors duration-300">
                <header className="p-8 flex justify-between items-center shrink-0">
                   <h1 className="text-2xl font-black tracking-tighter italic text-text-base">CV_B.</h1>
                   <button
                     onClick={toggleTheme}
                     className="p-2.5 bg-bg-surface border border-border-subtle rounded-xl hover:bg-bg-muted transition-all text-text-base"
                   >
                     {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
                   </button>
                </header>
                <AuthScreen onSuccess={() => {}} />
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/cv/:id" element={<EditorPage />} />
              </Routes>
            )
          }
        />
      </Routes>
    </div>
  )
}

export default App
