import { create } from 'zustand';
import type { AppManifest } from '../types/hkos';

interface AppDiscoveryState {
  apps: AppManifest[];
  isLoading: boolean;
  error: string | null;
  loadApps: () => Promise<void>;
  deleteApp: (appId: string) => Promise<boolean>;
  installWebApp: (appData: AppManifest) => Promise<boolean>;
}

export const useAppDiscoveryStore = create<AppDiscoveryState>((set, get) => ({
  apps: [],
  isLoading: true,
  error: null,

  loadApps: async () => {
    set({ isLoading: true, error: null });
    try {
      if (window.hkos?.listApps) {
        const apps = await window.hkos.listApps();
        set({ apps, isLoading: false });
      } else {
        // Fallback for browser preview if testing without electron
        set({
          apps: [
            { id: 'hk-ai', name: 'HK AI', icon: 'Brain', type: 'web', url: 'https://hkai.site' },
            { id: 'youtube', name: 'YouTube', icon: 'Youtube', type: 'web', url: 'https://www.youtube.com' },
            { id: 'notes', name: 'Notes', icon: 'FileText', type: 'local', entry: 'notes' },
            { id: 'codelab', name: 'Code Lab', icon: 'Code2', type: 'local', entry: 'codelab' },
            { id: 'simulation', name: 'Simulation', icon: 'FlaskConical', type: 'local', entry: 'simulation' },
            { id: 'files', name: 'Files', icon: 'Folder', type: 'local', entry: 'files' },
            { id: 'store', name: 'Edu-Store', icon: 'Store', type: 'local', entry: 'store' },
          ],
          isLoading: false
        });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  deleteApp: async (appId: string) => {
    try {
      if (window.hkos?.deleteApp) {
        const res = await window.hkos.deleteApp(appId);
        if (res.success) {
          await get().loadApps();
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  installWebApp: async (appData: AppManifest) => {
    try {
      if (window.hkos?.installWebApp) {
        const res = await window.hkos.installWebApp(appData);
        if (res.success) {
          await get().loadApps();
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },
}));
