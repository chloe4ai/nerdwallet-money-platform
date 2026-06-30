'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type State = {
  profileId: string | null;
  pmLens: boolean;
  setProfileId: (id: string | null) => void;
  togglePmLens: () => void;
  reset: () => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      profileId: null,
      pmLens: false,
      setProfileId: (id) => set({ profileId: id }),
      togglePmLens: () => set((s) => ({ pmLens: !s.pmLens })),
      reset: () => set({ profileId: null }),
    }),
    { name: 'nw-money' }
  )
);
