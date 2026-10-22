export type AppStatus = 'open' | 'closed' | 'minimized';
export type AppId = 'hkai' | 'simulation' | 'docs' | 'codelab' | 'schools' | 'media' | 'store' | 'settings';

export interface AppMeta {
  id: AppId;
  name: string;
  icon: string;
  description: string;
  status: AppStatus;
  isInstalled: boolean;
}

export interface StoreModule {
  id: string;
  name: string;
  category: string;
  description: string;
  developer: string;
  version: string;
  size: string;
  rating: number;
  installState: 'available' | 'installing' | 'installed';
  installProgress?: number;
}

export interface AppRegistry {
  coreApps: AppMeta[];
  installedModules: StoreModule[];
}
