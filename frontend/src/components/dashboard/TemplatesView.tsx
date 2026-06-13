import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Cv, TemplateId } from '../../types/cv';
import { CvPreview, PAGE_WIDTH, PAGE_HEIGHT } from '../../templates/CvPreview';
import { makeSampleCv } from '../../templates/sampleCv';
import { useCvStore } from '../../store/cvStore';
import { useSettingsStore } from '../../store/settingsStore';

/* ── Template metadata ──────────────────────────────────────────── */

type Category = 'simple' | 'professional' | 'modern' | 'entry' | 'creative' | 'photo';

interface TemplateInfo {
  id: TemplateId;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  category: Category;
  isNew?: boolean;
  popular?: boolean;
}

const TEMPLATE_INFO: TemplateInfo[] = [
  { id: 'CLASSIC',   name: 'Classic',   category: 'professional', popular: true, badge: 'Two-column',    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',             description: 'Traditional sidebar layout. A safe, professional default for any industry.' },
  { id: 'MODERN',    name: 'Modern',    category: 'modern',                      badge: 'Bold header',   badgeColor: 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300',            description: 'Dark charcoal header with clean cards. Stands out without being loud.' },
  { id: 'ATS',       name: 'ATS',       category: 'simple', popular: true,       badge: 'ATS-optimized', badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', description: 'Plain single-column, machine-readable. Maximum compatibility with tracking systems.' },
  { id: 'PRO',       name: 'Pro',       category: 'professional',                badge: 'Academic',      badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',     description: 'Dense, formal layout suited to research, academia, and senior IC roles.' },
  { id: 'MINIMAL',   name: 'Minimal',   category: 'simple',                      badge: 'Serif minimal', badgeColor: 'bg-stone-100 text-stone-700 dark:bg-stone-700/40 dark:text-stone-300',        description: 'Generous whitespace and refined typography. Lets your content breathe.' },
  { id: 'EXECUTIVE', name: 'Executive', category: 'professional', isNew: true,   badge: 'Corporate',     badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',         description: 'Centered serif name, bronze accents. For leadership and client-facing roles.' },
  { id: 'TECH',      name: 'Tech',      category: 'modern', isNew: true,         badge: 'Engineer',      badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',                 description: 'Two-column with monospace accents and a grouped tech-stack rail.' },
  { id: 'GRADUATE',  name: 'Graduate',  category: 'entry', isNew: true,          badge: 'Entry level',   badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',             description: 'Friendly teal accents, education-forward. Ideal for students and first jobs.' },
  { id: 'SIDEBAR',   name: 'Sidebar',   category: 'creative', isNew: true,       badge: 'Colored rail',  badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',     description: 'Bold full-height coloured sidebar for contact and skills. Confident and structured.' },
  { id: 'COMPACT',   name: 'Compact',   category: 'simple', isNew: true,         badge: 'One-page',      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',        description: 'Tight, information-dense single page. Fits a long career without spilling over.' },
  { id: 'TIMELINE',  name: 'Timeline',  category: 'creative', isNew: true,       badge: 'Dated rail',    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',             description: 'A connected timeline down your experience. Tells a clear career story.' },
  { id: 'AURORA',    name: 'Aurora',    category: 'photo', isNew: true,          badge: 'Photo header',  badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',     description: 'Gradient header band with your photo. Warm and personable, great for client-facing roles.' },
  { id: 'POLISHED',  name: 'Polished',  category: 'photo', isNew: true,          badge: 'Photo sidebar', badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',             description: 'Refined serif layout with a photo sidebar. Elegant and executive.' },
];

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'simple', label: 'Simple & ATS' },
  { id: 'professional', label: 'Professional' },
  { id: 'modern', label: 'Modern' },
  { id: 'creative', label: 'Creative' },
  { id: 'photo', label: 'With photo' },
  { id: 'entry', label: 'Entry level' },
];

/* ── Scaled template preview ────────────────────────────────────── */

function ScaledPreview({ cv, scale }: { cv: Cv; scale: number }) {
  return (
    <div
      style={{ width: PAGE_WIDTH * scale, height: PAGE_HEIGHT * scale, overflow: 'hidden', flexShrink: 0 }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: PAGE_WIDTH, height: PAGE_HEIGHT, backgroundColor: '#ffffff' }}>
        <CvPreview cv={cv} />
      </div>
    </div>
  );
}

/* ── Preview modal ──────────────────────────────────────────────── */

function PreviewModal({ info, onClose, onUse, creating }: {
  info: TemplateInfo;
  onClose: () => void;
  onUse: (id: TemplateId) => void;
  creating: boolean;
}) {
  const [zoom, setZoom] = useState(60); // % of real page size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#232323] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#383838] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-[#333]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[15px] font-bold text-[#111111] dark:text-white truncate">{info.name}</span>
            <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${info.badgeColor}`}>{info.badge}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center bg-gray-100 dark:bg-[#1e1e1e] rounded-lg p-0.5">
              <button
                onClick={() => setZoom(z => Math.max(40, z - 10))}
                disabled={zoom <= 40}
                title="Zoom out"
                className="w-7 h-7 flex items-center justify-center text-[14px] font-bold text-gray-500 dark:text-[#888] hover:text-[#111] dark:hover:text-white disabled:opacity-30 rounded-md hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-all"
              >−</button>
              <button
                onClick={() => setZoom(60)}
                title="Reset zoom"
                className="px-2 h-7 text-[11px] font-semibold font-mono text-gray-600 dark:text-[#aaa] hover:text-[#111] dark:hover:text-white transition-colors min-w-[42px] text-center"
              >{zoom}%</button>
              <button
                onClick={() => setZoom(z => Math.min(100, z + 10))}
                disabled={zoom >= 100}
                title="Zoom in"
                className="w-7 h-7 flex items-center justify-center text-[14px] font-bold text-gray-500 dark:text-[#888] hover:text-[#111] dark:hover:text-white disabled:opacity-30 rounded-md hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-all"
              >+</button>
            </div>

            <button
              onClick={() => onUse(info.id)}
              disabled={creating}
              className="px-4 py-1.5 rounded-lg text-[12.5px] font-semibold text-white transition-all disabled:opacity-50 whitespace-nowrap active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', boxShadow: '0 4px 12px -4px rgba(249,115,22,.4)' }}
              onMouseOver={e => (e.currentTarget.style.background = '#C2510A')}
              onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)')}

            >
              {creating ? 'Creating…' : 'Use this template'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#111111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-auto p-6 bg-[#EFEFED] dark:bg-[#1c1c1c] custom-scrollbar">
          <div className="shadow-[0_2px_8px_rgba(0,0,0,0.08),0_16px_48px_rgba(0,0,0,0.12)] w-fit mx-auto">
            <ScaledPreview cv={makeSampleCv(info.id)} scale={zoom / 100} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main view ──────────────────────────────────────────────────── */

export function TemplatesView() {
  const navigate = useNavigate();
  const { cvs, createCv } = useCvStore();
  const { defaultTemplateId, setDefaultTemplateId } = useSettingsStore();
  const [previewing, setPreviewing] = useState<TemplateInfo | null>(null);
  const [creatingId, setCreatingId] = useState<TemplateId | null>(null);
  const [category, setCategory] = useState<Category | 'all'>('all');

  const usageCount = (id: TemplateId) => cvs.filter(cv => cv.templateId === id).length;

  const featured = useMemo(
    () => TEMPLATE_INFO.find(t => t.id === defaultTemplateId) ?? TEMPLATE_INFO[0],
    [defaultTemplateId],
  );

  const gridTemplates = useMemo(() => {
    if (category === 'all') return TEMPLATE_INFO.filter(t => t.id !== featured.id);
    return TEMPLATE_INFO.filter(t => t.category === category);
  }, [category, featured]);

  const handleUse = async (templateId: TemplateId) => {
    setCreatingId(templateId);
    try {
      const sample = makeSampleCv(templateId);
      const newCv = await createCv({
        title: 'Untitled Resume',
        templateId,
        sectionOrder: sample.sectionOrder,
        personalInfo: { name: '', email: '', phone: '', location: '', linkedinUrl: '', githubUrl: '', summary: '' },
        experiences: [],
        educations: [],
        skills: [],
        projects: [],
      });
      if (newCv) {
        toast.success('Resume created');
        navigate(`/cv/${newCv.id}`);
      }
    } catch {
      toast.error('Could not create resume');
    } finally {
      setCreatingId(null);
    }
  };

  const makeDefault = (id: TemplateId) => {
    setDefaultTemplateId(id);
    toast.success('Default template updated');
  };

  return (
    <div>
      {/* Heading + category chips */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-[#111111] dark:text-white tracking-tight">Templates</h1>
          <p className="text-[13.5px] text-gray-500 dark:text-[#8d8d8d] mt-1">
            8 professionally designed templates — switch anytime in the editor.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all border ${
                category === c.id
                  ? 'bg-[#F97316] text-white border-transparent shadow-sm'
                  : 'bg-white dark:bg-[#232323] text-gray-500 dark:text-[#8d8d8d] border-gray-300 dark:border-[#3a3a3a] hover:border-[#F97316]/50 dark:hover:border-[#F97316]/40 hover:text-[#C2510A] dark:hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured (your default) — only on "All" ── */}
      {category === 'all' && (
        <div className="mb-8 rounded-2xl border border-gray-300 dark:border-[#444444] bg-white dark:bg-[#232323] overflow-hidden shadow-sm shadow-black/[0.06] dark:shadow-none">
          <div className="flex flex-col md:flex-row">
            {/* Big preview */}
            <div
              className="relative bg-[#EFEFED] dark:bg-[#1c1c1c] bg-[radial-gradient(#DDDDD8_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:18px_18px] flex justify-center items-start pt-8 px-10 md:w-[380px] h-[300px] overflow-hidden flex-shrink-0 cursor-pointer"
              onClick={() => setPreviewing(featured)}
            >
              <div className="shadow-[0_2px_8px_rgba(0,0,0,0.1),0_12px_32px_rgba(0,0,0,0.12)] transition-transform duration-500 hover:-translate-y-2">
                <ScaledPreview cv={makeSampleCv(featured.id)} scale={0.34} />
              </div>
            </div>
            {/* Meta */}
            <div className="flex-1 p-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: '#F97316' }}>Your default</span>
                {featured.popular && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">Popular</span>}
                {featured.isNew && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">New</span>}
              </div>
              <div className="flex items-center gap-2.5 mb-2">
                <h2 className="text-[20px] font-bold text-[#111111] dark:text-white tracking-tight">{featured.name}</h2>
                <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md ${featured.badgeColor}`}>{featured.badge}</span>
              </div>
              <p className="text-[13.5px] text-gray-500 dark:text-[#8d8d8d] leading-relaxed max-w-[440px] mb-5">
                {featured.description} New resumes use this template automatically — change it below or in Settings.
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleUse(featured.id)}
                  disabled={creatingId !== null}
                  className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-50 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12), 0 1px 0 rgba(0,0,0,.1), 0 4px 12px -4px rgba(249,115,22,.4)' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#C2510A')}
                  onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)')}
                >
                  {creatingId === featured.id ? 'Creating…' : 'Use template'}
                </button>
                <button
                  onClick={() => setPreviewing(featured)}
                  className="px-5 py-2 rounded-lg text-[13px] font-semibold border border-gray-300 dark:border-[#3a3a3a] text-[#111111] dark:text-white hover:border-[#F97316]/50 hover:text-[#C2510A] dark:hover:bg-[#2c2c2c] transition-colors"
                >
                  Preview
                </button>
                {usageCount(featured.id) > 0 && (
                  <span className="text-[12px] text-gray-400 dark:text-[#6a6a6a] ml-1">
                    Used by {usageCount(featured.id)} of your resumes
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Gallery grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {gridTemplates.map((info) => {
          const count = usageCount(info.id);
          const isDefault = info.id === defaultTemplateId;
          // pan distance: full sheet height minus visible window
          const sheetH = PAGE_HEIGHT * 0.3;
          const panY = Math.max(0, sheetH + 24 - 248);
          return (
            <div
              key={info.id}
              className="group rounded-2xl border border-gray-300 dark:border-[#444444] bg-white dark:bg-[#232323] overflow-hidden shadow-sm shadow-black/[0.05] dark:shadow-none hover:border-[#F97316]/60 dark:hover:border-[#F97316]/40 hover:shadow-xl hover:shadow-black/[0.10] dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300"
            >
              {/* Preview window — pans down on hover */}
              <div className="relative bg-[#EFEFED] dark:bg-[#1c1c1c] flex justify-center pt-6 px-6 h-[248px] overflow-hidden cursor-pointer" onClick={() => setPreviewing(info)}>
                <div
                  className="shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-transform ease-in-out duration-[2500ms] group-hover:[transform:translateY(var(--pan))]"
                  style={{ '--pan': `-${panY}px` } as React.CSSProperties}
                >
                  <ScaledPreview cv={makeSampleCv(info.id)} scale={0.3} />
                </div>

                {/* Ribbons */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  {info.popular && <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-orange-500 text-white shadow-sm">POPULAR</span>}
                  {info.isNew && <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-sm">NEW</span>}
                  {isDefault && <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded text-white shadow-sm" style={{ background: '#F97316' }}>DEFAULT</span>}
                </div>

                {/* Bottom action bar slides up on hover */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/70 via-black/50 to-transparent pt-8 pb-3 px-3 flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewing(info); }}
                    className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold bg-white/95 text-[#111111] shadow-lg hover:bg-white transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUse(info.id); }}
                    disabled={creatingId !== null}
                    className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white shadow-lg transition-colors disabled:opacity-50"
                    style={{ background: '#F97316' }}
                    onMouseOver={e => (e.currentTarget.style.background = '#EA580C')}
                    onMouseOut={e => (e.currentTarget.style.background = '#F97316')}
                  >
                    {creatingId === info.id ? 'Creating…' : 'Use template'}
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[14px] font-bold text-[#111111] dark:text-white">{info.name}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${info.badgeColor}`}>{info.badge}</span>
                  </div>
                  {/* Set-default star */}
                  <button
                    onClick={() => !isDefault && makeDefault(info.id)}
                    title={isDefault ? 'Default template' : 'Set as default'}
                    className={`p-1 rounded-md transition-colors flex-shrink-0 ${
                      isDefault
                        ? 'text-amber-500 cursor-default'
                        : 'text-gray-300 dark:text-[#4a4a4a] hover:text-amber-500 dark:hover:text-amber-500'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={isDefault ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] text-gray-500 dark:text-[#8d8d8d] leading-relaxed line-clamp-2">{info.description}</p>
                </div>
                {count > 0 && (
                  <p className="text-[10.5px] text-gray-400 dark:text-[#6a6a6a] font-medium mt-2">
                    {count} resume{count > 1 ? 's' : ''} using this
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview modal */}
      {previewing && (
        <PreviewModal
          info={previewing}
          onClose={() => setPreviewing(null)}
          onUse={handleUse}
          creating={creatingId !== null}
        />
      )}
    </div>
  );
}
