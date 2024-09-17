import { create } from "zustand";

export const useAdStore = create((set) => ({
  actionCount: 0,
  incrementActionCount: () =>
    set((state) => ({ actionCount: state.actionCount + 1 })),
  resetActionCount: () => set({ actionCount: 0 }),
}));
