import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateProfile, changePassword } from '../../api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore, type ThemeMode } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useCvStore } from '../../store/cvStore';
import { ConfirmDialog } from '../ConfirmDialog';
import type { TemplateId } from '../../types/cv';

/* ────────────────────────── primitives ────────────────────────── */

const inputCls =
  'w-full px-3 py-2 text-[13.5px] rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3a3a3a] text-[#111111] dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-[#5a5a5a] focus:border-blue-500 dark:focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/15 transition-all';

/** Vercel-style settings card: header → control → muted footer strip */
function SettingCard({ id, title, description, footerHint, footerAction, danger = false, children }: {
  id?: string;
  title: string;
  description: string;
  footerHint?: React.ReactNode;
  footerAction?: React.ReactNode;
  danger?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-xl border bg-white dark:bg-[#232323] overflow-hidden ${
        danger
          ? 'border-rose-200 dark:border-rose-900/50'
          : 'border-gray-200 dark:border-[#383838]'
      }`}
    >
      <div className="px-6 pt-5 pb-5">
        <h3 className={`text-[14.5px] font-semibold tracking-[-0.01em] ${danger ? 'text-rose-600 dark:text-rose-400' : 'text-[#111111] dark:text-white'}`}>
          {title}
        </h3>
        <p className="text-[13px] text-gray-500 dark:text-[#8d8d8d] mt-1 leading-relaxed">{description}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
      {(footerHint || footerAction) && (
        <div className={`flex items-center justify-between gap-4 px-6 py-3 border-t ${
          danger
            ? 'border-rose-200/70 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20'
            : 'border-gray-100 dark:border-[#2e2e2e] bg-gray-50/80 dark:bg-[#1e1e1e]'
        }`}>
          <p className="text-[12px] text-gray-400 dark:text-[#6a6a6a]">{footerHint}</p>
          {footerAction}
        </div>
      )}
    </section>
  );
}

function FooterButton({ children, danger = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      {...props}
      className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
        danger
          ? 'bg-rose-600 text-white hover:bg-rose-700'
          : 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:opacity-85'
      }`}
    >
      {children}
    </button>
  );
}

/* ─────────────────── theme preview tiles ──────────────────────── */

function ThemeTile({ mode, label, selected, onSelect }: {
  mode: ThemeMode;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  // mini window mock — light, dark, or split (system)
  const mock = (scheme: 'light' | 'dark') => (
    <div className={`w-full h-full ${scheme === 'light' ? 'bg-[#f4f4f4]' : 'bg-[#161616]'}`}>
      <div className={`h-[18%] flex items-center gap-[3px] px-[8%] ${scheme === 'light' ? 'bg-white border-b border-gray-200' : 'bg-[#1e1e1e] border-b border-[#333]'}`}>
        <span className="w-1 h-1 rounded-full bg-[#ff5f57]" />
        <span className="w-1 h-1 rounded-full bg-[#febc2e]" />
        <span className="w-1 h-1 rounded-full bg-[#28c840]" />
      </div>
      <div className="px-[10%] pt-[10%] space-y-[6%]">
        <div className={`h-[6px] w-3/5 rounded-sm ${scheme === 'light' ? 'bg-[#111111]' : 'bg-white'}`} />
        <div className={`h-[4px] w-full rounded-sm ${scheme === 'light' ? 'bg-gray-300' : 'bg-[#3a3a3a]'}`} />
        <div className={`h-[4px] w-4/5 rounded-sm ${scheme === 'light' ? 'bg-gray-300' : 'bg-[#3a3a3a]'}`} />
        <div className="h-[8px] w-2/5 rounded-sm bg-blue-500" />
      </div>
    </div>
  );

  return (
    <button
      onClick={onSelect}
      className={`group text-left rounded-xl border-2 overflow-hidden transition-all ${
        selected
          ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
          : 'border-gray-200 dark:border-[#3a3a3a] hover:border-gray-300 dark:hover:border-[#525252]'
      }`}
    >
      <div className="h-[88px] w-full overflow-hidden relative">
        {mode === 'system' ? (
          <div className="flex h-full">
            <div className="w-1/2 h-full overflow-hidden">{mock('light')}</div>
            <div className="w-1/2 h-full overflow-hidden">{mock('dark')}</div>
          </div>
        ) : (
          mock(mode as 'light' | 'dark')
        )}
      </div>
      <div className={`flex items-center justify-between px-3 py-2 border-t ${
        selected
          ? 'border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20'
          : 'border-gray-100 dark:border-[#2e2e2e] bg-white dark:bg-[#232323]'
      }`}>
        <span className={`text-[12px] font-semibold ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-[#aaa]'}`}>
          {label}
        </span>
        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
          selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-[#525252] group-hover:border-gray-400'
        }`}>
          {selected && (
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth={3.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </div>
    </button>
  );
}

/* ────────────────────────── nav rail ──────────────────────────── */

const SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'data', label: 'Data' },
];

/* ─────────────────── default-template options ─────────────────── */

const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: 'CLASSIC', label: 'Classic — Two-column' },
  { id: 'MODERN', label: 'Modern — Bold header' },
  { id: 'ATS', label: 'ATS — Machine-readable' },
  { id: 'PRO', label: 'Pro — Academic' },
  { id: 'MINIMAL', label: 'Minimal — Serif minimal' },
  { id: 'EXECUTIVE', label: 'Executive — Corporate' },
  { id: 'TECH', label: 'Tech — Engineer' },
  { id: 'GRADUATE', label: 'Graduate — Entry level' },
];

/* ────────────────────────── main view ─────────────────────────── */

export function SettingsView() {
  const { user, updateUser } = useAuthStore();
  const { mode, setMode } = useThemeStore();
  const { defaultTemplateId, setDefaultTemplateId } = useSettingsStore();
  const { cvs, deleteCv } = useCvStore();

  const [activeSection, setActiveSection] = useState('profile');

  /* Profile */
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const profileDirty = firstName !== (user?.firstName ?? '') || lastName !== (user?.lastName ?? '');

  /* Password */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  /* Danger zone */
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim()) { toast.error('First name is required'); return; }
    setSavingProfile(true);
    try {
      const updated = await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      toast.success('Password changed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: user ? { email: user.email, firstName: user.firstName, lastName: user.lastName } : null,
      resumes: cvs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-builder-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const handleDeleteAll = async () => {
    setConfirmDeleteAll(false);
    setDeletingAll(true);
    try {
      for (const cv of cvs) {
        await deleteCv(cv.id);
      }
      toast.success('All resumes deleted');
    } catch {
      toast.error('Some resumes could not be deleted');
    } finally {
      setDeletingAll(false);
    }
  };

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?' : '?';

  return (
    <div className="max-w-[920px]">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-[#111111] dark:text-white tracking-tight">Settings</h1>
        <p className="text-[13.5px] text-gray-500 dark:text-[#8d8d8d] mt-1">
          Manage your account, appearance, and data.
        </p>
      </div>

      <div className="flex gap-10 items-start">
        {/* ── Left section nav (desktop) ── */}
        <nav className="hidden md:block w-[160px] flex-shrink-0 sticky top-6 space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeSection === s.id
                  ? 'bg-gray-200/70 dark:bg-[#2c2c2c] text-[#111111] dark:text-white'
                  : 'text-gray-500 dark:text-[#8d8d8d] hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* ── Cards ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Profile — name */}
          <SettingCard
            id="profile"
            title="Display Name"
            description="Shown in the dashboard and used for your avatar initials. Never appears on your resumes."
            footerHint="Use your real name so exports and backups are easy to identify."
            footerAction={
              <FooterButton onClick={handleSaveProfile} disabled={!profileDirty || savingProfile}>
                {savingProfile ? 'Saving…' : 'Save'}
              </FooterButton>
            }
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#111111] dark:bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-white dark:text-[#111111] text-[15px] font-bold">{initials}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1 max-w-[420px]">
                <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" aria-label="First name" />
                <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" aria-label="Last name" />
              </div>
            </div>
          </SettingCard>

          {/* Profile — email */}
          <SettingCard
            title="Email"
            description="The address you sign in with."
            footerHint="Email addresses can't be changed. Contact support if you need to migrate."
          >
            <input className={`${inputCls} max-w-[420px] opacity-60 cursor-not-allowed`} value={user?.email ?? ''} disabled />
          </SettingCard>

          {/* Security */}
          <SettingCard
            id="security"
            title="Password"
            description="Change the password used to sign in to your account."
            footerHint="Minimum 8 characters. Social-login accounts manage passwords with their provider."
            footerAction={
              <FooterButton
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword || savingPassword}
              >
                {savingPassword ? 'Changing…' : 'Change password'}
              </FooterButton>
            }
          >
            <div className="space-y-3 max-w-[420px]">
              <input type="password" className={inputCls} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" autoComplete="current-password" aria-label="Current password" />
              <div className="grid grid-cols-2 gap-3">
                <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" autoComplete="new-password" aria-label="New password" />
                <input type="password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new" autoComplete="new-password" aria-label="Confirm new password" />
              </div>
            </div>
          </SettingCard>

          {/* Appearance */}
          <SettingCard
            id="appearance"
            title="Interface Theme"
            description="Choose how CV Builder looks on this device."
            footerHint={mode === 'system' ? 'Currently following your OS appearance setting.' : `Locked to ${mode} mode on this device.`}
          >
            <div className="grid grid-cols-3 gap-3 max-w-[480px]">
              <ThemeTile mode="light" label="Light" selected={mode === 'light'} onSelect={() => setMode('light')} />
              <ThemeTile mode="system" label="System" selected={mode === 'system'} onSelect={() => setMode('system')} />
              <ThemeTile mode="dark" label="Dark" selected={mode === 'dark'} onSelect={() => setMode('dark')} />
            </div>
          </SettingCard>

          {/* Preferences */}
          <SettingCard
            id="preferences"
            title="Default Template"
            description="Applied whenever you click “Create Resume”. You can always switch templates in the editor."
            footerHint="Browse all templates in the Templates tab to compare them first."
          >
            <select
              className={`${inputCls} max-w-[300px] cursor-pointer`}
              value={defaultTemplateId}
              onChange={(e) => {
                setDefaultTemplateId(e.target.value as TemplateId);
                toast.success('Default template saved');
              }}
            >
              {TEMPLATE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </SettingCard>

          {/* Data — export */}
          <SettingCard
            id="data"
            title="Export Data"
            description={`Download all ${cvs.length} of your resume${cvs.length === 1 ? '' : 's'} and profile information as a JSON file.`}
            footerHint="Your data belongs to you — take it with you anytime."
            footerAction={
              <button
                onClick={handleExportData}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold border border-gray-200 dark:border-[#3a3a3a] text-[#111111] dark:text-white hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
              >
                Export JSON
              </button>
            }
          />

          {/* Data — danger */}
          <SettingCard
            title="Delete All Resumes"
            description="Permanently removes every resume in your account. This action cannot be undone."
            danger
            footerHint="Consider exporting your data first."
            footerAction={
              <FooterButton danger onClick={() => setConfirmDeleteAll(true)} disabled={cvs.length === 0 || deletingAll}>
                {deletingAll ? 'Deleting…' : 'Delete all'}
              </FooterButton>
            }
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteAll}
        title="Delete all resumes?"
        message={`This permanently deletes all ${cvs.length} of your resumes. Consider exporting your data first.`}
        confirmLabel="Delete everything"
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </div>
  );
}
