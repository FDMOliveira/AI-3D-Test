import { create } from "zustand";

interface CameraStore {
  currentSection: number;
  sectionCount: number;
  isAnimating: boolean;
  setCurrentSection: (n: number) => void;
  setAnimating: (v: boolean) => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  currentSection: 0,
  sectionCount: 3,
  isAnimating: false,
  setCurrentSection: (n) => set({ currentSection: n }),
  setAnimating: (v) => set({ isAnimating: v }),
}));
