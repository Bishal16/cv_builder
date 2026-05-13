import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { CvEditor } from './components/CvEditor'
import { useCvStore } from './store/cvStore'
import { useThemeStore } from './store/themeStore'

function App() {
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const { cvs, loadCvs, createCv, deleteCv } = useCvStore()
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    loadCvs()
  }, [loadCvs])

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  const handleNewCv = async () => {
    const newCv = await createCv({
      title: 'My CV',
      templateId: 'CLASSIC',
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
      },
      experiences: [],
      educations: [],
      skills: [],
      projects: []
    })
    setSelectedCvId(newCv.id)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this CV?')) {
      await deleteCv(id)
    }
    setActiveMenuId(null)
  }

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
      <div className={`${selectedCvId ? 'max-w-full px-6' : 'max-w-6xl mx-auto px-4'} py-12`}>
        {!selectedCvId && (
          <header className="mb-16 flex items-end justify-between border-b border-border-subtle pb-8 text-text-base">
            <div>
              <h1 className="text-5xl font-black tracking-tight mb-3 italic">CV BUILDER</h1>
              <p className="text-text-muted font-medium">Design production-grade resumes in a browser-native workspace.</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-3 bg-bg-surface border border-border-subtle rounded-xl hover:bg-bg-muted transition-all active:scale-95 text-text-base"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleNewCv}
                className="btn-primary"
              >
                + Create New CV
              </button>
            </div>
          </header>
        )}

        {cvs.length === 0 && !selectedCvId ? (
          <div className="text-center py-32 glass-surface rounded-[2rem]">
            <div className="w-20 h-20 mx-auto mb-8 bg-bg-surface rounded-2xl flex items-center justify-center micro-border">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-base mb-2">No documents yet</h2>
            <p className="text-text-muted mb-8 max-w-md mx-auto text-sm">Your workspace is currently empty. Start by creating a new document to see it appear here.</p>
            <button
              onClick={handleNewCv}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        ) : selectedCvId ? (
          <CvEditor cvId={selectedCvId} onBack={() => setSelectedCvId(null)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cvs.map(cv => (
              <div
                key={cv.id}
                onClick={() => setSelectedCvId(cv.id)}
                className="group relative p-8 glass-surface rounded-3xl cursor-pointer transition-all hover:bg-white/[0.05] hover:-translate-y-1 active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-bg-surface rounded-2xl flex items-center justify-center text-text-muted font-bold text-xl micro-border group-hover:text-text-base transition-colors">
                    {cv.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-bg-surface text-text-muted text-[10px] font-bold tracking-widest uppercase rounded-full micro-border">
                      {cv.templateId}
                    </span>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuId(activeMenuId === cv.id ? null : cv.id)
                        }}
                        className="p-2 text-text-muted hover:text-text-base rounded-xl hover:bg-bg-surface transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                      
                      {activeMenuId === cv.id && (
                        <div className="absolute right-0 mt-3 w-40 bg-bg-surface border border-border-subtle rounded-xl shadow-2xl z-20 overflow-hidden premium-shadow">
                          <button
                            onClick={(e) => handleDelete(e, cv.id)}
                            className="w-full px-4 py-3 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a2 2 0 00-2 2v3M4 7h16" />
                            </svg>
                            Delete Project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-text-base mb-2 group-hover:text-primary transition-colors italic uppercase tracking-tight">
                  {cv.title}
                </h3>
                <p className="text-text-muted text-xs font-medium">
                  Edited {new Date(cv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
