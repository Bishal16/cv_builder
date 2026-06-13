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
import { CvPreview, PAGE_WIDTH, PAGE_HEIGHT } from '../templates/CvPreview';

/* ─────────────────────────── helpers ─────────────────────────── */

interface CompletionItem {
  label: string;
  weight: number;
  done: (cv: Cv) => boolean;
}

const COMPLETION_ITEMS: CompletionItem[] = [
  { label: 'Add your name',       weight: 20, done: c => !!c.personalInfo.name },
  { label: 'Add an email',        weight: 10, done: c => !!c.personalInfo.email },
  { label: 'Add a phone number',  weight: 5,  done: c => !!c.personalInfo.phone },
  { label: 'Write a summary',     weight: 15, done: c => !!c.personalInfo.summary },
  { label: 'Add work experience', weight: 25, done: c => c.experiences.length > 0 },
  { label: 'Add education',       weight: 15, done: c => c.educations.length > 0 },
  { label: 'List your skills',    weight: 10, done: c => c.skills.length > 0 },
];

function getCompletion(cv: Cv): number {
  return Math.min(
    100,
    COMPLETION_ITEMS.reduce((s, item) => (item.done(cv) ? s + item.weight : s), 0),
  );
}

function getMissingItems(cv: Cv): CompletionItem[] {
  return COMPLETION_ITEMS.filter(item => !item.done(cv));
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
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

/* ─────────────────────── LiveCvThumbnail ─────────────────────── */
/* Renders the user's ACTUAL resume, scaled down, instead of a placeholder. */

function ScaledCv({ cv, scale }: { cv: Cv; scale: number }) {
  return (
    <div style={{ width: PAGE_WIDTH * scale, height: PAGE_HEIGHT * scale, overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: PAGE_WIDTH, height: PAGE_HEIGHT, backgroundColor: '#ffffff' }}>
        <CvPreview cv={cv} />
      </div>
    </div>
  );
}

function LiveCvThumbnail({ cv, scale = 0.21, windowClass = 'h-[150px]' }: { cv: Cv; scale?: number; windowClass?: string }) {
  // pan distance: sheet height + top gap − visible window height
  const sheetH = PAGE_HEIGHT * scale;
  const winH = parseInt(windowClass.match(/\d+/)?.[0] ?? '150', 10);
  const panY = Math.max(0, sheetH + 12 - winH);
  return (
    <div className={`relative w-full ${windowClass} rounded-lg overflow-hidden bg-[#EFEFED] dark:bg-[#1c1c1c] border border-gray-100 dark:border-[#2e2e2e] flex justify-center pt-3`}>
      <div
        className="shadow-[0_1px_6px_rgba(0,0,0,0.14)] transition-transform ease-in-out duration-[2200ms] group-hover:[transform:translateY(var(--pan))]"
        style={{ '--pan': `-${panY}px` } as React.CSSProperties}
      >
        <ScaledCv cv={cv} scale={scale} />
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
          <span className={`font-black text-[15px] tracking-tight whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`} style={{ color: '#F97316' }}>
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
                    ? 'bg-[#FFF3E8] dark:bg-[#F97316]/20 text-[#C2510A] dark:text-[#F97316]'
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
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-gray-100 dark:bg-[#222222] dark:text-white border border-gray-200 dark:border-[#3a3a3a] rounded-xl outline-none transition focus:border-[#F97316]/50 dark:focus:border-[#F97316]/40 focus:bg-white dark:focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.12)] placeholder:text-gray-400"
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
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
            <span className="text-white text-[10px] font-bold">{initials}</span>
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
      className="group relative bg-white dark:bg-[#232323] rounded-2xl border border-gray-300 dark:border-[#444444] p-5 cursor-pointer shadow-sm shadow-black/[0.05] dark:shadow-none hover:border-[#F97316]/60 dark:hover:border-[#F97316]/40 hover:shadow-xl hover:shadow-black/[0.10] dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300"
    >
      {/* Live preview of the actual resume + hover quick-actions */}
      <div className="relative mb-4 rounded-lg overflow-hidden">
        <LiveCvThumbnail cv={cv} />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/65 via-black/35 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white shadow-lg transition-colors"
            style={{ background: '#F97316' }}
            onMouseOver={e => (e.currentTarget.style.background = '#EA580C')}
            onMouseOut={e => (e.currentTarget.style.background = '#F97316')}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onExport(); }}
            title="Download PDF"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/95 text-[#111111] shadow-lg hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            title="Duplicate"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/95 text-[#111111] shadow-lg hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </button>
        </div>
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

/* ────────────────────── MetricChip ────────────────────── */

function MetricChip({ color, value, label }: { color: string; value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-[#8d8d8d]">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span className="font-bold text-[#111111] dark:text-white">{value}</span>
      {label}
    </span>
  );
}

/* ──────────────────── ContinueCard ──────────────────── */
/* "Pick up where you left off" — featured most-recent resume with a live
   preview and an actionable completion checklist. */

function ContinueCard({ cv, onEdit, onExport, exporting }: {
  cv: Cv;
  onEdit: () => void;
  onExport: () => void;
  exporting: boolean;
}) {
  const completion = getCompletion(cv);
  const missing = getMissingItems(cv);
  const meta = TEMPLATE_META[cv.templateId];
  const isDone = completion >= 100;

  return (
    <div className="mb-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-[#6a6a6a] mb-2.5">
        Pick up where you left off
      </p>
      <div className="group rounded-2xl border border-gray-300 dark:border-[#444444] bg-white dark:bg-[#232323] overflow-hidden shadow-sm shadow-black/[0.06] dark:shadow-none hover:border-[#F97316]/50 dark:hover:border-[#F97316]/40 hover:shadow-lg hover:shadow-black/[0.08] dark:hover:shadow-none transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Live preview */}
          <div
            className="relative bg-[#EFEFED] dark:bg-[#1c1c1c] bg-[radial-gradient(#DDDDD8_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:18px_18px] flex justify-center items-start pt-7 px-8 md:w-[300px] h-[260px] overflow-hidden flex-shrink-0 cursor-pointer"
            onClick={onEdit}
          >
            <div className="shadow-[0_2px_8px_rgba(0,0,0,0.1),0_12px_32px_rgba(0,0,0,0.12)] transition-transform duration-500 group-hover:-translate-y-1.5">
              <ScaledCv cv={cv} scale={0.3} />
            </div>
          </div>

          {/* Meta + checklist */}
          <div className="flex-1 p-6 md:p-7 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <h2 className="text-[19px] font-bold text-[#111111] dark:text-white tracking-tight truncate">
                {cv.title || 'Untitled Resume'}
              </h2>
              <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap" style={{ color: meta.accent, background: meta.bg }}>
                {meta.label}
              </span>
            </div>

            {/* completion bar */}
            <div className="flex items-center gap-3 mb-4 max-w-[420px]">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-[#303030] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completion}%`, background: isDone ? '#10b981' : '#F97316' }} />
              </div>
              <span className="text-[12px] font-bold text-[#111111] dark:text-white w-9 text-right">{completion}%</span>
            </div>

            {/* checklist or done state */}
            {isDone ? (
              <p className="text-[13px] text-gray-500 dark:text-[#8d8d8d] mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
                </svg>
                Looks great — this resume is ready to export.
              </p>
            ) : (
              <div className="mb-5">
                <p className="text-[12px] text-gray-500 dark:text-[#8d8d8d] mb-2">Finish your resume:</p>
                <div className="flex flex-col gap-1.5 max-w-[440px]">
                  {missing.slice(0, 3).map(item => (
                    <button
                      key={item.label}
                      onClick={onEdit}
                      className="group/item flex items-center justify-between gap-3 text-left px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3a3a3a] hover:border-[#F97316]/50 hover:bg-[#FFF7ED] dark:hover:bg-[#F97316]/[0.08] transition-colors"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="w-4 h-4 rounded-full border-[1.5px] border-gray-300 dark:border-[#555] flex-shrink-0 group-hover/item:border-[#F97316]" />
                        <span className="text-[13px] text-[#111111] dark:text-white truncate">{item.label}</span>
                      </span>
                      <span className="text-[11px] font-bold text-[#F97316] flex-shrink-0">+{item.weight}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12), 0 1px 0 rgba(0,0,0,.1), 0 4px 12px -4px rgba(249,115,22,.4)' }}
                onMouseOver={e => (e.currentTarget.style.background = '#C2510A')}
                onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Resume editing
              </button>
              <button
                onClick={onExport}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold border border-gray-300 dark:border-[#3a3a3a] text-[#111111] dark:text-white hover:border-[#F97316]/50 hover:text-[#C2510A] dark:hover:bg-[#2c2c2c] transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {exporting ? 'Exporting…' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
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
        className="text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12), 0 1px 0 rgba(0,0,0,.1), 0 4px 14px -4px rgba(249,115,22,.45)' }}
        onMouseOver={e => (e.currentTarget.style.background = '#C2510A')}
        onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)')}
      >
        + Create Resume
      </button>
    </div>
  );
}

/* ─────────────────────── Main Dashboard ─────────────────────── */

type FilterType = 'all' | 'draft' | 'complete';
type SortKey = 'recent' | 'created' | 'name' | 'completion';

const SORT_LABELS: Record<SortKey, string> = {
  recent: 'Last edited',
  created: 'Date created',
  name: 'Name (A–Z)',
  completion: 'Completion',
};

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
  const [sortBy, setSortBy] = useState<SortKey>('recent');
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => { loadCvs(); }, [loadCvs]);

  /* ── Stats ── */
  const total = cvs.length;
  const complete = cvs.filter(cv => getCompletion(cv) >= 70).length;
  const draft = total - complete;
  const avgCompletion = total
    ? Math.round(cvs.reduce((s, cv) => s + getCompletion(cv), 0) / total)
    : 0;

  /* ── Most recently edited — powers the "continue" featured card ── */
  const mostRecent = total
    ? [...cvs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    : null;
  const isFiltering = !!searchQuery || filter !== 'all' || templateFilter !== 'all';

  /* ── Filtered + sorted list ── */
  const visible = cvs
    .filter(cv => {
      if (searchQuery && !cv.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filter === 'draft' && getCompletion(cv) >= 70) return false;
      if (filter === 'complete' && getCompletion(cv) < 70) return false;
      if (templateFilter !== 'all' && cv.templateId !== templateFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':    return (a.title || '').localeCompare(b.title || '');
        case 'completion': return getCompletion(b) - getCompletion(a);
        case 'recent':
        default:        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
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
    <div className="h-screen flex overflow-hidden bg-[#EDEBE7] dark:bg-[#161616]">
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

        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 dashboard-warm-bg">
          {activeNav === 'templates' ? (
            <TemplatesView />
          ) : activeNav === 'settings' ? (
            <SettingsView />
          ) : (
            <>

          {/* ── Hero band ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
            <div className="min-w-0">
              <h1 className="text-[26px] font-black text-[#111111] dark:text-white tracking-tight leading-tight">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-[14px] text-gray-500 dark:text-[#8d8d8d] mt-1">
                {total === 0
                  ? "Let's build your first resume."
                  : draft > 0
                    ? `${draft} draft${draft > 1 ? 's' : ''} need${draft > 1 ? '' : 's'} attention.`
                    : 'All caught up — nice work.'}
              </p>

              {/* Inline metric strip */}
              {total > 0 && (
                <div className="flex items-center gap-3 mt-4 text-[13px] font-medium flex-wrap">
                  <MetricChip color="#F97316" value={total} label={total === 1 ? 'resume' : 'resumes'} />
                  <span className="w-px h-3.5 bg-gray-300 dark:bg-[#3a3a3a]" />
                  <MetricChip color="#10b981" value={complete} label="ready" />
                  <span className="w-px h-3.5 bg-gray-300 dark:bg-[#3a3a3a]" />
                  <MetricChip color="#f59e0b" value={draft} label="draft" />
                  <span className="w-px h-3.5 bg-gray-300 dark:bg-[#3a3a3a]" />
                  <span className="text-gray-500 dark:text-[#8d8d8d]">
                    <span className="font-bold text-[#111111] dark:text-white">{avgCompletion}%</span> avg complete
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleCreate}
              className="flex-shrink-0 flex items-center gap-2 text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12), 0 1px 0 rgba(0,0,0,.1), 0 4px 14px -4px rgba(249,115,22,.45)' }}
              onMouseOver={e => (e.currentTarget.style.background = '#C2510A')}
              onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Resume
            </button>
          </div>

          {/* ── Continue where you left off ── */}
          {mostRecent && !isFiltering && (
            <ContinueCard
              cv={mostRecent}
              onEdit={() => navigate(`/cv/${mostRecent.id}`)}
              onExport={() => handleExport(mostRecent)}
              exporting={exportingId === mostRecent.id}
            />
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
                        ? 'bg-[#F97316] text-white'
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

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                title="Sort resumes"
                className="h-[38px] px-3 pr-8 rounded-xl text-[12px] font-semibold bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3a3a3a] text-gray-600 dark:text-[#bbb] outline-none cursor-pointer appearance-none bg-no-repeat bg-[length:14px] bg-[right_10px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2394a3b8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] hover:border-gray-300 dark:hover:border-[#525252] transition-colors"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
                  <option key={k} value={k}>{SORT_LABELS[k]}</option>
                ))}
              </select>

              <div className="flex-1" />

              {/* Grid / List toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#3a3a3a] rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#F97316] text-white' : 'text-gray-400 dark:text-[#8d8d8d] hover:text-[#111111] dark:hover:text-white'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#F97316] text-white' : 'text-gray-400 dark:text-[#8d8d8d] hover:text-[#111111] dark:hover:text-white'}`}
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
                className="mt-3 text-[13px] font-semibold underline underline-offset-2" style={{ color: '#F97316' } as React.CSSProperties}
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
                    {/* Mini live thumbnail */}
                    <div className="w-10 h-[54px] rounded-md overflow-hidden border border-gray-200 dark:border-[#3a3a3a] flex-shrink-0 bg-white">
                      <ScaledCv cv={cv} scale={0.0504} />
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
