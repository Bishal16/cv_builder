import { create } from 'zustand';
import type { Cv, CreateCvData, UpdateCvData } from '../types/cv';
import * as cvApi from '../api/cvApi';

interface CvState {
  cvs: Cv[];
  currentCv: Cv | null;
  loading: boolean;
  error: string | null;
  loadCvs: () => Promise<void>;
  selectCv: (id: string) => Promise<void>;
  createCv: (data: CreateCvData) => Promise<Cv>;
  updateCv: (id: string, data: UpdateCvData) => Promise<Cv>;
  deleteCv: (id: string) => Promise<void>;
}

export const useCvStore = create<CvState>((set) => ({
  cvs: [],
  currentCv: null,
  loading: false,
  error: null,

  loadCvs: async () => {
    set({ loading: true, error: null });
    try {
      const cvs = await cvApi.getAllCvs();
      set({ cvs, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  selectCv: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const cv = await cvApi.getCv(id);
      set({ currentCv: cv, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createCv: async (data: CreateCvData) => {
    set({ loading: true, error: null });
    try {
      const cv = await cvApi.createCv(data);
      set(state => ({ cvs: [...state.cvs, cv], currentCv: cv, loading: false }));
      return cv;
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  updateCv: async (id: string, data: UpdateCvData) => {
    set({ loading: true, error: null });
    try {
      const cv = await cvApi.updateCv(id, data);
      set(state => ({
        cvs: state.cvs.map(c => c.id === id ? cv : c),
        currentCv: state.currentCv?.id === id ? cv : state.currentCv,
        loading: false,
      }));
      return cv;
    } catch (err) {
      const message = (err as Error).message;
      set({ error: message, loading: false });
      throw err;
    }
  },

  deleteCv: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await cvApi.deleteCv(id);
      set(state => ({
        cvs: state.cvs.filter(c => c.id !== id),
        currentCv: state.currentCv?.id === id ? null : state.currentCv,
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));

export const getCvById = (id: string) => useCvStore.getState().cvs.find(cv => cv.id === id);