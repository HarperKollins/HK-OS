import React, { useState } from 'react';
import { Store, Download, CheckCircle, Terminal, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppDiscoveryStore } from '../../store/appDiscoveryStore';
import type { AppManifest } from '../../types/hkos';

interface CatalogItem {
  id: string;
  name: string;
  category: 'Web Services' | 'Native Windows Software';
  type: 'web' | 'native';
  description: string;
  url?: string;
  packageId?: string;
  executable?: string;
  icon: string;
}

const CATALOG: CatalogItem[] = [
  // Web Apps
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    category: 'Web Services',
    type: 'web',
    description: 'The free encyclopedia with millions of educational articles across all scientific domains.',
    url: 'https://en.wikipedia.org',
    icon: 'Globe'
  },
  {
    id: 'khan-academy',
    name: 'Khan Academy',
    category: 'Web Services',
    type: 'web',
    description: 'Free, world-class education for anyone, anywhere. Mathematics, science, and computing.',
    url: 'https://www.khanacademy.org',
    icon: 'GraduationCap'
  },
  {
    id: 'phET-sims',
    name: 'PhET Interactive Simulations',
    category: 'Web Services',
    type: 'web',
    description: 'Interactive simulations for science and math from University of Colorado Boulder.',
    url: 'https://phet.colorado.edu',
    icon: 'FlaskConical'
  },
  // Real Native Windows Software via winget
  {
    id: 'notepadplusplus',
    name: 'Notepad++',
    category: 'Native Windows Software',
    type: 'native',
    description: 'A free source code editor and Notepad replacement that supports several languages.',
    packageId: 'Notepad++.Notepad++',
    executable: 'notepad++',
    icon: 'FileCode'
  },
  {
    id: 'vlc',
    name: 'VLC Media Player',
    category: 'Native Windows Software',
    type: 'native',
    description: 'Free and open-source cross-platform multimedia player for recorded lessons and lectures.',
    packageId: 'VideoLAN.VLC',
    executable: 'vlc',
    icon: 'PlayCircle'
  },
  {
    id: '7zip',
    name: '7-Zip Archiver',
    category: 'Native Windows Software',
    type: 'native',
    description: 'High-compression file archiver for open-source datasets and course archives.',
    packageId: '7zip.7zip',
    executable: '7z',
    icon: 'Archive'
  }
];

export const EduStoreApp: React.FC = () => {
  const { apps, loadApps } = useAppDiscoveryStore();
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isInstalled = (id: string) => apps.some(a => a.id === id);

  const handleInstallWeb = async (item: CatalogItem) => {
    setInstallingId(item.id);
    setError(null);
    setLogs([`Creating manifest for ${item.name}...`]);

    const manifest: AppManifest = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      type: 'web',
      url: item.url,
      partition: `persist:${item.id}`,
      permissions: ['network', 'storage']
    };

    if (window.hkos?.installWebApp) {
      const res = await window.hkos.installWebApp(manifest);
      if (res.success) {
        setLogs(prev => [...prev, `[OK] Created Documents/HK OS/apps/${item.id}/app.json`, `App is now ready in App Shelf!`]);
        await loadApps();
      } else {
        setError(res.error || 'Failed to install manifest');
      }
    }
    setInstallingId(null);
  };

  const handleInstallNative = async (item: CatalogItem) => {
    if (!item.packageId) return;
    setInstallingId(item.id);
    setError(null);
    setLogs([`$ winget install --id ${item.packageId} --exact...`]);

    let cleanupListener: (() => void) | undefined;

    if (window.hkos?.onWingetLog) {
      cleanupListener = window.hkos.onWingetLog(item.packageId, data => {
        setLogs(prev => [...prev, data.text]);
      });
    }

    if (window.hkos?.wingetInstall) {
      const res = await window.hkos.wingetInstall({
        packageId: item.packageId,
        appName: item.name,
        icon: item.icon,
        executable: item.executable
      });

      if (cleanupListener) cleanupListener();

      if (res.success) {
        setLogs(prev => [...prev, `[OK] Package installed. Manifest registered. App added to Shelf.`]);
        await loadApps();
      } else {
        setError(res.error || `winget failed with exit code ${res.exitCode}`);
        setLogs(prev => [...prev, `[FAILED] ${res.error || 'winget execution error'}`]);
      }
    } else {
      setError('Native installation engine not available outside Electron environment');
    }

    setInstallingId(null);
  };

  return (
    <div className="h-full flex flex-col bg-hk-bg text-white font-sans">
      <div className="flex items-center justify-between px-4 py-2 border-b border-hk-border bg-hk-surface">
        <div className="flex items-center gap-2">
          <Store size={16} className="text-yellow-400" />
          <span className="text-sm font-semibold">Real Edu-Store</span>
          <span className="text-xs text-hk-muted">Real Manifests & Real Windows winget Installs</span>
        </div>
        <button onClick={() => loadApps()} className="p-1 text-hk-muted hover:text-white">
          <RefreshCw size={13} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Catalog */}
        <div className="flex-1 p-5 overflow-y-auto space-y-6">
          {['Web Services', 'Native Windows Software'].map(category => (
            <div key={category}>
              <h2 className="text-xs uppercase tracking-wider text-hk-muted font-bold mb-3">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CATALOG.filter(c => c.category === category).map(item => {
                  const installed = isInstalled(item.id);
                  const isCurrent = installingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-hk-border bg-hk-surface/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm text-white">{item.name}</h3>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-hk-bg border border-hk-border text-hk-muted">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-hk-muted mt-1 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-hk-border/40 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-hk-muted">
                          {item.type === 'web' ? item.url : `winget: ${item.packageId}`}
                        </span>

                        {installed ? (
                          <span className="flex items-center gap-1 text-xs text-hk-emerald font-semibold">
                            <CheckCircle size={13} /> In App Shelf
                          </span>
                        ) : (
                          <button
                            onClick={() => item.type === 'web' ? handleInstallWeb(item) : handleInstallNative(item)}
                            disabled={isCurrent}
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-hk-blue text-white hover:bg-hk-blue/90 disabled:opacity-40"
                          >
                            <Download size={12} /> {isCurrent ? 'Installing...' : 'Install'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Live Terminal Progress Log */}
        {(installingId || logs.length > 0) && (
          <div className="w-80 border-l border-hk-border bg-hk-surface/30 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-hk-border mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-white">
                <Terminal size={12} /> Live Installation Log
              </span>
              <button onClick={() => { setLogs([]); setError(null); }} className="text-xs text-hk-muted hover:text-white">Clear</button>
            </div>
            {error && (
              <div className="p-2 mb-2 rounded bg-hk-red/10 border border-hk-red/30 text-hk-red text-xs flex items-center gap-1.5">
                <AlertCircle size={12} /> {error}
              </div>
            )}
            <div className="flex-1 font-mono text-[11px] text-hk-emerald overflow-auto whitespace-pre-wrap leading-relaxed bg-hk-bg p-2 rounded border border-hk-border">
              {logs.join('')}
              {installingId && <span className="inline-block w-2 h-3 bg-hk-emerald ml-1 animate-pulse" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
