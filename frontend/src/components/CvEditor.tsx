import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { CVFormData, TemplateId, Experience, Education, Skill, Project, PersonalInfo, Cv } from '../types/cv';
import { useCvStore } from '../store/cvStore';
import { useThemeStore } from '../store/themeStore';
import { PersonalInfoForm } from './PersonalInfoForm';
import { ExperienceList } from './ExperienceList';
import { EducationList } from './EducationList';
import { SkillList } from './SkillList';
import { ProjectList } from './ProjectList';
import { TemplateSelector } from './TemplateSelector';
import { CvPreview } from '../templates/CvPreview';
import { ConfirmDialog } from './ConfirmDialog';

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
  const { theme } = useThemeStore();
  const cv = cvs.find(c => c.id === cvId);
  
  const [formData, setFormData] = useState<CVFormData>(defaultFormData);
  const [expandedSection, setExpandedSection] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);
  const [leftWidth, setLeftWidth] = useState(45);
  const [isResizing, setIsResizing] = useState(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>(JSON.stringify(defaultFormData));
  const [showUnsavedLeaveWarning, setShowUnsavedLeaveWarning] = useState(false);

  const currentSnapshot = useMemo(() => JSON.stringify(formData), [formData]);
  const hasUnsavedChanges = currentSnapshot !== lastSavedSnapshot;

  useEffect(() => {
    if (cv) {
      const loadedFormData: CVFormData = {
        title: cv.title,
        templateId: cv.templateId as TemplateId,
        personalInfo: cv.personalInfo,
        experiences: cv.experiences,
        educations: cv.educations,
        skills: cv.skills,
        projects: cv.projects,
      };

      setFormData(loadedFormData);
      setLastSavedSnapshot(JSON.stringify(loadedFormData));
    }
  }, [cv]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
    if (templateId === formData.templateId) {
      return;
    }

    const previousSnapshot = currentSnapshot;
    const nextFormData: CVFormData = { ...formData, templateId };
    const nextSnapshot = JSON.stringify(nextFormData);
    const shouldAutoSaveTemplate = !hasUnsavedChanges && Boolean(cvId);

    setFormData(nextFormData);

    if (!shouldAutoSaveTemplate) {
      return;
    }

    // Keep the status as "saved" for template-only switches and persist in background.
    setLastSavedSnapshot(nextSnapshot);
    void (async () => {
      try {
        await updateCv(cvId, nextFormData);
      } catch {
        setLastSavedSnapshot(previousSnapshot);
        toast.error('Template change was not saved');
      }
    })();
  };

  const handleSave = async () => {
    if (cvId) {
      try {
        await updateCv(cvId, formData);
        setLastSavedSnapshot(currentSnapshot);
        toast.success('Saved successfully');
      } catch {
        toast.error('Save failed');
      }
    }
  };

  const handleDownloadPdf = async () => {
    const loadingToast = toast.loading('Generating PDF...');
    try {
      await updateCv(cvId, formData);
      setLastSavedSnapshot(currentSnapshot);
      window.open(`/api/cv/${cvId}/export/pdf?t=${Date.now()}`, '_blank');
      toast.success('PDF ready', { id: loadingToast });
    } catch {
      toast.error('Export failed', { id: loadingToast });
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedLeaveWarning(true);
      return;
    }

    onBack();
  };

  const confirmLeaveWithoutSaving = () => {
    setShowUnsavedLeaveWarning(false);
    onBack();
  };

  const cancelLeaveWithoutSaving = () => {
    setShowUnsavedLeaveWarning(false);
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
    { id: 'personal', label: 'Identity', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'experience', label: 'Experience', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'education', label: 'Education', icon: 'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
    { id: 'skills', label: 'Skills', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'projects', label: 'Projects', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
  ];

  const isDark = theme === 'dark';

  return (
    <div className="flex h-screen overflow-hidden rounded-none">
      {/* Editor Panel */}
      <div 
        style={{ width: showPreview ? `${leftWidth}%` : '100%' }}
        className="flex flex-col bg-bg-surface border-r border-border-subtle"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="p-2 rounded-lg hover:bg-bg-muted transition-colors text-text-dim hover:text-text-base"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field !py-2 !px-3 text-sm font-semibold max-w-xs"
              placeholder="CV Title"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  loading
                    ? 'bg-blue-500 animate-pulse'
                    : hasUnsavedChanges
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
              />
              <span className="text-xs text-text-dim">
                {loading ? 'Saving...' : hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
              </span>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary !py-2 !px-3 text-sm"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="mb-8">
            <TemplateSelector
              templateId={formData.templateId}
              onChange={updateTemplate}
            />
          </div>

          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between p-4 transition-all ${expandedSection === section.id ? '' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                      </svg>
                    </div>
                    <span className="font-semibold text-text-base">{section.label}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-text-dim transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === section.id && (
                  <div className="p-4 pt-0 border-t border-border-subtle bg-bg-muted">
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

        {/* Footer Actions */}
        <div className="p-4 border-t border-border-subtle flex gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex-1"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="btn-primary !bg-emerald-600 hover:!bg-emerald-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Resize Handle */}
      {showPreview && (
        <div
          onMouseDown={() => setIsResizing(true)}
          className={`w-1 cursor-col-resize transition-all flex items-center justify-center group ${isDark ? 'bg-white/5 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          <div className={`w-1 h-12 rounded-full ${isDark ? 'bg-white/20 group-hover:bg-white/40' : 'bg-gray-300 group-hover:bg-gray-400'}`} />
        </div>
      )}

      {/* Preview Panel */}
      {showPreview && (
        <div 
          style={{ width: `${100 - leftWidth}%` }}
          className={`flex flex-col ${isDark ? 'bg-zinc-950' : 'bg-gray-100'}`}
        >
          <div className="p-3 border-b border-border-subtle flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-text-dim">Live Preview</span>
            </div>
            <span className="text-xs font-mono text-text-dim">{formData.templateId}</span>
          </div>
          <div className={`flex-1 overflow-auto p-8 flex justify-center ${isDark ? 'bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:20px_20px]' : 'bg-gray-200'}`}>
            <div className="paper-surface shadow-2xl">
              <CvPreview cv={previewCv} />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showUnsavedLeaveWarning}
        title="Unsaved changes"
        message="You have unsaved changes. If you leave now, those edits will be lost."
        confirmLabel="Leave without saving"
        cancelLabel="Stay"
        onConfirm={confirmLeaveWithoutSaving}
        onCancel={cancelLeaveWithoutSaving}
      />
    </div>
  );
}
