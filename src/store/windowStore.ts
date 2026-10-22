import { create } from 'zustand';
import type { AppManifest } from '../types/hkos';

export interface WindowInstance {
  id: string; // unique window instance id
  app: AppManifest;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prevBounds?: { x: number; y: number; width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  isSnapped: 'left' | 'right' | null;
  zIndex: number;
}

interface WindowState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  topZIndex: number;
  openWindow: (app: AppManifest) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  snapWindow: (id: string, side: 'left' | 'right') => void;
  updateWindowBounds: (id: string, bounds: Partial<{ x: number; y: number; width: number; height: number }>) => void;
}

export const useWindowStore = create<WindowState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  topZIndex: 10,

  openWindow: (app) => {
    const { windows, topZIndex } = get();
    // Check if window for this app already exists and is not minimized
    const existing = windows.find(w => w.app.id === app.id);
    if (existing) {
      set({
        activeWindowId: existing.id,
        topZIndex: topZIndex + 1,
        windows: windows.map(w => w.id === existing.id ? { ...w, isMinimized: false, zIndex: topZIndex + 1 } : w),
      });
      return existing.id;
    }

    const id = `win_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const offset = (windows.length % 6) * 32;
    const newWindow: WindowInstance = {
      id,
      app,
      title: app.name,
      x: 60 + offset,
      y: 40 + offset,
      width: Math.min(window.innerWidth - 120, 880),
      height: Math.min(window.innerHeight - 180, 580),
      isMinimized: false,
      isMaximized: false,
      isSnapped: null,
      zIndex: topZIndex + 1,
    };

    set({
      windows: [...windows, newWindow],
      activeWindowId: id,
      topZIndex: topZIndex + 1,
    });
    return id;
  },

  closeWindow: (id) => {
    const { windows, activeWindowId } = get();
    const remaining = windows.filter(w => w.id !== id);
    const nextActive = activeWindowId === id ? (remaining[remaining.length - 1]?.id ?? null) : activeWindowId;
    set({ windows: remaining, activeWindowId: nextActive });
  },

  focusWindow: (id) => {
    const { windows, topZIndex } = get();
    set({
      activeWindowId: id,
      topZIndex: topZIndex + 1,
      windows: windows.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: topZIndex + 1 } : w),
    });
  },

  minimizeWindow: (id) => {
    const { windows, activeWindowId } = get();
    const remaining = windows.filter(w => w.id !== id && !w.isMinimized);
    set({
      windows: windows.map(w => w.id === id ? { ...w, isMinimized: true } : w),
      activeWindowId: activeWindowId === id ? (remaining[0]?.id ?? null) : activeWindowId,
    });
  },

  maximizeWindow: (id) => {
    const { windows, topZIndex } = get();
    set({
      topZIndex: topZIndex + 1,
      activeWindowId: id,
      windows: windows.map(w => {
        if (w.id !== id) return w;
        if (w.isMaximized) {
          // Restore
          const prev = w.prevBounds || { x: 100, y: 50, width: 880, height: 580 };
          return { ...w, isMaximized: false, isSnapped: null, ...prev, zIndex: topZIndex + 1 };
        } else {
          // Maximize
          return {
            ...w,
            isMaximized: true,
            isSnapped: null,
            prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
            zIndex: topZIndex + 1,
          };
        }
      }),
    });
  },

  snapWindow: (id, side) => {
    const { windows, topZIndex } = get();
    set({
      topZIndex: topZIndex + 1,
      activeWindowId: id,
      windows: windows.map(w => {
        if (w.id !== id) return w;
        if (w.isSnapped === side) {
          // Unsnap to prev bounds
          const prev = w.prevBounds || { x: 100, y: 50, width: 880, height: 580 };
          return { ...w, isSnapped: null, ...prev, zIndex: topZIndex + 1 };
        }
        return {
          ...w,
          isSnapped: side,
          isMaximized: false,
          prevBounds: w.prevBounds || { x: w.x, y: w.y, width: w.width, height: w.height },
          zIndex: topZIndex + 1,
        };
      }),
    });
  },

  updateWindowBounds: (id, bounds) => {
    set(state => ({
      windows: state.windows.map(w => (w.id === id ? { ...w, ...bounds } : w)),
    }));
  },
}));
