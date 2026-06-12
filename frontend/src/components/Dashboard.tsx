import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCvStore } from '../store/cvStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, type ThemeMode } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';
import { exportPdf } from '../api/cvApi';
import type { Cv, TemplateId } from '../types/cv';
import { TemplatesView } from './dashboard/TemplatesView';
import { SettingsView } from './dashboard/SettingsView';
import { Logo } from './Logo';

/* ─────────────────────────── helpers ─────────────────────────── */

function getCompletion(cv: Cv): number {
  let s = 0;
  if (cv.personalInfo.name) s += 20;
  if (cv.personalInfo.email) s += 10;
  if (cv.personalInfo.phone) s += 5;
  if (cv.personalInfo.summary) s += 15;
  if (cv.experiences.length > 0) s += 25;
  if (cv.educations.length > 0) s += 15;
  if (cv.skills.length > 0) s += 10;
  return Math.min(s, 100);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const TEMPLATE_META: Record<TemplateId, { label: string; accent: string; bg: string }> = {
  CLASSIC:   { label: 'Classic',   accent: '#1e3a5f', bg: '#e8eef5' },
  MODERN:    { label: 'Modern',    accent: '#111111', bg: '#f0f0f0' },
  ATS:       { label: 'ATS',       accent: '#374151', bg: '#f3f4f6' },
  PRO:       { label: 'Pro',       accent: '#7f1d1d', bg: '#fdf2f2' },
  MINIMAL:   { label: 'Minimal',   accent: '#0a0a0a', bg: '#fafafa' },
  EXECUTIVE: { label: 'Executive', accent: '#8a6d3b', bg: '#faf6ee' },
  TECH:      { label: 'Tech',      accent: '#2563eb', bg: '#eff6ff' },
  GRADUATE:  { label: 'Graduate',  accent: '#0f766e', bg: '#f0fdfa' },
};

/* ─────────────────────── TemplateThumbnail ─────────────────────── */

function TemplateThumbnail({ templateId }: { templateId: TemplateId }) {
  const { accent, bg } = TEMPLATE_META[templateId];
  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden flex flex-col"
      style={{ background: bg }}
    >
      {/* header bar */}
      <div className="px-2 py-1.5 flex flex-col gap-0.5" style={{ borderBottom: `1px solid ${accent}22` }}>
        <div className="h-[4px] rounded" style={{ background: accent, width: '55%' }} />
        <div className="h-[2.5px] rounded bg-gray-300 w-4/5" />
        <div className="h-[2.5px] rounded bg-gray-300 w-3/5" />
      </div>
      {/* body lines */}
      <div className="flex-1 px-2 py-1.5 space-y-1">
        <div className="h-[2px] rounded" style={{ background: accent, opacity: 0.4, width: '30%' }} />
        <div className="h-[2px] bg-gray-300 rounded w-full" />
        <div className="h-[2px] bg-gray-300 rounded w-[85%]" />
        <div className="h-[2px] bg-gray-300 rounded w-[70%]" />
        <div className="mt-1.5 h-[2px] rounded" style={{ background: accent, opacity: 0.4, width: '30%' }} />
        <div className="h-[2px] bg-gray-300 rounded w-[90%]" />
        <div className="h-[2px] bg-gray-300 rounded w-[75%]" />
      </div>
    </div>
  );
}

/* ─────────────────────────── Sidebar ─────────────────────────── */

const NAV_ITEMS = [
  { id: 'resumes',    label: 'My Resumes',  icon: DocIcon },
  { id: 'templates',  label: 'Templates',   icon: LayersIcon },
  { id: 'settings',   label: 'Settings',    icon: SettingsIcon },
] as const;

function DocIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function LayersIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}
function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

interface SidebarProps {
  activeNav: string;
  onNav: (id: string) => void;
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function Sidebar({ activeNav, onNav, open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-[#3a3a3a] z-30
        flex flex-col transition-[transform,width] duration-200
        ${collapsed ? 'lg:w-[68px] w-[220px]' : 'w-[220px]'}
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className={`py-5 flex items-center gap-2.5 border-b border-gray-100 dark:border-[#333333] ${collapsed ? 'lg:justify-center lg:px-0 px-5' : 'px-5'}`}>
          <Logo size={28} />
          <span className={`font-black text-[15px] text-[#111111] dark:text-white tracking-tight whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>
            CV Builder
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = activeNav === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { onNav(item.id); onClose(); }}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all
                  ${collapsed ? 'lg:justify-center lg:px-0 px-3' : 'px-3'}
                  ${active
                    ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]'
                    : 'text-gray-500 dark:text-[#8d8d8d] hover:text-[#111111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c]'}
                `}
              >
                <Icon active={active} />
                <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: collapse toggle + hint */}
        <div className={`py-4 border-t border-gray-200 dark:border-[#3a3a3a] ${collapsed ? 'lg:px-2 px-5' : 'px-5'}`}>
          <div className={`flex items-center ${collapsed ? 'lg:justify-center justify-between' : 'justify-between'}`}>
            <p className={`text-[11px] text-gray-400 dark:text-[#6a6a6a] leading-relaxed ${collapsed ? 'lg:hidden' : ''}`}>
              CV Builder v1.0
            </p>
            {/* Collapse toggle — desktop only */}
            <button
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-400 dark:text-[#6a6a6a] hover:text-[#111111] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ─────────────────────── ThemeToggle ──────────────────────── */

const THEME_OPTIONS: { mode: ThemeMode; title: string; icon: React.ReactNode }[] = [
  {
    mode: 'light',
    title: 'Light',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    mode: 'system',
    title: 'System',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    mode: 'dark',
    title: 'Dark',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
];

function ThemeToggle() {
  const { mode, setMode } = useThemeStore();
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-[#333333] rounded-lg p-0.5">
      {THEME_OPTIONS.map(opt => {
        const active = mode === opt.mode;
        return (
          <button
            key={opt.mode}
            onClick={() => setMode(opt.mode)}
            title={opt.title}
            className={`
              flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150
              ${active
                ? 'bg-white dark:bg-[#3a3a3a] text-[#111111] dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-[#8d8d8d] hover:text-gray-600 dark:hover:text-[#cccccc]'}
            `}
          >
            {opt.icon}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── TopNav ─────────────────────────── */

interface TopNavProps {
  onMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  showSearch: boolean;
}

function TopNav({ onMenuToggle, searchQuery, onSearchChange, showSearch }: TopNavProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'User';

  return (
    <header className="h-[60px] bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#3a3a3a] px-6 flex items-center gap-4 flex-shrink-0">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 text-gray-400 hover:text-[#111111] dark:hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Centered search — only where it's useful (My Resumes) */}
      <div className="flex-1 flex justify-center">
        {showSearch && (
          <div className="relative w-full max-w-[420px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search resumes…"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-gray-100 dark:bg-[#222222] dark:text-white border border-gray-200 dark:border-[#3a3a3a] rounded-xl outline-none transition focus:border-gray-300 dark:focus:border-white/20 focus:bg-white dark:focus:bg-white/[0.08] focus:shadow-sm placeholder:text-gray-400"
            />
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Avatar + dropdown */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setDropdownOpen(v => !v)}
          className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
        >
          <div className="w-7 h-7 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white dark:text-[#111111] text-[10px] font-bold">{initials}</span>
          </div>
          <span className="hidden sm:block text-[13px] font-semibold text-[#111111] dark:text-white">{displayName}</span>
          <svg className="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#3d3d3d] rounded-xl shadow-lg shadow-black/10 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-[#383838]">
              <p className="text-[12px] font-semibold text-[#111111] dark:text-white truncate">{displayName}</p>
            </div>
            <div className="border-t border-gray-200 dark:border-[#383838]" />
            <button
              onClick={() => { setDropdownOpen(false); logout(); navigate('/'); }}
              className="w-full text-left px-4 py-2.5 text-[13px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors font-medium"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

/* ──────────────────────── ResumeCard ──────────────────────── */

interface CardMenuProps {
  cvId: string;
  title: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

function CardMenu({ onEdit, onDuplicate, onExport, onDelete }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const items = [
    { label: 'Edit', action: onEdit },
    { label: 'Duplicate', action: onDuplicate },
    { label: 'Download PDF', action: onExport },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-150 transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-[#232323] border border-gray-200 dark:border-[#3d3d3d] rounded-xl shadow-lg shadow-black/10 overflow-hidden z-20"
          onClick={e => e.stopPropagation()}
        >
          {items.map(item => (
            <button
              key={item.label}
              onClick={() => { setOpen(false); item.action(); }}
              className="w-full text-left px-4 py-2.5 text-[13px] text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="border-t border-gray-200 dark:border-[#383838]" />
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full text-left px-4 py-2.5 text-[13px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

interface ResumeCardProps {
  cv: Cv;
  onEdit: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

function ResumeCard({ cv, onEdit, onDuplicate, onExport, onDelete }: ResumeCardProps) {
  const completion = getCompletion(cv);
  const isDraft = completion < 70;
  const meta = TEMPLATE_META[cv.templateId];

  return (
    <div
      onClick={onEdit}
      className="group relative bg-white dark:bg-[#232323] rounded-2xl border border-gray-200 dark:border-[#383838] p-5 cursor-pointer shadow-sm shadow-black/[0.05] dark:shadow-none hover:border-gray-300 dark:hover:border-[#525252] hover:shadow-md hover:shadow-black/[0.08] transition-all duration-200"
    >
      {/* Template thumbnail */}
      <div className="w-full h-[110px] mb-4 rounded-lg overflow-hidden border border-gray-100">
        <TemplateThumbnail templateId={cv.templateId} />
      </div>

      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-[14px] font-semibold text-[#111111] dark:text-white leading-snug line-clamp-1 flex-1">
          {cv.title || 'Untitled Resume'}
        </h3>
        <CardMenu
          cvId={cv.id}
          title={cv.title}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onExport={onExport}
          onDelete={onDelete}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 mb-3.5">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
          style={{ color: meta.accent, background: meta.bg }}
        >
          {meta.label}
        </span>
        <span className={`
          text-[10px] font-semibold px-2 py-0.5 rounded-md
          ${isDraft ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}
        `}>
          {isDraft ? 'Draft' : 'Complete'}
        </span>
      </div>

      {/* Completion bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-gray-400 dark:text-[#8d8d8d] font-medium">Completion</span>
          <span className="text-[11px] font-semibold text-[#111111] dark:text-white">{completion}%</span>
        </div>
        <div className="h-1 bg-gray-200 dark:bg-[#303030] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completion}%`,
              background: completion >= 70 ? '#10b981' : '#f59e0b',
            }}
          />
        </div>
      </div>

      {/* Modified time */}
      <p className="text-[11px] text-gray-400 dark:text-[#6a6a6a] flex items-center gap-1.5">
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        </svg>
        Edited {timeAgo(cv.updatedAt)}
      </p>
    </div>
  );
}

/* ────────────────────── EmptyState ────────────────────── */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-[#232323] border border-gray-200 dark:border-[#383838] rounded-2xl flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-gray-300 dark:text-[#555555]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-[17px] font-bold text-[#111111] dark:text-white mb-2">No resumes yet</h3>
      <p className="text-[13px] text-gray-400 dark:text-[#8d8d8d] mb-6 max-w-[240px] leading-relaxed">
        Create your first ATS-friendly resume and start landing interviews.
      </p>
      <button
        onClick={onCreate}
        className="bg-[#111111] hover:bg-[#2a2a2a] active:bg-black text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        + Create Resume
      </button>
    </div>
  );
}

/* ─────────────────────── Main Dashboard ─────────────────────── */

type FilterType = 'all' | 'draft' | 'complete';

export function Dashboard() {
  const navigate = useNavigate();
  const { cvs, loadCvs, createCv, deleteCv, loading, loaded } = useCvStore();
  const { user } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('dashboard-sidebar-collapsed') === '1');
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const activeNav = viewParam === 'templates' || viewParam === 'settings' ? viewParam : 'resumes';
  const setActiveNav = (id: string) => {
    setSearchParams(id === 'resumes' ? {} : { view: id });
  };
  const toggleCollapse = () => {
    setCollapsed(c => {
      localStorage.setItem('dashboard-sidebar-collapsed', c ? '0' : '1');
      return !c;
    });
  };
  const { defaultTemplateId } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [templateFilter, setTemplateFilter] = useState<TemplateId | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => { loadCvs(); }, [loadCvs]);

  /* ── Stats ── */
  const total = cvs.length;
  const complete = cvs.filter(cv => getCompletion(cv) >= 70).length;
  const draft = total - complete;

  /* ── Filtered list ── */
  const visible = cvs.filter(cv => {
    if (searchQuery && !cv.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filter === 'draft' && getCompletion(cv) >= 70) return false;
    if (filter === 'complete' && getCompletion(cv) < 70) return false;
    if (templateFilter !== 'all' && cv.templateId !== templateFilter) return false;
    return true;
  });

  /* ── Actions ── */
  const handleCreate = async () => {
    const newCv = await createCv({
      title: 'Untitled Resume',
      templateId: defaultTemplateId,
      sectionOrder: ['personal', 'experience', 'education', 'skills', 'projects'],
      personalInfo: { name: '', email: '', phone: '', location: '', linkedinUrl: '', githubUrl: '', summary: '' },
      experiences: [], educations: [], skills: [], projects: [],
    });
    navigate(`/cv/${newCv.id}`);
  };

  const handleDuplicate = async (cv: Cv) => {
    const newCv = await createCv({
      title: `${cv.title} (Copy)`,
      templateId: cv.templateId,
      sectionOrder: cv.sectionOrder,
      personalInfo: { ...cv.personalInfo },
      experiences: cv.experiences.map(e => ({ ...e, id: crypto.randomUUID() })),
      educations: cv.educations.map(e => ({ ...e, id: crypto.randomUUID() })),
      skills: cv.skills.map(s => ({ ...s, id: crypto.randomUUID() })),
      projects: cv.projects.map(p => ({ ...p, id: crypto.randomUUID() })),
    });
    toast.success('Resume duplicated');
    navigate(`/cv/${newCv.id}`);
  };

  const handleExport = async (cv: Cv) => {
    setExportingId(cv.id);
    try {
      const blob = await exportPdf(cv.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cv.title || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExportingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    await deleteCv(id);
    toast.success('Resume deleted');
  };

  const firstName = user?.firstName || 'there';

  /* ── Render ── */
  return (
    <div className="h-screen flex overflow-hidden bg-[#e4e4e4] dark:bg-[#161616]">
      <Sidebar
        activeNav={activeNav}
        onNav={setActiveNav}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          onMenuToggle={() => setSidebarOpen(v => !v)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={activeNav === 'resumes'}
        />

        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
          {activeNav === 'templates' ? (
            <TemplatesView />
          ) : activeNav === 'settings' ? (
            <SettingsView />
          ) : (
            <>

          {/* ── Welcome ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-[26px] font-black text-[#111111] dark:text-white tracking-tight leading-tight">
                Welcome back, {firstName} 👋
              </h1>
              <p className="text-[14px] text-gray-400 dark:text-[#8d8d8d] mt-1">
                Continue building professional resumes.
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex-shrink-0 flex items-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] active:bg-black text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Resume
            </button>
          </div>

          {/* ── Stats ── */}
          {total > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total', value: total, color: '#111111', darkColor: '#ffffff' },
                { label: 'Complete', value: complete, color: '#10b981', darkColor: '#10b981' },
                { label: 'Draft', value: draft, color: '#f59e0b', darkColor: '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} className="bg-white dark:bg-[#232323] rounded-2xl border border-gray-200 dark:border-[#383838] px-5 py-4 shadow-sm shadow-black/[0.05] dark:shadow-none">
                  <p className="text-[12px] text-gray-400 dark:text-[#8d8d8d] font-medium mb-1">{stat.label}</p>
                  <p className="text-[28px] font-black leading-none dark:hidden" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[28px] font-black leading-none hidden dark:block" style={{ color: stat.darkColor }}>{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Filters ── */}
          {total > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Status tabs */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3a3a3a] rounded-xl p-1">
                {(['all', 'draft', 'complete'] as FilterType[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all ${
                      filter === f
                        ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]'
                        : 'text-gray-400 dark:text-[#8d8d8d] hover:text-[#111111] dark:hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Template filter */}
              <select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value as TemplateId | 'all')}
                className="h-[38px] px-3 pr-8 rounded-xl text-[12px] font-semibold bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3a3a3a] text-gray-600 dark:text-[#bbb] outline-none cursor-pointer appearance-none bg-no-repeat bg-[length:14px] bg-[right_10px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] hover:border-gray-300 dark:hover:border-[#525252] transition-colors"
              >
                <option value="all">All templates</option>
                {(Object.keys(TEMPLATE_META) as TemplateId[]).map(t => (
                  <option key={t} value={t}>{TEMPLATE_META[t].label}</option>
                ))}
              </select>

              <div className="flex-1" />

              {/* Grid / List toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3a3a3a] rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]' : 'text-gray-400 dark:text-[#8d8d8d] hover:text-[#111111] dark:hover:text-white'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]' : 'text-gray-400 dark:text-[#8d8d8d] hover:text-[#111111] dark:hover:text-white'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Result count */}
              {(searchQuery || filter !== 'all' || templateFilter !== 'all') && (
                <span className="text-[12px] text-gray-400 dark:text-[#6a6a6a]">
                  {visible.length} {visible.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>
          )}

          {/* ── Resume Grid / List ── */}
          {loading && !loaded ? (
            /* Skeleton grid while first load is in flight */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 dark:border-[#383838] bg-white dark:bg-[#232323] overflow-hidden animate-pulse"
                >
                  <div className="h-36 bg-gray-100 dark:bg-[#2a2a2a]" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-3.5 w-3/5 rounded bg-gray-100 dark:bg-[#2a2a2a]" />
                    <div className="h-2.5 w-2/5 rounded bg-gray-100 dark:bg-[#2a2a2a]" />
                    <div className="h-1.5 w-full rounded bg-gray-100 dark:bg-[#2a2a2a]" />
                  </div>
                </div>
              ))}
            </div>
          ) : total === 0 ? (
            <EmptyState onCreate={handleCreate} />
          ) : visible.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[14px] text-gray-400 dark:text-[#8d8d8d]">No resumes match your filters.</p>
              <button
                onClick={() => { setFilter('all'); setTemplateFilter('all'); setSearchQuery(''); }}
                className="mt-3 text-[13px] font-semibold text-[#111111] dark:text-white underline underline-offset-2"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visible.map(cv => (
                <ResumeCard
                  key={cv.id}
                  cv={cv}
                  onEdit={() => navigate(`/cv/${cv.id}`)}
                  onDuplicate={() => handleDuplicate(cv)}
                  onExport={() => handleExport(cv)}
                  onDelete={() => handleDelete(cv.id)}
                />
              ))}
              {/* Export overlay */}
              {exportingId && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-50 flex items-center justify-center">
                  <div className="bg-white rounded-2xl px-8 py-6 shadow-xl border border-gray-100 flex items-center gap-3">
                    <svg className="animate-spin w-5 h-5 text-[#111111]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-[14px] font-semibold text-[#111111]">Generating PDF…</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── List view ── */
            <div className="space-y-2">
              {visible.map(cv => {
                const completion = getCompletion(cv);
                const isDraft = completion < 70;
                const meta = TEMPLATE_META[cv.templateId];
                return (
                  <div
                    key={cv.id}
                    onClick={() => navigate(`/cv/${cv.id}`)}
                    className="group flex items-center gap-4 bg-white dark:bg-[#232323] rounded-xl border border-gray-200 dark:border-[#383838] px-5 py-3.5 cursor-pointer shadow-sm shadow-black/[0.04] dark:shadow-none hover:border-gray-300 dark:hover:border-[#525252] hover:shadow-md hover:shadow-black/[0.06] transition-all"
                  >
                    {/* Mini thumbnail */}
                    <div className="w-10 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                      <TemplateThumbnail templateId={cv.templateId} />
                    </div>

                    {/* Title + badges */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#111111] dark:text-white truncate">{cv.title || 'Untitled Resume'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ color: meta.accent, background: meta.bg }}>
                          {meta.label}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isDraft ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isDraft ? 'Draft' : 'Complete'}
                        </span>
                      </div>
                    </div>

                    {/* Completion */}
                    <div className="hidden sm:flex items-center gap-2 w-28 flex-shrink-0">
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-[#303030] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${completion}%`, background: completion >= 70 ? '#10b981' : '#f59e0b' }} />
                      </div>
                      <span className="text-[11px] text-gray-500 dark:text-[#8d8d8d] font-medium w-8 text-right">{completion}%</span>
                    </div>

                    {/* Modified */}
                    <p className="hidden md:block text-[12px] text-gray-400 dark:text-[#6a6a6a] w-20 text-right flex-shrink-0">{timeAgo(cv.updatedAt)}</p>

                    {/* Actions */}
                    <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <CardMenu
                        cvId={cv.id}
                        title={cv.title}
                        onEdit={() => navigate(`/cv/${cv.id}`)}
                        onDuplicate={() => handleDuplicate(cv)}
                        onExport={() => handleExport(cv)}
                        onDelete={() => handleDelete(cv.id)}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Export overlay for list view */}
              {exportingId && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-50 flex items-center justify-center">
                  <div className="bg-white rounded-2xl px-8 py-6 shadow-xl border border-gray-100 flex items-center gap-3">
                    <svg className="animate-spin w-5 h-5 text-[#111111]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-[14px] font-semibold text-[#111111]">Generating PDF…</span>
                  </div>
                </div>
              )}
            </div>
          )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
