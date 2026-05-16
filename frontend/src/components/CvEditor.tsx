import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  DEFAULT_SECTION_ORDER,
  normalizeSectionOrder,
  type CVFormData,
  type TemplateId,
  type SectionId,
  type Experience,
  type Education,
  type Skill,
  type Project,
  type PersonalInfo,
  type Cv,
} from '../types/cv';
import { useCvStore } from '../store/cvStore';
import { useThemeStore } from '../store/themeStore';
import { PersonalInfoForm } from './PersonalInfoForm';
import { ExperienceList } from './ExperienceList';
import { EducationList } from './EducationList';
import { SkillList } from './SkillList';
import { ProjectList } from './ProjectList';
import { TemplateSelector } from './TemplateSelector';
import { MultiPagePreview, PAGE_HEIGHT, PAGE_WIDTH } from '../templates/CvPreview';
import { ConfirmDialog } from './ConfirmDialog';

interface CvEditorProps {
  cvId: string;
  onBack: () => void;
}

const defaultFormData: CVFormData = {
  title: 'My CV',
  templateId: 'CLASSIC',
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    summary: '',
  },
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
};

const normalizeSkillLevel = (value: unknown): Skill['level'] => {
  if (typeof value !== 'string') {
    return '';
  }

  switch (value.trim().toLowerCase()) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
    case 'expert':
      return 'Expert';
    default:
      return '';
  }
};

const toFormData = (cv: Cv): CVFormData => ({
  title: cv.title,
  templateId: cv.templateId as TemplateId,
  sectionOrder: normalizeSectionOrder(cv.sectionOrder),
  personalInfo: {
    name: cv.personalInfo?.name ?? '',
    email: cv.personalInfo?.email ?? '',
    phone: cv.personalInfo?.phone ?? '',
    location: cv.personalInfo?.location ?? '',
    linkedinUrl: cv.personalInfo?.linkedinUrl ?? '',
    githubUrl: cv.personalInfo?.githubUrl ?? '',
    summary: cv.personalInfo?.summary ?? '',
  },
  experiences: cv.experiences ?? [],
  educations: cv.educations ?? [],
  skills: (cv.skills ?? []).map((skill) => ({
    ...skill,
    level: normalizeSkillLevel(skill.level),
  })),
  projects: cv.projects ?? [],
});

const SECTION_DEFINITIONS: Record<SectionId, { label: string; icon: string }> = {
  personal: { label: 'Identity', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  experience: { label: 'Experience', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  education: { label: 'Education', icon: 'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  skills: { label: 'Skills', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  projects: { label: 'Projects', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
};

export function CvEditor({ cvId, onBack }: CvEditorProps) {
  const { cvs, updateCv, loading } = useCvStore();
  const { theme, toggleTheme } = useThemeStore();
  const cv = cvs.find(c => c.id === cvId);
  
  const [formData, setFormData] = useState<CVFormData>(defaultFormData);
  const [expandedSection, setExpandedSection] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);
  const [leftWidth, setLeftWidth] = useState(45);
  const [isResizing, setIsResizing] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>(JSON.stringify(defaultFormData));
  const [showUnsavedLeaveWarning, setShowUnsavedLeaveWarning] = useState(false);
  const [hydratedCvId, setHydratedCvId] = useState<string | null>(null);
  const [draggedSection, setDraggedSection] = useState<SectionId | null>(null);

  const currentSnapshot = useMemo(() => JSON.stringify(formData), [formData]);
  const hasUnsavedChanges = currentSnapshot !== lastSavedSnapshot;

  useEffect(() => {
    setHydratedCvId(null);
  }, [cvId]);

  useEffect(() => {
    if (!cv || hydratedCvId === cv.id) {
      return;
    }

    const loadedFormData = toFormData(cv);
    setFormData(loadedFormData);
    setLastSavedSnapshot(JSON.stringify(loadedFormData));
    setHydratedCvId(cv.id);
  }, [cv, hydratedCvId]);

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
        const attemptedSnapshot = currentSnapshot;
        const savedCv = await updateCv(cvId, formData);
        const savedSnapshot = JSON.stringify(toFormData(savedCv));
        setLastSavedSnapshot(savedSnapshot);
        if (savedSnapshot !== attemptedSnapshot) {
          toast.error('Some fields were not saved. Please restart backend and try again.');
          return;
        }
        toast.success('Saved successfully');
      } catch {
        toast.error('Save failed');
      }
    }
  };

  const handleDownloadPdf = async () => {
    const loadingToast = toast.loading('Generating PDF...');
    try {
      const attemptedSnapshot = currentSnapshot;
      const savedCv = await updateCv(cvId, formData);
      const savedSnapshot = JSON.stringify(toFormData(savedCv));
      setLastSavedSnapshot(savedSnapshot);
      if (savedSnapshot !== attemptedSnapshot) {
        toast.error('Export blocked because latest edits were not saved', { id: loadingToast });
        return;
      }
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

  const zoomOutPreview = () => {
    setPreviewZoom((prev) => Math.max(50, prev - 10));
  };

  const zoomInPreview = () => {
    setPreviewZoom((prev) => Math.min(150, prev + 10));
  };

  const resetPreviewZoom = () => {
    setPreviewZoom(100);
  };

  const previewCv: Cv = {
    id: cvId,
    title: formData.title,
    templateId: formData.templateId,
    sectionOrder: formData.sectionOrder,
    personalInfo: formData.personalInfo,
    experiences: formData.experiences,
    educations: formData.educations,
    skills: formData.skills,
    projects: formData.projects,
    createdAt: cv?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sections = normalizeSectionOrder(formData.sectionOrder).map((id) => ({
    id,
    ...SECTION_DEFINITIONS[id],
  }));

  const moveSection = (sourceSection: SectionId, targetSection: SectionId) => {
    if (sourceSection === targetSection) {
      return;
    }

    const order = [...normalizeSectionOrder(formData.sectionOrder)];
    const sourceIndex = order.indexOf(sourceSection);
    const targetIndex = order.indexOf(targetSection);
    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    order.splice(sourceIndex, 1);
    order.splice(targetIndex, 0, sourceSection);
    setFormData({ ...formData, sectionOrder: order });
  };

  const isDark = theme === 'dark';
  const floatingZoomContainerClass =
    'absolute bottom-6 right-6 z-20 flex items-center gap-1 rounded-2xl border border-border-subtle bg-bg-surface/90 p-1.5 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-bg-surface/80';
  const floatingZoomButtonClass =
    'h-9 w-9 rounded-xl text-sm font-bold text-blue-500 transition-all hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-40 active:scale-95';
  const floatingZoomValueClass =
    'h-9 min-w-[50px] rounded-xl px-3 text-xs font-semibold font-mono text-white shadow-[0_1px_6px_rgba(37,99,235,0.35)] transition-all hover:brightness-110 active:scale-95';

  return (
    <div className="flex h-screen overflow-hidden rounded-none">
      {/* Editor Panel */}
      <div 
        style={{ width: showPreview ? `${leftWidth}%` : '100%' }}
        className="flex flex-col bg-bg-slate-300 border-r border-border-subtle"
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
            <p className="px-1 text-xs text-text-dim">Drag sections to reorder how they appear in your CV.</p>
            {sections.map((section) => (
              <div
                key={section.id}
                className={`card overflow-hidden transition-colors ${draggedSection === section.id ? 'opacity-75' : ''}`}
                draggable
                onDragStart={(event) => {
                  setDraggedSection(section.id);
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', section.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const source = (event.dataTransfer.getData('text/plain') || draggedSection) as SectionId | null;
                  if (source) {
                    moveSection(source, section.id);
                  }
                  setDraggedSection(null);
                }}
                onDragEnd={() => setDraggedSection(null)}
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between p-4 transition-all ${expandedSection === section.id ? '' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="cursor-grab text-text-dim active:cursor-grabbing"
                      title="Drag to reorder section"
                      aria-hidden="true"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="8" cy="6" r="1.5" />
                        <circle cx="8" cy="12" r="1.5" />
                        <circle cx="8" cy="18" r="1.5" />
                        <circle cx="16" cy="6" r="1.5" />
                        <circle cx="16" cy="12" r="1.5" />
                        <circle cx="16" cy="18" r="1.5" />
                      </svg>
                    </span>
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
          className={`relative flex flex-col ${isDark ? 'bg-zinc-950' : 'bg-gray-100'}`}
        >
          <div className="p-4 flex items-center justify-between border-b border-border-subtle shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-text-dim">Live Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-bg-muted transition-all border border-border-subtle text-text-dim hover:text-text-base"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                )}
              </button>
              <span className="text-xs font-mono text-text-dim">{formData.templateId}</span>
            </div>
          </div>
          <div className={floatingZoomContainerClass}>
            <button
              type="button"
              onClick={zoomOutPreview}
              disabled={previewZoom <= 50}
              className={floatingZoomButtonClass}
              title="Zoom out"
            >
              -
            </button>
            <button
              type="button"
              onClick={resetPreviewZoom}
              className={floatingZoomValueClass}
              style={{ backgroundColor: 'var(--primary)' }}
              title="Reset zoom"
            >
              {previewZoom}%
            </button>
            <button
              type="button"
              onClick={zoomInPreview}
              disabled={previewZoom >= 150}
              className={floatingZoomButtonClass}
              title="Zoom in"
            >
              +
            </button>
          </div>
          <div className={`flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center py-8
          ${isDark
      ? 'bg-slate-900 bg-[radial-gradient(#2f2f38_1px,transparent_1px)] [background-size:20px_20px]'
      : 'bg-gray-200 bg-[radial-gradient(#bdbdbd_1px,transparent_1px)] [background-size:20px_20px]'
  }`}
>
            <div
              className="origin-top-left"
              style={{
                transform: `scale(${previewZoom / 100})`,
                width: `${PAGE_WIDTH}px`,
                height: `${PAGE_HEIGHT}px`,
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              <MultiPagePreview cv={previewCv} />
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
