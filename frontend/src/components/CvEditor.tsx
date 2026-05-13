import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { CVFormData, TemplateId, Experience, Education, Skill, Project, PersonalInfo, Cv } from '../types/cv';
import { useCvStore } from '../store/cvStore';
import { PersonalInfoForm } from './PersonalInfoForm';
import { ExperienceList } from './ExperienceList';
import { EducationList } from './EducationList';
import { SkillList } from './SkillList';
import { ProjectList } from './ProjectList';
import { TemplateSelector } from './TemplateSelector';
import { CvPreview } from '../templates/CvPreview';

interface CvEditorProps {
  cvId: string;
  onBack: () => void;
}

const defaultFormData: CVFormData = {
  title: 'My CV',
  templateId: 'CLASSIC',
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  },
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
};

export function CvEditor({ cvId, onBack }: CvEditorProps) {
  const { cvs, updateCv, loading } = useCvStore();
  const cv = cvs.find(c => c.id === cvId);
  
  const [formData, setFormData] = useState<CVFormData>(defaultFormData);
  const [expandedSection, setExpandedSection] = useState<string>('personal');
  const [showPreview, setShowPreview] = useState(true);
  const [leftWidth, setLeftWidth] = useState(45); // percentage
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (cv) {
      setFormData({
        title: cv.title,
        templateId: cv.templateId as TemplateId,
        personalInfo: cv.personalInfo,
        experiences: cv.experiences,
        educations: cv.educations,
        skills: cv.skills,
        projects: cv.projects,
      });
    }
  }, [cv]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, cvId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 15 && newWidth < 85) {
        setLeftWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const updatePersonalInfo = (personalInfo: PersonalInfo) => {
    setFormData({ ...formData, personalInfo });
  };

  const updateExperience = (experiences: Experience[]) => {
    setFormData({ ...formData, experiences });
  };

  const updateEducation = (educations: Education[]) => {
    setFormData({ ...formData, educations });
  };

  const updateSkills = (skills: Skill[]) => {
    setFormData({ ...formData, skills });
  };

  const updateProjects = (projects: Project[]) => {
    setFormData({ ...formData, projects });
  };

  const updateTemplate = (templateId: TemplateId) => {
    setFormData({ ...formData, templateId });
  };

  const handleSave = async () => {
    if (cvId) {
      console.log('Saving CV...', formData);
      try {
        await updateCv(cvId, formData);
        toast.success('Project state persisted');
      } catch (error) {
        console.error('Save failed:', error);
        toast.error('Sync failed');
      }
    }
  };

  const handleDownloadPdf = async () => {
    const loadingToast = toast.loading('Generating production assets...');
    try {
      await updateCv(cvId, formData);
      window.open(`/api/cv/${cvId}/export/pdf?t=${Date.now()}`, '_blank');
      toast.success('Assets ready', { id: loadingToast });
    } catch (error) {
      toast.error('Export failed', { id: loadingToast });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const previewCv: Cv = {
    id: cvId,
    title: formData.title,
    templateId: formData.templateId,
    personalInfo: formData.personalInfo,
    experiences: formData.experiences,
    educations: formData.educations,
    skills: formData.skills,
    projects: formData.projects,
    createdAt: cv?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sections: { id: string; label: string; icon: string }[] = [
    { id: 'personal', label: 'IDENTITY', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'experience', label: 'WORKFLOW', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'education', label: 'FORMATION', icon: 'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
    { id: 'skills', label: 'EXPERTISE', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'projects', label: 'SHIPPED', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
  ];

  return (
    <div className="flex h-[calc(100vh-10rem)] overflow-hidden glass-surface rounded-[2rem]">
      {/* Editor Panel */}
      <div 
        style={{ width: showPreview ? `${leftWidth}%` : '100%' }}
        className="flex flex-col border-r border-border-subtle bg-bg-surface"
      >
        <div className="p-8 pb-4 flex items-center justify-between shrink-0">
          <button
            onClick={onBack}
            className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-white/5 rounded-xl transition-all"
            title="Back to Dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mx-4 flex-1 text-sm font-bold bg-zinc-900/50 border border-white/5 px-4 py-2 rounded-lg focus:border-primary/50 focus:outline-none text-zinc-100 placeholder-zinc-600 uppercase tracking-widest"
            placeholder="PROJECT_TITLE"
          />
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500/50'}`} />
             <span className="text-[10px] font-bold text-zinc-600 tracking-tighter uppercase">{loading ? 'Syncing' : 'Ready'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
          <div className="mb-10">
            <TemplateSelector
              templateId={formData.templateId}
              onChange={updateTemplate}
            />
          </div>

          <div className="space-y-3 mb-8">
            {sections.map((section) => (
              <div key={section.id} className="group">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${expandedSection === section.id ? 'bg-white/[0.04] border-white/10 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${expandedSection === section.id ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-900 text-zinc-500 group-hover:text-zinc-300'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={section.icon} />
                      </svg>
                    </div>
                    <span className={`text-xs font-black tracking-[0.2em] ${expandedSection === section.id ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-400'}`}>{section.label}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-600 transition-transform ${expandedSection === section.id ? 'rotate-180 text-zinc-400' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === section.id && (
                  <div className="mt-4 px-4 pb-6 space-y-6">
                    {section.id === 'personal' && (
                      <PersonalInfoForm
                        personalInfo={formData.personalInfo}
                        onChange={updatePersonalInfo}
                      />
                    )}
                    {section.id === 'experience' && (
                      <ExperienceList
                        experiences={formData.experiences}
                        onChange={updateExperience}
                      />
                    )}
                    {section.id === 'education' && (
                      <EducationList
                        education={formData.educations}
                        onChange={updateEducation}
                      />
                    )}
                    {section.id === 'skills' && (
                      <SkillList
                        skills={formData.skills}
                        onChange={updateSkills}
                      />
                    )}
                    {section.id === 'projects' && (
                      <ProjectList
                        projects={formData.projects}
                        onChange={updateProjects}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 pt-4 flex gap-4 bg-gradient-to-t from-zinc-950 to-transparent shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 btn-primary"
          >
            {loading ? 'SYNCING...' : 'SAVE_CHANGES'}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary"
          >
            {showPreview ? 'CLOSE_VIEW' : 'VIEW_MODE'}
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="btn-secondary !bg-primary !text-white !border-none hover:!bg-primary-dark"
          >
            EXPORT_PDF
          </button>
        </div>
      </div>

      {/* Resize Handle */}
      {showPreview && (
        <div
          onMouseDown={() => setIsResizing(true)}
          className={`w-1 cursor-col-resize transition-all flex items-center justify-center group ${isResizing ? 'bg-primary/50' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <div className="w-1 h-12 bg-white/10 group-hover:bg-white/30 rounded-full" />
        </div>
      )}

      {/* Preview Panel */}
      {showPreview && (
        <div 
          style={{ width: `${100 - leftWidth}%` }}
          className="bg-black/40 overflow-hidden flex flex-col"
        >
          <div className="p-4 px-8 border-b border-white/5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Live Pipeline</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-600 tracking-widest">{formData.templateId}.VIEWPORT</span>
          </div>
          <div className="flex-1 overflow-auto p-16 custom-scrollbar flex justify-center items-start bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="paper-surface shrink-0 mb-20 origin-top">
              <CvPreview cv={previewCv} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}