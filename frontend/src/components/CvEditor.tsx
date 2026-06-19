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
  type Certification,
  type Language,
  type Award,
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
import { CertificationList } from './CertificationList';
import { LanguageList } from './LanguageList';
import { AwardList } from './AwardList';
import { MultiPagePreview, CvPreview, PAGE_WIDTH, PAGE_HEIGHT } from '../templates/CvPreview';
import { ACCENT_SWATCHES, TEMPLATE_DEFAULTS, type FontChoice, type Density } from '../templates/customization';
import { computeAtsScore, type AtsResult } from '../utils/atsScore';
import { ConfirmDialog } from './ConfirmDialog';
import { JdTailorPanel } from './JdTailorPanel';
import { CoverLetterModal } from './CoverLetterModal';
import { ShareModal } from './ShareModal';

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
  certifications: [],
  languages: [],
  awards: [],
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
  certifications: cv.certifications ?? [],
  languages: cv.languages ?? [],
  awards: cv.awards ?? [],
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
  certifications: {
    label: 'Certifications',
    path: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  },
  languages: {
    label: 'Languages',
    path: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
  },
  awards: {
    label: 'Awards',
    path: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },
};

// `colorAware` = template actually renders the accent colour. The four fixed
// templates (Classic/ATS/Pro/Minimal) ignore the accent, so the Style row's
// swatches do nothing on them — we surface that in the UI instead of hiding it.
const TEMPLATES: { id: TemplateId; label: string; desc: string; atsSafe: boolean; colorAware: boolean }[] = [
  { id: 'CLASSIC',   label: 'Classic',   desc: 'Traditional',    atsSafe: false, colorAware: false },
  { id: 'MODERN',    label: 'Modern',    desc: 'Clean & bold',   atsSafe: false, colorAware: true  },
  { id: 'ATS',       label: 'ATS',       desc: 'Bot-friendly',   atsSafe: true,  colorAware: false },
  { id: 'PRO',       label: 'Pro',       desc: 'Academic',       atsSafe: false, colorAware: false },
  { id: 'MINIMAL',   label: 'Minimal',   desc: 'Clean & spare',  atsSafe: true,  colorAware: false },
  { id: 'EXECUTIVE', label: 'Executive', desc: 'Corporate',      atsSafe: false, colorAware: true  },
  { id: 'TECH',      label: 'Tech',      desc: 'Engineer',       atsSafe: false, colorAware: true  },
  { id: 'GRADUATE',  label: 'Graduate',  desc: 'Entry level',    atsSafe: true,  colorAware: true  },
  { id: 'SIDEBAR',   label: 'Sidebar',   desc: 'Colored rail',   atsSafe: false, colorAware: true  },
  { id: 'COMPACT',   label: 'Compact',   desc: 'Dense one-page', atsSafe: true,  colorAware: true  },
  { id: 'TIMELINE',  label: 'Timeline',  desc: 'Dated rail',     atsSafe: false, colorAware: true  },
  { id: 'AURORA',    label: 'Aurora',    desc: 'Photo header',   atsSafe: false, colorAware: true  },
  { id: 'POLISHED',  label: 'Polished',  desc: 'Photo sidebar',  atsSafe: false, colorAware: true  },
];

/* Gallery thumbnail that only renders its (expensive) CvPreview once it
   scrolls into view. Until then it shows a cheap skeleton, so opening the
   gallery never pays for all 13 full template renders at once. */
function LazyTemplateThumb({ cv, scale, width, height }: { cv: Cv; scale: number; width: number; height: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => { if (entries.some(e => e.isIntersecting)) { setVisible(true); io.disconnect(); } },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className="relative mx-auto mt-2 overflow-hidden rounded-md bg-white shadow-sm"
      style={{ width, height }}
    >
      {visible ? (
        <>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: PAGE_WIDTH, height: PAGE_HEIGHT }}>
            <CvPreview cv={cv} />
          </div>
          {/* fade the clipped bottom so it doesn't look abruptly cut off */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
        </>
      ) : (
        <div className="w-full h-full bg-gray-50 dark:bg-[#222] animate-pulse" />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */

export function CvEditor({ cvId, onBack }: CvEditorProps) {
  const { cvs, updateCv, loading } = useCvStore();
  const { resolved: theme, setMode } = useThemeStore();
  const cv = cvs.find(c => c.id === cvId);

  const [formData, setFormData]                   = useState<CVFormData>(defaultFormData);
  const [expandedSection, setExpandedSection]     = useState<string>(''); // all collapsed by default
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
  const [showAtsPanel, setShowAtsPanel]           = useState(false);
  const [showJdTailor, setShowJdTailor]           = useState(false);
  const [showCoverLetter, setShowCoverLetter]     = useState(false);
  const [showShare, setShowShare]                 = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [mobileWarningDismissed, setMobileWarningDismissed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );

  /* Autosave plumbing — refs avoid stale closures inside the debounced timer. */
  const AUTOSAVE_DELAY = 1500;
  const autosaveTimer = useRef<number | null>(null);
  const savingRef     = useRef(false); // a save is currently in flight
  const pendingRef    = useRef(false); // a change landed while a save was in flight

  /* Template strip horizontal-scroll affordance (fades + chevrons). */
  const templateStripRef = useRef<HTMLDivElement>(null);
  const [stripEdges, setStripEdges] = useState({ left: false, right: false });
  const updateStripEdges = useCallback(() => {
    const el = templateStripRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setStripEdges({
      left: scrollLeft > 1,
      right: scrollLeft + clientWidth < scrollWidth - 1,
    });
  }, []);
  const scrollStrip = (dir: -1 | 1) =>
    templateStripRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });

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

  /* ── Template strip edge detection (mount + resize + panel resize) ── */
  useEffect(() => {
    updateStripEdges();
    window.addEventListener('resize', updateStripEdges);
    return () => window.removeEventListener('resize', updateStripEdges);
  }, [updateStripEdges, leftWidth, showPreview]);

  /* ── Updaters ── */
  // Functional updaters: always read the latest state. A plain `{ ...formData }`
  // here can capture a STALE closure (e.g. react-quill keeps an onChange from an
  // earlier render) and silently revert every other field — which wiped CVs.
  const updatePersonalInfo   = (personalInfo: PersonalInfo)      => setFormData(prev => ({ ...prev, personalInfo }));
  const updateExperience     = (experiences: Experience[])      => setFormData(prev => ({ ...prev, experiences }));
  const updateEducation      = (educations: Education[])        => setFormData(prev => ({ ...prev, educations }));
  const updateSkills         = (skills: Skill[])                => setFormData(prev => ({ ...prev, skills }));
  const updateProjects       = (projects: Project[])            => setFormData(prev => ({ ...prev, projects }));
  const updateCertifications = (certifications: Certification[]) => setFormData(prev => ({ ...prev, certifications }));
  const updateLanguages      = (languages: Language[])          => setFormData(prev => ({ ...prev, languages }));
  const updateAwards         = (awards: Award[])                => setFormData(prev => ({ ...prev, awards }));

  /* ── Customization (Phase 3) ── */
  const setAccent  = (accentColor?: string)     => setFormData(prev => ({ ...prev, accentColor }));
  const setFont    = (fontFamily?: FontChoice)  => setFormData(prev => ({ ...prev, fontFamily }));
  const setDensity = (density?: Density)        => setFormData(prev => ({ ...prev, density }));

  const updateTemplate = (templateId: TemplateId) => {
    if (templateId === formData.templateId) return;
    const prev = currentSnapshot;
    const next: CVFormData = { ...formData, templateId };
    const nextSnap = JSON.stringify(next);
    const shouldAutoSave = !hasUnsavedChanges && Boolean(cvId) && hydratedCvId === cvId;
    setFormData(curr => ({ ...curr, templateId }));
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
      // Trust the server's 2xx response (updateCv throws on non-2xx). We do NOT
      // byte-compare the round-trip: the backend HTML-sanitizes rich text
      // (e.g. "8+" -> "8&#43;", "&" -> "&amp;"), so an exact match is impossible
      // and produced false "save failed" errors on every freshly-typed save.
      await updateCv(cvId, data);
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
      // Persist latest edits, then export. Trust the 2xx (no brittle round-trip
      // compare — the backend sanitizes rich text so bytes legitimately differ).
      await updateCv(cvId, formData);
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
    setFormData(prev => ({ ...prev, sectionOrder: order }));
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


  // Real ATS score — recomputed live as formData changes.
  const atsResult: AtsResult = useMemo(() => computeAtsScore(formData), [formData]);

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
    certifications: formData.certifications,
    languages: formData.languages,
    awards: formData.awards,
    accentColor: formData.accentColor,
    fontFamily: formData.fontFamily,
    density: formData.density,
    createdAt: cv?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  /* ─────────────── RENDER ─────────────── */

  // Gate the editor on hydration. Until formData reflects the loaded CV, do NOT
  // render the form: otherwise inputs (especially react-quill) mount with empty
  // pre-hydration data and capture a stale onChange that later overwrites the
  // real personalInfo (name/email/photo) with blanks — silent data loss.
  if (!cv || hydratedCvId !== cvId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f7f6] dark:bg-[#141414]">
        <div className="flex items-center gap-3 text-gray-500 dark:text-[#888]">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-[14px] font-medium">Loading resume…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f7f7f6] dark:bg-[#141414]">

      {/* ══ MOBILE WARNING ═══════════════════════════════════════════════ */}
      {!mobileWarningDismissed && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#141414]/95 backdrop-blur-sm p-6 text-center">
          <div className="text-4xl mb-4">💻</div>
          <h2 className="text-white text-xl font-bold mb-2">Best on Desktop</h2>
          <p className="text-gray-400 text-sm max-w-xs mb-6 leading-relaxed">
            The CV editor is optimised for desktop browsers. On mobile, the split-pane layout may be cramped.
          </p>
          <button
            onClick={() => setMobileWarningDismissed(true)}
            className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
          >
            Continue anyway
          </button>
        </div>
      )}

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
          onChange={e => { const title = e.target.value; setFormData(prev => ({ ...prev, title })); }}
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

        {/* Share */}
        <button
          onClick={() => setShowShare(true)}
          title="Share a public link to this resume"
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-[7px] rounded-lg border border-gray-200 dark:border-[#3a3a3a] text-gray-600 dark:text-[#aaa] hover:border-[#F97316]/50 hover:text-[#C2510A] dark:hover:text-white dark:hover:bg-white/[0.05] transition-all shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          <span className="hidden md:inline">Share</span>
        </button>

        {/* Cover letter */}
        <button
          onClick={() => setShowCoverLetter(true)}
          title="Generate a cover letter from this resume"
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-[7px] rounded-lg border border-gray-200 dark:border-[#3a3a3a] text-gray-600 dark:text-[#aaa] hover:border-[#F97316]/50 hover:text-[#C2510A] dark:hover:text-white dark:hover:bg-white/[0.05] transition-all shrink-0"
        >
          <span className="text-[13px]">✉️</span>
          <span className="hidden md:inline">Cover letter</span>
        </button>

        {/* Tailor to JD */}
        <button
          onClick={() => setShowJdTailor(true)}
          title="Tailor resume to a job description"
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-[7px] rounded-lg border border-gray-200 dark:border-[#3a3a3a] text-gray-600 dark:text-[#aaa] hover:border-[#F97316]/50 hover:text-[#C2510A] dark:hover:text-white dark:hover:bg-white/[0.05] transition-all shrink-0"
        >
          <span className="text-[13px]">🎯</span>
          <span className="hidden sm:inline">Tailor</span>
        </button>

        {/* Export PDF — primary CTA */}
        <button
          onClick={handleDownloadPdf}
          disabled={isExporting}
          className="flex items-center gap-1.5 text-[12.5px] font-semibold px-4 py-[7px] bg-[#F97316] hover:bg-orange-600 active:scale-[0.98] text-white rounded-lg transition-all disabled:opacity-50 shrink-0 ml-1"
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
              {/* Scrollable strip with edge fades + chevrons so it's obvious
                  there are more templates than fit. */}
              <div className="relative min-w-0">
                {/* Left fade + chevron */}
                {stripEdges.left && (
                  <>
                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 rounded-l-lg bg-gradient-to-r from-gray-200 dark:from-[#0d0d0d] to-transparent" />
                    <button
                      type="button"
                      onClick={() => scrollStrip(-1)}
                      aria-label="Scroll templates left"
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-5 h-5 flex items-center justify-center rounded-full bg-white dark:bg-[#2a2a2a] text-gray-500 dark:text-[#aaa] shadow-sm hover:text-[#111] dark:hover:text-white"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                  </>
                )}

                <div
                  ref={templateStripRef}
                  onScroll={updateStripEdges}
                  className="flex items-center gap-0.5 bg-gray-200 dark:bg-[#0d0d0d] ring-1 ring-black/[0.06] dark:ring-white/[0.08] rounded-lg p-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => updateTemplate(t.id)}
                      title={`${t.desc} — ${t.atsSafe ? 'ATS-safe single-column' : 'Design layout (multi-column)'}${t.colorAware ? ' · supports colour theme' : ' · fixed colour'}`}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                        formData.templateId === t.id
                          ? 'bg-white dark:bg-[#2a2a2a] text-[#111] dark:text-white shadow-sm'
                          : 'text-gray-400 dark:text-[#666] hover:text-gray-600 dark:hover:text-[#aaa]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.atsSafe ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {t.label}
                      {/* Colour-theme indicator: a swatch showing the active
                          accent for the selected template, else the template's
                          native default. Absent = fixed-colour template. */}
                      {t.colorAware && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0 ring-1 ring-black/10"
                          style={{ backgroundColor: formData.templateId === t.id ? (formData.accentColor ?? TEMPLATE_DEFAULTS[t.id].accent) : TEMPLATE_DEFAULTS[t.id].accent }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Right fade + chevron */}
                {stripEdges.right && (
                  <>
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 rounded-r-lg bg-gradient-to-l from-gray-200 dark:from-[#0d0d0d] to-transparent" />
                    <button
                      type="button"
                      onClick={() => scrollStrip(1)}
                      aria-label="Scroll templates right"
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-5 h-5 flex items-center justify-center rounded-full bg-white dark:bg-[#2a2a2a] text-gray-500 dark:text-[#aaa] shadow-sm hover:text-[#111] dark:hover:text-white"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </>
                )}
              </div>

              {/* Visual gallery trigger — see every template rendered with your
                  own data, then pick one. */}
              <button
                type="button"
                onClick={() => setShowTemplateGallery(true)}
                title="Browse all templates with live previews"
                className="shrink-0 flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md text-gray-500 dark:text-[#888] hover:text-[#111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1e1e1e] transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                Browse all
              </button>
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

                    {/* Custom accent colour — opens the native picker (eyedropper on macOS) */}
                    {(() => {
                      const ac = formData.accentColor;
                      const isCustom = !!ac && !ACCENT_SWATCHES.some(s => s.value.toLowerCase() === ac.toLowerCase());
                      return (
                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'color';
                            input.value = ac && /^#[0-9a-fA-F]{6}$/.test(ac) ? ac : def.accent;
                            input.style.cssText = 'position:fixed;left:-9999px;opacity:0';
                            document.body.appendChild(input);
                            input.addEventListener('change', () => { setAccent(input.value); input.remove(); });
                            input.click();
                          }}
                          title="Custom colour"
                          className={`relative w-4 h-4 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${isCustom ? 'ring-2 ring-offset-1 ring-offset-[#f7f7f6] dark:ring-offset-[#161616]' : ''}`}
                          style={isCustom
                            ? { backgroundColor: ac, boxShadow: `0 0 0 2px ${ac}` }
                            : { background: 'conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
                        >
                          {!isCustom && (
                            <span className="text-[8px] font-bold text-white leading-none" style={{ textShadow: '0 0 2px rgba(0,0,0,0.6)' }}>+</span>
                          )}
                        </button>
                      );
                    })()}

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
                  <div className="flex items-center gap-0.5 bg-gray-200 dark:bg-[#0d0d0d] ring-1 ring-black/[0.06] dark:ring-white/[0.08] rounded-md p-0.5">
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
                  <div className="flex items-center gap-0.5 bg-gray-200 dark:bg-[#0d0d0d] ring-1 ring-black/[0.06] dark:ring-white/[0.08] rounded-md p-0.5">
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

            {/* ATS Score row */}
            {(() => {
              const { score, passed, total, checks } = atsResult;
              const color = score >= 80 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444';
              const failing = checks.filter(c => !c.pass);
              return (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAtsPanel(v => !v)}
                    className="w-full flex items-center gap-3 group"
                  >
                    <span className="text-[10.5px] font-semibold text-gray-400 dark:text-[#555] uppercase tracking-widest shrink-0">ATS Score</span>
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${score}%`, background: color }}
                      />
                    </div>
                    <span className="text-[11.5px] font-bold shrink-0 tabular-nums" style={{ color }}>
                      {score}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-[#555] shrink-0 tabular-nums">
                      {passed}/{total}
                    </span>
                    <svg
                      className={`w-3 h-3 text-gray-400 dark:text-[#555] shrink-0 transition-transform ${showAtsPanel ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expandable checklist */}
                  {showAtsPanel && (
                    <div className="rounded-lg border border-gray-100 dark:border-[#252525] bg-white dark:bg-[#191919] overflow-hidden">
                      {checks.map((c, i) => (
                        <div
                          key={c.id}
                          className={`flex items-start gap-2.5 px-3 py-2 ${i > 0 ? 'border-t border-gray-50 dark:border-[#222]' : ''}`}
                        >
                          {/* Pass/fail icon */}
                          {c.pass ? (
                            <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                          )}
                          <div className="min-w-0">
                            <p className={`text-[11px] font-medium leading-tight ${c.pass ? 'text-gray-600 dark:text-[#aaa]' : 'text-gray-800 dark:text-[#ddd]'}`}>
                              {c.label}
                            </p>
                            {!c.pass && (
                              <p className="text-[10.5px] text-amber-600 dark:text-amber-400 mt-0.5 leading-snug">
                                {c.hint}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {failing.length === 0 && (
                        <div className="px-3 py-2.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          All checks pass — your resume is ATS-ready.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
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
                      {section.id === 'personal'        && <PersonalInfoForm personalInfo={formData.personalInfo}               onChange={updatePersonalInfo} />}
                      {section.id === 'experience'      && <ExperienceList   experiences={formData.experiences}               onChange={updateExperience} />}
                      {section.id === 'education'       && <EducationList    education={formData.educations}                  onChange={updateEducation} />}
                      {section.id === 'skills'          && <SkillList        skills={formData.skills}                         onChange={updateSkills} />}
                      {section.id === 'projects'        && <ProjectList      projects={formData.projects}                     onChange={updateProjects} />}
                      {section.id === 'certifications'  && <CertificationList certifications={formData.certifications}        onChange={updateCertifications} />}
                      {section.id === 'languages'       && <LanguageList     languages={formData.languages}                   onChange={updateLanguages} />}
                      {section.id === 'awards'          && <AwardList        awards={formData.awards}                         onChange={updateAwards} />}
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

      {showJdTailor && (
        <JdTailorPanel
          formData={formData}
          onClose={() => setShowJdTailor(false)}
        />
      )}

      {showCoverLetter && (
        <CoverLetterModal
          formData={formData}
          onClose={() => setShowCoverLetter(false)}
        />
      )}

      {showShare && (
        <ShareModal
          cvId={cvId}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Template gallery — live thumbnails of every template rendered with the
          user's own data. Mounted only while open (13 previews aren't cheap). */}
      {showTemplateGallery && (() => {
        const THUMB_SCALE = 0.24;
        const THUMB_W = Math.round(PAGE_WIDTH * THUMB_SCALE); // ~191px
        const THUMB_H = 250; // clip to the top of the page — enough to compare
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setShowTemplateGallery(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
              className="relative bg-white dark:bg-[#1b1b1b] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#333] flex flex-col max-h-[88vh] w-full max-w-4xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#2a2a2a]">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#111] dark:text-white">Choose a template</h2>
                  <p className="text-[12px] text-gray-400 dark:text-[#777]">Previewed with your own CV. Click one to apply it.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplateGallery(false)}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar p-5">
                <div
                  className="grid gap-5 justify-center"
                  style={{ gridTemplateColumns: `repeat(auto-fill, ${THUMB_W + 24}px)` }}
                >
                  {TEMPLATES.map(t => {
                    const active = formData.templateId === t.id;
                    const thumbCv: Cv = { ...previewCv, templateId: t.id };
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { updateTemplate(t.id); setShowTemplateGallery(false); }}
                        className={`group flex flex-col items-stretch rounded-xl border-2 transition-all text-left ${
                          active
                            ? 'border-[#F97316] ring-2 ring-[#F97316]/20'
                            : 'border-gray-200 dark:border-[#2e2e2e] hover:border-gray-300 dark:hover:border-[#444]'
                        }`}
                      >
                        <LazyTemplateThumb cv={thumbCv} scale={THUMB_SCALE} width={THUMB_W} height={THUMB_H} />
                        <div className="flex items-center gap-1.5 px-2.5 py-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.atsSafe ? 'bg-emerald-400' : 'bg-amber-400'}`} title={t.atsSafe ? 'ATS-safe' : 'Design layout'} />
                          <span className="text-[12.5px] font-medium text-[#111] dark:text-white">{t.label}</span>
                          {t.colorAware && (
                            <span className="w-2 h-2 rounded-full shrink-0 ring-1 ring-black/10" style={{ backgroundColor: active ? (formData.accentColor ?? TEMPLATE_DEFAULTS[t.id].accent) : TEMPLATE_DEFAULTS[t.id].accent }} title="Supports colour theme" />
                          )}
                          {active && <span className="ml-auto text-[10px] font-semibold text-[#F97316] uppercase tracking-wide">Active</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
