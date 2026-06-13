import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { exportPdf } from '../api/cvApi';
import { useThemeStore } from '../store/themeStore';
import { PersonalInfoForm } from './PersonalInfoForm';
import { ExperienceList } from './ExperienceList';
import { EducationList } from './EducationList';
import { SkillList } from './SkillList';
import { ProjectList } from './ProjectList';
import { MultiPagePreview, PAGE_WIDTH } from '../templates/CvPreview';
import { ACCENT_SWATCHES, TEMPLATE_DEFAULTS, type FontChoice, type Density } from '../templates/customization';
import { ConfirmDialog } from './ConfirmDialog';

interface CvEditorProps {
  cvId: string;
  onBack: () => void;
}

const defaultFormData: CVFormData = {
  title: 'My CV',
  templateId: 'CLASSIC',
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  personalInfo: { name: '', email: '', phone: '', location: '', linkedinUrl: '', githubUrl: '', summary: '', photoUrl: '' },
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
};

const normalizeSkillLevel = (value: unknown): Skill['level'] => {
  if (typeof value !== 'string') return '';
  switch (value.trim().toLowerCase()) {
    case 'beginner': return 'Beginner';
    case 'intermediate': return 'Intermediate';
    case 'advanced': return 'Advanced';
    case 'expert': return 'Expert';
    default: return '';
  }
};

type WithId = { id: string };
const sortById = <T extends WithId>(arr: T[]): T[] =>
  [...arr].sort((a, b) => a.id.localeCompare(b.id));

const normalizeForSnapshot = (data: CVFormData): string =>
  JSON.stringify({
    ...data,
    experiences: sortById(data.experiences),
    educations: sortById(data.educations),
    skills: sortById(data.skills),
    projects: sortById(data.projects),
  });

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
    photoUrl: cv.personalInfo?.photoUrl ?? '',
  },
  experiences: cv.experiences ?? [],
  educations: cv.educations ?? [],
  skills: (cv.skills ?? []).map(skill => ({ ...skill, level: normalizeSkillLevel(skill.level) })),
  projects: cv.projects ?? [],
  accentColor: cv.accentColor,
  fontFamily: cv.fontFamily,
  density: cv.density,
});

/* ── Section metadata ─────────────────────────────────────────── */

const SECTIONS: Record<SectionId, { label: string; path: string }> = {
  personal: {
    label: 'Personal Info',
    path: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z',
  },
  experience: {
    label: 'Experience',
    path: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  education: {
    label: 'Education',
    path: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  },
  skills: {
    label: 'Skills',
    path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  projects: {
    label: 'Projects',
    path: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
  },
};

const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: 'CLASSIC',   label: 'Classic',   desc: 'Traditional' },
  { id: 'MODERN',    label: 'Modern',    desc: 'Clean & bold' },
  { id: 'ATS',       label: 'ATS',       desc: 'Bot-friendly' },
  { id: 'PRO',       label: 'Pro',       desc: 'Academic' },
  { id: 'MINIMAL',   label: 'Minimal',   desc: 'Clean & spare' },
  { id: 'EXECUTIVE', label: 'Executive', desc: 'Corporate' },
  { id: 'TECH',      label: 'Tech',      desc: 'Engineer' },
  { id: 'GRADUATE',  label: 'Graduate',  desc: 'Entry level' },
  { id: 'SIDEBAR',   label: 'Sidebar',   desc: 'Colored rail' },
  { id: 'COMPACT',   label: 'Compact',   desc: 'Dense one-page' },
  { id: 'TIMELINE',  label: 'Timeline',  desc: 'Dated rail' },
  { id: 'AURORA',    label: 'Aurora',    desc: 'Photo header' },
  { id: 'POLISHED',  label: 'Polished',  desc: 'Photo sidebar' },
];

/* ─────────────────────────────────────────────────────────────── */

export function CvEditor({ cvId, onBack }: CvEditorProps) {
  const { cvs, updateCv, loading } = useCvStore();
  const { resolved: theme, setMode } = useThemeStore();
  const cv = cvs.find(c => c.id === cvId);

  const [formData, setFormData]                   = useState<CVFormData>(defaultFormData);
  const [expandedSection, setExpandedSection]     = useState<string>('personal');
  const [showPreview, setShowPreview]             = useState(true);
  const [leftWidth, setLeftWidth]                 = useState(42);
  const [isResizing, setIsResizing]               = useState(false);
  const [previewZoom, setPreviewZoom]             = useState(100);
  const [pageCount, setPageCount]                 = useState<number>(1);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>(JSON.stringify(defaultFormData));
  const [showUnsavedLeaveWarning, setShowUnsavedLeaveWarning] = useState(false);
  const [hydratedCvId, setHydratedCvId]           = useState<string | null>(null);
  const [draggedSection, setDraggedSection]       = useState<SectionId | null>(null);
  const [isExporting, setIsExporting]             = useState(false);
  const [autosaveState, setAutosaveState]         = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  /* Autosave plumbing — refs avoid stale closures inside the debounced timer. */
  const AUTOSAVE_DELAY = 1500;
  const autosaveTimer = useRef<number | null>(null);
  const savingRef     = useRef(false); // a save is currently in flight
  const pendingRef    = useRef(false); // a change landed while a save was in flight

  const fitZoom = showPreview
    ? Math.floor(((window.innerWidth * (100 - leftWidth) / 100) - 48) / PAGE_WIDTH * 100)
    : 75;

  const currentSnapshot  = useMemo(() => JSON.stringify(formData), [formData]);
  const hasUnsavedChanges = currentSnapshot !== lastSavedSnapshot;
  const isDark = theme === 'dark';

  /* ── Hydration ── */
  useEffect(() => { setHydratedCvId(null); }, [cvId]);

  useEffect(() => {
    if (!cv || hydratedCvId === cv.id) return;
    const loaded = toFormData(cv);
    setFormData(loaded);
    setLastSavedSnapshot(JSON.stringify(loaded));
    setHydratedCvId(cv.id);
  }, [cv, hydratedCvId]);

  /* ── Beforeunload guard ── */
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [hasUnsavedChanges]);

  /* ── Resizer ── */
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!isResizing) return;
      const w = (e.clientX / window.innerWidth) * 100;
      if (w > 20 && w < 80) setLeftWidth(w);
    };
    const up = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    }
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [isResizing]);

  /* ── Updaters ── */
  const updatePersonalInfo = (personalInfo: PersonalInfo) => setFormData({ ...formData, personalInfo });
  const updateExperience   = (experiences: Experience[]) => setFormData({ ...formData, experiences });
  const updateEducation    = (educations: Education[])   => setFormData({ ...formData, educations });
  const updateSkills       = (skills: Skill[])           => setFormData({ ...formData, skills });
  const updateProjects     = (projects: Project[])       => setFormData({ ...formData, projects });

  /* ── Customization (Phase 3) ── */
  const setAccent  = (accentColor?: string)     => setFormData({ ...formData, accentColor });
  const setFont    = (fontFamily?: FontChoice)  => setFormData({ ...formData, fontFamily });
  const setDensity = (density?: Density)        => setFormData({ ...formData, density });

  const updateTemplate = (templateId: TemplateId) => {
    if (templateId === formData.templateId) return;
    const prev = currentSnapshot;
    const next: CVFormData = { ...formData, templateId };
    const nextSnap = JSON.stringify(next);
    const shouldAutoSave = !hasUnsavedChanges && Boolean(cvId) && hydratedCvId === cvId;
    setFormData(next);
    if (!shouldAutoSave) return;
    setLastSavedSnapshot(nextSnap);
    void (async () => {
      try { await updateCv(cvId, next); }
      catch { setLastSavedSnapshot(prev); toast.error('Template change was not saved'); }
    })();
  };

  /* ── Save core ──
     Shared by autosave (quiet) and the explicit Save button / Ctrl+S (toast=true).
     Reads the latest form data via refs so the debounced timer never persists a
     stale snapshot. Serializes overlapping saves with savingRef/pendingRef. */
  const formDataRef = useRef(formData);
  const savedSnapRef = useRef(lastSavedSnapshot);
  // Declared before `commit` so the pending-resave path can recurse without
  // `commit` referencing itself (which would block memoization).
  const commitRef = useRef<((opts?: { toast?: boolean }) => Promise<boolean>) | null>(null);

  const commit = useCallback(async (opts?: { toast?: boolean }): Promise<boolean> => {
    if (!cvId || hydratedCvId !== cvId) return false;
    const data = formDataRef.current;
    const snap = JSON.stringify(data);
    if (snap === savedSnapRef.current) return true;      // nothing to save
    if (savingRef.current) { pendingRef.current = true; return false; } // coalesce

    savingRef.current = true;
    setAutosaveState('saving');
    try {
      const attempted = normalizeForSnapshot(data);
      const saved = await updateCv(cvId, data);
      if (normalizeForSnapshot(toFormData(saved)) !== attempted) {
        setAutosaveState('error');
        if (opts?.toast) toast.error('Some fields were not saved. Please try again.');
        return false;
      }
      setLastSavedSnapshot(snap);
      setAutosaveState('saved');
      if (opts?.toast) toast.success('Saved');
      return true;
    } catch {
      setAutosaveState('error');
      if (opts?.toast) toast.error('Save failed');
      return false;
    } finally {
      savingRef.current = false;
      // A change arrived mid-save → persist the delta right away.
      if (pendingRef.current) {
        pendingRef.current = false;
        autosaveTimer.current = window.setTimeout(() => void commitRef.current?.(), 300);
      }
    }
  }, [cvId, hydratedCvId, updateCv]);

  // Sync refs after each render (kept out of render body so the linter is happy).
  useEffect(() => {
    formDataRef.current = formData;
    savedSnapRef.current = lastSavedSnapshot;
    commitRef.current = commit;
  });

  const handleSave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    void commit({ toast: true });
  }, [commit]);

  /* ── Debounced autosave ── */
  useEffect(() => {
    if (!cvId || hydratedCvId !== cvId || !hasUnsavedChanges) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(() => void commit(), AUTOSAVE_DELAY);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [currentSnapshot, hasUnsavedChanges, cvId, hydratedCvId, commit]);

  /* ── Best-effort flush on unmount (covers in-app navigation away) ── */
  useEffect(() => () => { void commitRef.current?.(); }, []);

  /* ── Ctrl+S = save now ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleSave]);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const t = toast.loading('Generating PDF…');
    try {
      // Cancel any pending autosave so it can't race this export's own save.
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      const attempted = normalizeForSnapshot(formData);
      const saved = await updateCv(cvId, formData);
      if (normalizeForSnapshot(toFormData(saved)) !== attempted) {
        toast.error('Export blocked — latest edits were not saved', { id: t });
        return;
      }
      setLastSavedSnapshot(currentSnapshot);
      setAutosaveState('saved');
      const blob = await exportPdf(cvId);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${formData.title || 'resume'}.pdf`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success('PDF downloaded', { id: t });
    } catch { toast.error('Export failed', { id: t }); }
    finally { setIsExporting(false); }
  };

  const handleBackClick = async () => {
    if (!hasUnsavedChanges) { onBack(); return; }
    // Autosave guarantees persistence — flush now and leave. Only warn if it fails.
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    const ok = await commit();
    if (ok) onBack();
    else setShowUnsavedLeaveWarning(true);
  };

  const toggleSection = (id: string) => setExpandedSection(expandedSection === id ? '' : id);

  const moveSection = (src: SectionId, dst: SectionId) => {
    if (src === dst) return;
    const order = [...normalizeSectionOrder(formData.sectionOrder)];
    const si = order.indexOf(src), di = order.indexOf(dst);
    if (si < 0 || di < 0) return;
    order.splice(si, 1); order.splice(di, 0, src);
    setFormData({ ...formData, sectionOrder: order });
  };

  /* ── Section helpers ── */
  const sectionHasData = (id: SectionId): boolean => {
    switch (id) {
      case 'personal':   return !!(formData.personalInfo.name || formData.personalInfo.email);
      case 'experience': return formData.experiences.length > 0;
      case 'education':  return formData.educations.length > 0;
      case 'skills':     return formData.skills.length > 0;
      case 'projects':   return formData.projects.length > 0;
      default:           return false;
    }
  };
  const sectionCount = (id: SectionId): number | null => {
    switch (id) {
      case 'experience': return formData.experiences.length;
      case 'education':  return formData.educations.length;
      case 'skills':     return formData.skills.length;
      case 'projects':   return formData.projects.length;
      default:           return null;
    }
  };

  const filledSections = (Object.keys(SECTIONS) as SectionId[]).filter(sectionHasData).length;
  const totalSections  = Object.keys(SECTIONS).length;
  const strengthPct    = Math.round((filledSections / totalSections) * 100);

  const orderedSections = normalizeSectionOrder(formData.sectionOrder).map(id => ({ id, ...SECTIONS[id] }));

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
    accentColor: formData.accentColor,
    fontFamily: formData.fontFamily,
    density: formData.density,
    createdAt: cv?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f7f7f6] dark:bg-[#141414]">

      {/* ══ TOP BAR ══════════════════════════════════════════════════════ */}
      <header className="h-[52px] flex-shrink-0 flex items-center gap-2 px-4 bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-[#252525] z-10">

        {/* ── Left cluster ── */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 dark:text-[#555] hover:text-[#111] dark:hover:text-white transition-colors shrink-0 pr-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Dashboard
        </button>

        <div className="w-px h-4 bg-gray-200 dark:bg-[#333] shrink-0" />

        {/* Inline-editable title */}
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="text-[14px] font-semibold text-[#111] dark:text-white bg-transparent border-none outline-none w-44 truncate placeholder:text-gray-300 dark:placeholder:text-[#444] focus:bg-gray-50 dark:focus:bg-white/[0.05] px-2 py-1 rounded-lg transition-colors"
          placeholder="Resume title"
        />

        {/* Auto-save status */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
            autosaveState === 'saving'   ? 'bg-blue-500 animate-pulse'
            : autosaveState === 'error'  ? 'bg-red-500'
            : hasUnsavedChanges          ? 'bg-amber-400'
            :                              'bg-emerald-500'
          }`} />
          <span className="text-[11.5px] text-gray-400 dark:text-[#666] hidden md:block">
            {autosaveState === 'saving'  ? 'Saving…'
            : autosaveState === 'error'  ? 'Save failed'
            : hasUnsavedChanges          ? 'Saving soon…'
            :                              'Saved'}
          </span>
        </div>

        <div className="flex-1" />

        {/* ── Right cluster ── */}

        {/* Preview toggle */}
        <button
          onClick={() => setShowPreview(v => !v)}
          className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg text-gray-500 dark:text-[#777] hover:text-[#111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all"
          title={showPreview ? 'Hide preview' : 'Show preview'}
        >
          {showPreview ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
          <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Preview'}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setMode(theme === 'light' ? 'dark' : 'light')}
          className="p-1.5 rounded-lg text-gray-400 dark:text-[#555] hover:text-[#111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-all"
          title="Toggle theme"
        >
          {isDark ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        {/* Save — only visible when dirty */}
        {hasUnsavedChanges && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-gray-600 dark:text-[#aaa] hover:text-[#111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] disabled:opacity-40 transition-all"
          >
            Save
          </button>
        )}

        {/* Export PDF — primary CTA */}
        <button
          onClick={handleDownloadPdf}
          disabled={isExporting}
          className="flex items-center gap-1.5 text-[12.5px] font-semibold px-4 py-[7px] bg-[#111111] dark:bg-white hover:bg-[#2a2a2a] dark:hover:bg-gray-100 active:scale-[0.98] text-white dark:text-[#111111] rounded-lg transition-all disabled:opacity-50 shrink-0 ml-1"
        >
          {isExporting ? (
            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          Export PDF
        </button>
      </header>

      {/* ══ BODY ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div
          style={{ width: showPreview ? `${leftWidth}%` : '100%' }}
          className="flex flex-col bg-[#f7f7f6] dark:bg-[#161616] overflow-hidden flex-shrink-0"
        >
          {/* Template selector + strength — single compact header */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 dark:border-[#222] space-y-2.5">

            {/* Template segmented control */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10.5px] font-semibold text-gray-400 dark:text-[#555] uppercase tracking-widest shrink-0">
                Template
              </span>
              <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-[#1e1e1e] rounded-lg p-0.5 overflow-x-auto min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => updateTemplate(t.id)}
                    title={t.desc}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                      formData.templateId === t.id
                        ? 'bg-white dark:bg-[#2a2a2a] text-[#111] dark:text-white shadow-sm'
                        : 'text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#aaa]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customize row — accent / font / density */}
            {(() => {
              const def = TEMPLATE_DEFAULTS[formData.templateId] ?? TEMPLATE_DEFAULTS.CLASSIC;
              const activeAccent  = formData.accentColor ?? def.accent;
              const activeFont    = formData.fontFamily  ?? def.font;
              const activeDensity = formData.density     ?? def.density;
              const densities: { id: Density; label: string }[] = [
                { id: 'compact', label: 'Compact' },
                { id: 'normal',  label: 'Normal' },
                { id: 'relaxed', label: 'Relaxed' },
              ];
              return (
                <div className="flex items-center gap-3 min-w-0 flex-wrap">
                  <span className="text-[10.5px] font-semibold text-gray-400 dark:text-[#555] uppercase tracking-widest shrink-0">
                    Style
                  </span>

                  {/* Accent swatches */}
                  <div className="flex items-center gap-1">
                    {ACCENT_SWATCHES.map(sw => {
                      const selected = activeAccent.toLowerCase() === sw.value.toLowerCase();
                      return (
                        <button
                          key={sw.value}
                          onClick={() => setAccent(sw.value)}
                          title={sw.name}
                          className={`w-4 h-4 rounded-full transition-transform hover:scale-110 ${selected ? 'ring-2 ring-offset-1 ring-offset-[#f7f7f6] dark:ring-offset-[#161616]' : ''}`}
                          style={{ backgroundColor: sw.value, boxShadow: selected ? `0 0 0 2px ${sw.value}` : 'inset 0 0 0 1px rgba(0,0,0,0.1)' }}
                        />
                      );
                    })}
                    {formData.accentColor && (
                      <button
                        onClick={() => setAccent(undefined)}
                        title="Reset to template default"
                        className="ml-0.5 text-[10px] text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#aaa]"
                      >
                        reset
                      </button>
                    )}
                  </div>

                  {/* Font toggle */}
                  <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-[#1e1e1e] rounded-md p-0.5">
                    {(['sans', 'serif'] as FontChoice[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setFont(f)}
                        className={`px-2 py-0.5 text-[11px] rounded transition-all ${
                          activeFont === f
                            ? 'bg-white dark:bg-[#2a2a2a] text-[#111] dark:text-white shadow-sm'
                            : 'text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#aaa]'
                        }`}
                        style={{ fontFamily: f === 'serif' ? 'Georgia, serif' : 'Inter, sans-serif' }}
                      >
                        {f === 'serif' ? 'Serif' : 'Sans'}
                      </button>
                    ))}
                  </div>

                  {/* Density toggle */}
                  <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-[#1e1e1e] rounded-md p-0.5">
                    {densities.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setDensity(d.id)}
                        className={`px-2 py-0.5 text-[11px] rounded transition-all ${
                          activeDensity === d.id
                            ? 'bg-white dark:bg-[#2a2a2a] text-[#111] dark:text-white shadow-sm'
                            : 'text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#aaa]'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Resume strength — compact single row */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-gray-400 dark:text-[#555] shrink-0">Strength</span>
              <div className="flex-1 h-1 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${strengthPct}%`,
                    background: strengthPct >= 80 ? '#10b981' : strengthPct >= 50 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <span
                className="text-[11px] font-semibold shrink-0 tabular-nums"
                style={{ color: strengthPct >= 80 ? '#10b981' : strengthPct >= 50 ? '#f59e0b' : '#ef4444' }}
              >
                {strengthPct}%
              </span>
            </div>
          </div>

          {/* Section list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2.5 space-y-0.5">
            {orderedSections.map(section => {
              const expanded = expandedSection === section.id;
              const hasDat   = sectionHasData(section.id);
              const cnt      = sectionCount(section.id);

              return (
                <div
                  key={section.id}
                  className={`rounded-lg transition-all duration-150 ${
                    expanded
                      ? 'bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] shadow-sm shadow-black/[0.04] dark:shadow-none mb-1'
                      : 'hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                  } ${draggedSection === section.id ? 'opacity-40 scale-[0.98]' : ''}`}
                  draggable
                  onDragStart={e => { setDraggedSection(section.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', section.id); }}
                  onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={e => { e.preventDefault(); const src = (e.dataTransfer.getData('text/plain') || draggedSection) as SectionId | null; if (src) moveSection(src, section.id); setDraggedSection(null); }}
                  onDragEnd={() => setDraggedSection(null)}
                >
                  {/* Row header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                  >
                    {/* Drag grip */}
                    <span className="text-gray-200 dark:text-[#333] hover:text-gray-400 dark:hover:text-[#555] cursor-grab active:cursor-grabbing flex-shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                        <circle cx="4.5" cy="4" r="1.1" /><circle cx="4.5" cy="8" r="1.1" /><circle cx="4.5" cy="12" r="1.1" />
                        <circle cx="10.5" cy="4" r="1.1" /><circle cx="10.5" cy="8" r="1.1" /><circle cx="10.5" cy="12" r="1.1" />
                      </svg>
                    </span>

                    {/* Section icon */}
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                      expanded
                        ? 'bg-[#111] dark:bg-white'
                        : 'bg-gray-100 dark:bg-[#252525]'
                    }`}>
                      <svg
                        className={`w-3 h-3 transition-colors ${expanded ? 'text-white dark:text-[#111]' : 'text-gray-400 dark:text-[#666]'}`}
                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={section.path} />
                      </svg>
                    </div>

                    {/* Label */}
                    <span className={`flex-1 text-[13px] font-medium transition-colors ${
                      expanded ? 'text-[#111] dark:text-white' : 'text-gray-600 dark:text-[#999]'
                    }`}>
                      {section.label}
                    </span>

                    {/* Item count pill */}
                    {cnt !== null && cnt > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-[#252525] text-gray-400 dark:text-[#666]">
                        {cnt}
                      </span>
                    )}

                    {/* Completion dot */}
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                      hasDat ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-[#333]'
                    }`} />

                    {/* Chevron */}
                    <svg
                      className={`w-3.5 h-3.5 text-gray-300 dark:text-[#444] transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  {expanded && (
                    <div className="px-3 pb-4 pt-2 border-t border-gray-100 dark:border-[#232323]">
                      {section.id === 'personal'   && <PersonalInfoForm personalInfo={formData.personalInfo} onChange={updatePersonalInfo} />}
                      {section.id === 'experience' && <ExperienceList   experiences={formData.experiences}   onChange={updateExperience} />}
                      {section.id === 'education'  && <EducationList    education={formData.educations}       onChange={updateEducation} />}
                      {section.id === 'skills'     && <SkillList        skills={formData.skills}             onChange={updateSkills} />}
                      {section.id === 'projects'   && <ProjectList      projects={formData.projects}         onChange={updateProjects} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RESIZE HANDLE — hairline + wide invisible hit area ─────────── */}
        {showPreview && (
          <div
            onMouseDown={() => setIsResizing(true)}
            className="w-[1px] flex-shrink-0 cursor-col-resize relative group bg-gray-200 dark:bg-[#252525] hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors duration-150"
          >
            {/* Invisible wider hit-area so it's easy to grab */}
            <div className="absolute inset-y-0 -left-2 -right-2" />
          </div>
        )}

        {/* ── RIGHT PANEL: LIVE PREVIEW ──────────────────────────────────── */}
        {showPreview && (
          <div
            style={{ width: `${100 - leftWidth}%` }}
            className="flex flex-col overflow-hidden flex-shrink-0"
          >
            {/* Preview bar — matches top bar style */}
            <div className="h-[52px] flex-shrink-0 flex items-center justify-between px-4 bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-[#252525]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[12px] font-medium text-gray-400 dark:text-[#666]">Live Preview</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <div className="flex items-center bg-gray-100 dark:bg-[#1e1e1e] rounded-lg p-0.5">
                  <button
                    onClick={() => setPreviewZoom(p => Math.max(40, p - 10))}
                    disabled={previewZoom <= 40}
                    className="w-7 h-7 flex items-center justify-center text-[14px] font-bold text-gray-500 dark:text-[#777] hover:text-[#111] dark:hover:text-white disabled:opacity-30 rounded-md hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-all"
                  >−</button>
                  <button
                    onClick={() => setPreviewZoom(100)}
                    className="px-2 h-7 text-[11px] font-semibold font-mono text-gray-600 dark:text-[#aaa] hover:text-[#111] dark:hover:text-white transition-colors min-w-[40px] text-center"
                  >{previewZoom}%</button>
                  <button
                    onClick={() => setPreviewZoom(p => Math.min(150, p + 10))}
                    disabled={previewZoom >= 150}
                    className="w-7 h-7 flex items-center justify-center text-[14px] font-bold text-gray-500 dark:text-[#777] hover:text-[#111] dark:hover:text-white disabled:opacity-30 rounded-md hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-all"
                  >+</button>
                  <button
                    onClick={() => setPreviewZoom(fitZoom)}
                    title="Fit page to panel"
                    className="px-2 h-7 text-[10px] font-semibold text-gray-500 dark:text-[#777] hover:text-[#111] dark:hover:text-white rounded-md hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-all border-l border-gray-200 dark:border-[#3a3a3a] ml-0.5 pl-2"
                  >Fit</button>
                </div>

                {/* Page count badge */}
                <span className={`text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                  pageCount > 1
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                    : 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-500 dark:text-[#666]'
                }`}>
                  {pageCount === 1 ? '1 page' : `${pageCount} pages ⚠`}
                </span>

                {/* Template badge */}
                <span className="text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#1e1e1e] text-gray-500 dark:text-[#666]">
                  {formData.templateId}
                </span>
              </div>
            </div>

            {/* Canvas — Figma/Canva warm canvas feel */}
            <div
              className={`flex-1 overflow-auto flex items-start justify-center py-10 px-6 ${
                isDark
                  ? 'bg-[#1c1c1c] bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:22px_22px]'
                  : 'bg-[#EFEFED] bg-[radial-gradient(#DDDDD8_1px,transparent_1px)] [background-size:22px_22px]'
              }`}
            >
              <div
                className="flex-shrink-0"
                style={{
                  transform:       `scale(${previewZoom / 100})`,
                  transformOrigin: 'top center',
                  width:           `${PAGE_WIDTH}px`,
                }}
              >
                {/* Layered paper shadow — close ambient + far cast */}
                <div className="rounded-sm overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08),0_16px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_60px_rgba(0,0,0,0.6)]">
                  <MultiPagePreview cv={previewCv} onPageCountChange={setPageCount} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showUnsavedLeaveWarning}
        title="Unsaved changes"
        message="You have unsaved changes. If you leave now, those edits will be lost."
        confirmLabel="Leave without saving"
        cancelLabel="Stay"
        onConfirm={() => { setShowUnsavedLeaveWarning(false); onBack(); }}
        onCancel={() => setShowUnsavedLeaveWarning(false)}
      />
    </div>
  );
}
