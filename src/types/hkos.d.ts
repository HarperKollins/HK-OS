export interface AppManifest {
  id: string;
  name: string;
  icon: string;
  type: 'web' | 'local' | 'native';
  url?: string;
  entry?: string;
  executable?: string;
  packageId?: string;
  partition?: string;
  permissions?: string[];
}

export interface FileItem {
  name: string;
  isDirectory: boolean;
  size: number;
  updatedAt: string;
}

export interface ExecResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export interface WingetResult {
  success: boolean;
  exitCode: number;
  output: string;
  error?: string;
}

export interface HKOSBridge {
  isElectron?: boolean;
  getSystemInfo: () => Promise<{ platform: string; arch: string; rootPath: string; python: boolean; winget: boolean }>;
  listApps: () => Promise<AppManifest[]>;
  installWebApp: (appData: AppManifest) => Promise<{ success: boolean; error?: string }>;
  deleteApp: (appId: string) => Promise<{ success: boolean; error?: string }>;
  launchNative: (executable: string) => Promise<{ success: boolean; error?: string }>;
  fsList: (subPath?: string) => Promise<FileItem[]>;
  fsRead: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  fsWrite: (filePath: string, content: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  fsDelete: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  fsMkdir: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
  execRun: (language: string, code: string) => Promise<ExecResult>;
  wingetInstall: (params: { packageId: string; appName: string; icon?: string; executable?: string }) => Promise<WingetResult>;
  onWingetLog: (packageId: string, callback: (data: { type: 'stdout' | 'stderr'; text: string }) => void) => () => void;
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    hkos?: HKOSBridge;
  }
}
