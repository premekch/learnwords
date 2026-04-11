import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set) => ({
      activePairId: null,
      setActivePairId: (id) => set({ activePairId: id }),
    }),
    { name: 'lw-language' },
  ),
);
