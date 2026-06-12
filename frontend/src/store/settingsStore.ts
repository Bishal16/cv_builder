import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TemplateId } from '../types/cv';

interface SettingsState {
  /** Template applied to newly created resumes */
  defaultTemplateId: TemplateId;
  setDefaultTemplateId: (id: TemplateId) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultTemplateId: 'CLASSIC',
      setDefaultTemplateId: (id) => set({ defaultTemplateId: id }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
