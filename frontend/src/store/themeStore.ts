import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

/* ── DOM helpers ───────────────────────────────────────────────── */

function applyResolved(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}


/* ── System media-query listener ───────────────────────────────── */

let systemCleanup: (() => void) | null = null;

function watchSystem(onChange: (resolved: ResolvedTheme) => void): ResolvedTheme {
  // Remove any existing listener first
  systemCleanup?.();
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => onChange(e.matches ? 'dark' : 'light');
  mq.addEventListener('change', handler);
  systemCleanup = () => mq.removeEventListener('change', handler);
  return mq.matches ? 'dark' : 'light';
}

function stopWatchSystem() {
  systemCleanup?.();
  systemCleanup = null;
}

/* ── Resolve + apply a mode ────────────────────────────────────── */

function activate(mode: ThemeMode, set: (s: Partial<ThemeState>) => void): ResolvedTheme {
  stopWatchSystem();

  let resolved: ResolvedTheme;

  if (mode === 'system') {
    resolved = watchSystem((r) => {
      applyResolved(r);
      set({ resolved: r });
    });
  } else {
    resolved = mode;
  }

  applyResolved(resolved);
  return resolved;
}

/* ── Store ─────────────────────────────────────────────────────── */

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system' as ThemeMode,
      resolved: 'dark' as ResolvedTheme,

      setMode: (mode) => {
        const resolved = activate(mode, set);
        set({ mode, resolved });
      },
    }),
    {
      name: 'theme-storage',
      // Only persist the user's preference — `resolved` is derived
      partialize: (s) => ({ mode: s.mode }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const resolved = activate(state.mode, useThemeStore.setState);
        useThemeStore.setState({ resolved });
      },
    }
  )
);
