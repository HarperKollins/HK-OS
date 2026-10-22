import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WallpaperPreset = 'void' | 'circuit' | 'server' | 'carbon' | 'custom';

export interface WallpaperState {
  preset: WallpaperPreset;
  customUrl: string;
  setPreset: (preset: WallpaperPreset) => void;
  setCustomUrl: (url: string) => void;
}

export const useWallpaperStore = create<WallpaperState>()(
  persist(
    (set) => ({
      preset: 'void',
      customUrl: '',
      setPreset: (preset) => set({ preset }),
      setCustomUrl: (customUrl) => set({ customUrl, preset: 'custom' }),
    }),
    { name: 'hkos-wallpaper' }
  )
);
