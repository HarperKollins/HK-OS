import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppId, AppMeta } from '../types/app';

export type SystemMode = 'normal' | 'focus' | 'exam';
export type BootState = 'booting' | 'desktop';

const DEFAULT_APPS: AppMeta[] = [
  { id: 'hkai', name: 'HK AI', icon: 'Brain', description: 'AI-powered learning platform', status: 'closed', isInstalled: true },
  { id: 'simulation', name: 'HK Simulation', icon: 'FlaskConical', description: 'Interactive science simulations', status: 'closed', isInstalled: true },
  { id: 'docs', name: 'HK Docs', icon: 'FileText', description: 'Learning notebook and notes', status: 'closed', isInstalled: true },
  { id: 'codelab', name: 'HK Code Lab', icon: 'Code2', description: 'Code editor and execution', status: 'closed', isInstalled: true },
  { id: 'schools', name: 'Digital Schools', icon: 'GraduationCap', description: 'Institutional learning environments', status: 'closed', isInstalled: true },
  { id: 'media', name: 'Learning Media', icon: 'PlayCircle', description: 'Presentations and educational media', status: 'closed', isInstalled: true },
  { id: 'store', name: 'Edu-Store', icon: 'Store', description: 'Educational application marketplace', status: 'closed', isInstalled: true },
  { id: 'settings', name: 'Settings', icon: 'Settings', description: 'System settings and preferences', status: 'closed', isInstalled: true },
];

interface SystemState {
  bootState: BootState;
  activeApp: AppId | null;
  openApps: AppId[];
  apps: AppMeta[];
  mode: SystemMode;
  focusStartTime: string | null;
  examEndTime: string | null;
  examDurationMinutes: number;
  splitApp: AppId | null;
  setBootState: (state: BootState) => void;
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  setActiveApp: (id: AppId) => void;
  setSplitApp: (id: AppId | null) => void;
  setMode: (mode: SystemMode) => void;
  startExam: (durationMinutes: number) => void;
  endExam: () => void;
  reboot: () => void;
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      bootState: 'booting',
      activeApp: null,
      openApps: [],
      apps: DEFAULT_APPS,
      mode: 'normal',
      focusStartTime: null,
      examEndTime: null,
      examDurationMinutes: 60,
      splitApp: null,

      setBootState: (bootState) => set({ bootState }),

      openApp: (id) => set((state) => ({
        openApps: state.openApps.includes(id) ? state.openApps : [...state.openApps, id],
        activeApp: id,
        apps: state.apps.map(a => a.id === id ? { ...a, status: 'open' } : a),
      })),

      closeApp: (id) => set((state) => ({
        openApps: state.openApps.filter(a => a !== id),
        activeApp: state.activeApp === id
          ? (state.openApps.filter(a => a !== id)[0] ?? null)
          : state.activeApp,
        apps: state.apps.map(a => a.id === id ? { ...a, status: 'closed' } : a),
        splitApp: state.splitApp === id ? null : state.splitApp,
      })),

      setActiveApp: (id) => set({ activeApp: id }),
      setSplitApp: (id) => set({ splitApp: id }),

      setMode: (mode) => set({
        mode,
        focusStartTime: mode === 'focus' ? new Date().toISOString() : null,
      }),

      startExam: (durationMinutes) => set({
        mode: 'exam',
        examDurationMinutes: durationMinutes,
        examEndTime: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
      }),

      endExam: () => set({ mode: 'normal', examEndTime: null }),

      reboot: () => set({ bootState: 'booting', activeApp: null, openApps: [], mode: 'normal' }),
    }),
    { name: 'hkos-system', partialize: (s) => ({ apps: s.apps, mode: s.mode }) }
  )
);
