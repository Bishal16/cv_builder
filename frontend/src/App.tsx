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
    <div className="min-h-screen bg-bg-base">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#18181b' : '#ffffff',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: theme === 'dark' ? '#18181b' : '#ffffff',
            },
          },
        }} 
      />
      
      {!selectedCvId ? (
        <div className="max-w-6xl mx-auto px-6 py-12">
          <header className="mb-12 flex items-end justify-between pb-8 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-text-base">CV Builder</h1>
                <p className="text-text-dim mt-0.5 text-sm">Create professional resumes in minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl hover:bg-bg-muted transition-all border border-border-subtle text-text-dim hover:text-text-base"
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

          {cvs.length === 0 ? (
            <div className="text-center py-20 card p-12">
              <div className="w-16 h-16 mx-auto mb-6 bg-bg-muted rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text-base mb-2">No CVs yet</h2>
              <p className="text-text-dim mb-6 max-w-md mx-auto">Create your first CV to get started</p>
              <button onClick={handleNewCv} className="btn-primary">
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cvs.map(cv => (
                <div
                  key={cv.id}
                  onClick={() => setSelectedCvId(cv.id)}
                  className="group relative card p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-bg-muted rounded-xl flex items-center justify-center text-text-dim font-bold text-lg group-hover:text-text-base transition-colors">
                      {cv.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge">{cv.templateId}</span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuId(activeMenuId === cv.id ? null : cv.id)
                          }}
                          className="p-2 text-text-dim hover:text-text-base rounded-lg hover:bg-bg-muted transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                        
                        {activeMenuId === cv.id && (
                          <div className="absolute right-0 mt-2 w-44 card shadow-xl z-20 overflow-hidden p-1">
                            <button
                              onClick={(e) => handleDelete(e, cv.id)}
                              className="w-full px-4 py-3 text-left text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-3"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a2 2 0 00-2 2v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-text-base mb-1">{cv.title}</h3>
                  <p className="text-sm text-text-dim">
                    {new Date(cv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <CvEditor cvId={selectedCvId} onBack={() => setSelectedCvId(null)} />
      )}
    </div>
  )
}

export default App