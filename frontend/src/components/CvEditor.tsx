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
  const [showPreview, setShowPreview] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // percentage
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
        console.log('Save successful');
        toast.success('CV saved successfully!');
      } catch (error) {
        console.error('Save failed:', error);
        toast.error('Failed to save CV. Please try again.');
      }
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await updateCv(cvId, formData);
      window.open(`/api/cv/${cvId}/export/pdf?t=${Date.now()}`, '_blank');
    } catch (error) {
      toast.error('Failed to save CV before download.');
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
    { id: 'personal', label: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'experience', label: 'Experience', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'education', label: 'Education', icon: 'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
    { id: 'skills', label: 'Skills', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'projects', label: 'Projects', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden">
      {/* Editor Panel */}
      <div 
        style={{ width: showPreview ? `${leftWidth}%` : '100%' }}
        className="bg-white/10 backdrop-blur-md rounded-l-3xl border border-white/20 shadow-2xl p-6 overflow-y-auto custom-scrollbar flex flex-col"
      >
        <div className="flex items-center mb-6 shrink-0">
          <button
            onClick={onBack}
            className="mr-4 px-4 py-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="flex-1 text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-white/30 focus:border-blue-400 focus:outline-none text-white placeholder-gray-400"
            placeholder="CV Title"
          />
        </div>

        <div className="mb-6 shrink-0">
          <TemplateSelector
            templateId={formData.templateId}
            onChange={updateTemplate}
          />
        </div>

        <div className="space-y-2 mb-6">
          {sections.map((section) => (
            <div key={section.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-white/10 to-transparent hover:from-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                    </svg>
                  </div>
                  <span className="font-medium text-white">{section.label}</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === section.id && (
                <div className="p-4 border-t border-white/10 bg-black/20">
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

        <div className="flex gap-3 sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent mt-auto shrink-0 z-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save CV (Ctrl+S)'}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-6 py-4 bg-white/5 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/10 transition-all border border-white/10"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/30"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Resize Handle */}
      {showPreview && (
        <div
          onMouseDown={() => setIsResizing(true)}
          className={`w-1.5 hover:w-2 bg-white/5 hover:bg-blue-500/50 cursor-col-resize transition-all flex items-center justify-center group ${isResizing ? 'bg-blue-500/50 w-2' : ''}`}
        >
          <div className="w-0.5 h-8 bg-white/20 group-hover:bg-white/50 rounded-full" />
        </div>
      )}

      {/* Preview Panel */}
      {showPreview && (
        <div 
          style={{ width: `${100 - leftWidth}%` }}
          className="bg-white/5 backdrop-blur-sm rounded-r-3xl border-y border-r border-white/20 overflow-hidden flex flex-col shadow-2xl"
        >
          <div className="p-4 bg-black/20 border-b border-white/10 flex justify-between items-center shrink-0">
            <span className="text-sm font-medium text-blue-300">Live Preview</span>
            <span className="text-xs text-gray-400 font-mono">{formData.templateId}</span>
          </div>
          <div className="flex-1 overflow-auto p-12 custom-scrollbar bg-slate-800/30 flex justify-center items-start">
            <div className="origin-top transition-transform shadow-2xl mb-12 shrink-0">
              <CvPreview cv={previewCv} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}