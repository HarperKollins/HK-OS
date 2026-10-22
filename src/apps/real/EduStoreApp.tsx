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
    id: 'phet-sims',
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
    <div className="h-full flex flex-col bg-[#000000] text-[#ddffdc] font-['Inter']">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#485346] bg-[#181818]">
        <div className="flex items-center gap-2.5">
          <Store size={15} className="text-[#7fee64]" />
          <span className="text-xs font-semibold text-[#ddffdc] font-['Space_Grotesk']">Edu-Store Registry</span>
          <span className="text-[11px] font-mono text-[#8cab87]">Verified Web Manifests & Host Winget Packages</span>
        </div>
        <button onClick={() => loadApps()} className="p-1 text-[#8cab87] hover:text-[#ddffdc]" title="Reload">
          <RefreshCw size={13} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Catalog */}
        <div className="flex-1 p-6 overflow-y-auto space-y-7">
          {['Web Services', 'Native Windows Software'].map(category => (
            <div key={category}>
              <p className="text-[11px] uppercase tracking-[0.05em] text-[#9cbf93] font-medium mb-3">
                {category}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATALOG.filter(c => c.category === category).map(item => {
                  const installed = isInstalled(item.id);
                  const isCurrent = installingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-lg border border-[#485346] bg-[#1f2a33] hover:border-[#7fee64] flex flex-col justify-between transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm text-[#ddffdc] font-['Space_Grotesk']">{item.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#485346] text-[#9cbf93] bg-[#181818] uppercase font-mono">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-xs text-[#8cab87] leading-relaxed">{item.description}</p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-[#485346]/50 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#677d64] truncate max-w-[180px]">
                          {item.type === 'web' ? item.url : `id: ${item.packageId}`}
                        </span>

                        {installed ? (
                          <span className="flex items-center gap-1.5 text-xs text-[#7fee64] font-medium">
                            <CheckCircle size={13} /> Installed
                          </span>
                        ) : (
                          <button
                            onClick={() => item.type === 'web' ? handleInstallWeb(item) : handleInstallNative(item)}
                            disabled={isCurrent}
                            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-[#7fee64] text-[#000000] hover:brightness-110 disabled:opacity-40 transition-all shadow-[0_0_10px_rgba(127,238,100,0.25)]"
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
          <div className="w-88 border-l border-[#485346] bg-[#181818] p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#485346] mb-3">
              <span className="text-xs font-medium text-[#ddffdc] flex items-center gap-1.5 font-['Space_Grotesk']">
                <Terminal size={12} className="text-[#7fee64]" /> Live winget Telemetry
              </span>
              <button onClick={() => { setLogs([]); setError(null); }} className="text-xs text-[#8cab87] hover:text-[#ddffdc]">Clear</button>
            </div>
            {error && (
              <div className="p-2.5 mb-3 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171] text-xs flex items-center gap-2">
                <AlertCircle size={13} /> {error}
              </div>
            )}
            <div className="flex-1 font-mono text-[11px] text-[#7fee64] overflow-auto whitespace-pre-wrap leading-relaxed bg-[#000000] p-3 rounded-lg border border-[#485346]">
              {logs.join('')}
              {installingId && <span className="inline-block w-2 h-3 bg-[#7fee64] ml-1 animate-pulse" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
