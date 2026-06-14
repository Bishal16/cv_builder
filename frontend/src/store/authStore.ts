import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified?: boolean;
}

interface AuthState {
  user: UserDetails | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDetails, token: string) => void;
  updateUser: (user: UserDetails) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (user) => set({ user }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Clear potential cached data from other stores
        localStorage.removeItem('cv-storage');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
