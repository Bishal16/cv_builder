import { useEffect, useState } from 'react'
import { CvEditor } from './components/CvEditor'
import { useCvStore } from './store/cvStore'

function App() {
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null)
  const { cvs, loadCvs, createCv } = useCvStore()

  useEffect(() => {
    loadCvs()
  }, [loadCvs])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">CV Builder</h1>
            <p className="text-blue-300">Create professional resumes in minutes</p>
          </div>
          <button
            onClick={handleNewCv}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            + New CV
          </button>
        </header>

        {cvs.length === 0 && !selectedCvId ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl text-gray-300 mb-6">No CVs yet</p>
            <button
              onClick={handleNewCv}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Create your first CV
            </button>
          </div>
        ) : selectedCvId ? (
          <CvEditor cvId={selectedCvId} onBack={() => setSelectedCvId(null)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvs.map(cv => (
              <div
                key={cv.id}
                onClick={() => setSelectedCvId(cv.id)}
                className="group p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-blue-400 hover:bg-white/20 cursor-pointer transition-all hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {cv.title.charAt(0).toUpperCase()}
                  </div>
                  <span className="px-3 py-1 bg-blue-500/30 text-blue-300 text-xs font-medium rounded-full">
                    {cv.templateId}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {cv.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  Last updated: {new Date(cv.updatedAt).toLocaleDateString()}
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