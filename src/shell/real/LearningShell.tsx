import React, { useState, useEffect } from 'react';
import {
  Brain, FileText, Code2, FlaskConical, Folder, Store,
  Terminal, Globe, LayoutGrid, Clock, HardDrive, Trash2, X,
  Image as ImageIcon, Check
} from 'lucide-react';
import { useWindowStore } from '../../store/windowStore';
import { useAppDiscoveryStore } from '../../store/appDiscoveryStore';
import { useWallpaperStore, type WallpaperPreset } from '../../store/wallpaperStore';
import { AppWindow } from './AppWindow';
import type { AppManifest } from '../../types/hkos';

const YoutubeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Brain, Youtube: YoutubeIcon, FileText, Code2, FlaskConical, Folder, Store, Terminal, Globe
};

// 3D Emissive Lime Cube for Modal aesthetic
const ModalCube: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
    {/* Top face */}
    <polygon points="50,15 85,35 50,55 15,35" fill="#7fee64" fillOpacity="0.85" stroke="#7fee64" strokeWidth="1.5" />
    {/* Left face */}
    <polygon points="15,35 50,55 50,90 15,70" fill="#18b759" fillOpacity="0.7" stroke="#7fee64" strokeWidth="1.5" />
    {/* Right face */}
    <polygon points="50,55 85,35 85,70 50,90" fill="#09af58" fillOpacity="0.9" stroke="#7fee64" strokeWidth="1.5" />
    {/* Inner glow lines */}
    <line x1="50" y1="55" x2="50" y2="90" stroke="#ddffdc" strokeWidth="1" strokeOpacity="0.6" />
    <line x1="15" y1="35" x2="50" y2="55" stroke="#ddffdc" strokeWidth="1" strokeOpacity="0.6" />
    <line x1="85" y1="35" x2="50" y2="55" stroke="#ddffdc" strokeWidth="1" strokeOpacity="0.6" />
  </svg>
);

export const LearningShell: React.FC = () => {
  const { windows, activeWindowId, openWindow, closeWindow, focusWindow, snapWindow } = useWindowStore();
  const { apps, loadApps, deleteApp } = useAppDiscoveryStore();
  const { preset, customUrl, setPreset, setCustomUrl } = useWallpaperStore();
  
  const [shelfOpen, setShelfOpen] = useState(false);
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [time, setTime] = useState(new Date());
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    loadApps();
    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    const sessionTimer = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => {
      clearInterval(clockTimer);
      clearInterval(sessionTimer);
    };
  }, []);

  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLaunch = (app: AppManifest) => {
    openWindow(app);
    setShelfOpen(false);
  };

  const handleDelete = async (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete app folder "Documents/HK OS/apps/${appId}" from disk?`)) {
      await deleteApp(appId);
    }
  };

  // Determine wallpaper style
  const getWallpaperBackground = () => {
    if (preset === 'custom' && customUrl) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url("${customUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (preset === 'circuit') {
      return {
        backgroundColor: '#000000',
        backgroundImage: `
          linear-gradient(to right, rgba(72, 83, 70, 0.15) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(72, 83, 70, 0.15) 1px, transparent 1px),
          radial-gradient(circle at 50% 10%, rgba(127, 238, 100, 0.08) 0%, transparent 60%)
        `,
        backgroundSize: '32px 32px, 32px 32px, 100% 100%',
      };
    }
    if (preset === 'server') {
      return {
        backgroundColor: '#000000',
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(31, 42, 51, 0.4) 0px, rgba(31, 42, 51, 0.4) 1px, transparent 1px, transparent 4px),
          radial-gradient(circle at 50% 0%, rgba(127, 238, 100, 0.06) 0%, transparent 70%)
        `,
      };
    }
    if (preset === 'carbon') {
      return {
        backgroundColor: '#181818',
        backgroundImage: `
          radial-gradient(#212525 15%, transparent 16%),
          radial-gradient(#212525 15%, transparent 16%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
      };
    }
    // Default: Void Phosphor
    return {
      backgroundColor: '#000000',
      backgroundImage: 'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(127, 238, 100, 0.07) 0%, transparent 75%)',
    };
  };

  return (
    <div
      style={getWallpaperBackground()}
      className="fixed inset-0 flex flex-col overflow-hidden select-none font-['Inter'] text-[#ddffdc] transition-all duration-300"
    >
      {/* 1. MODAL NAVIGATION BAR / LEARNING MASTHEAD */}
      <header className="h-14 bg-[#212525]/90 backdrop-blur-md border-b border-[#1f2a33] flex items-center justify-between px-6 z-40 shrink-0 shadow-[rgba(0,0,0,0.1)_0px_10px_15px_-3px]">
        {/* Left: Brand + App Shelf Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <ModalCube size={26} />
            <span className="font-['Space_Grotesk'] font-bold text-base tracking-tight text-[#ddffdc]">
              HK OS
            </span>
          </div>

          <div className="w-px h-5 bg-[#485346]" />

          {/* App Shelf Trigger */}
          <button
            onClick={() => setShelfOpen(!shelfOpen)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all duration-300 border ${
              shelfOpen
                ? 'bg-[#7fee64] text-[#000000] border-[#7fee64] shadow-[0_0_12px_rgba(127,238,100,0.35)]'
                : 'bg-[#181818] border-[#485346] text-[#ddffdc] hover:border-[#7fee64] hover:text-[#7fee64]'
            }`}
          >
            <LayoutGrid size={13} />
            <span>App Shelf</span>
          </button>
        </div>

        {/* Center: CURRENT SUBJECT HORIZON */}
        <div className="flex items-center gap-3.5 max-w-xl truncate">
          <span className="text-[#9cbf93] font-medium text-[11px] uppercase tracking-[0.05em]">
            CURRENT SUBJECT
          </span>
          <div className="w-1 h-1 rounded-full bg-[#485346]" />
          <span className="font-medium text-xs text-[#ddffdc] truncate">
            Physics & Computational Modeling
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#485346] text-[11px] font-mono text-[#8cab87]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7fee64] animate-pulse" />
            <span>{formatTimer(sessionSeconds)}</span>
          </div>
        </div>

        {/* Right: Wallpaper, Disk Telemetry & Clock */}
        <div className="flex items-center gap-3 text-xs text-[#8cab87]">
          {/* Wallpaper selector toggle */}
          <button
            onClick={() => setWallpaperModalOpen(!wallpaperModalOpen)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all ${
              wallpaperModalOpen
                ? 'bg-[#181818] border-[#7fee64] text-[#7fee64]'
                : 'bg-[#181818] border-[#485346] text-[#8cab87] hover:text-[#ddffdc] hover:border-[#8cab87]'
            }`}
            title="Configure Wallpaper"
          >
            <ImageIcon size={13} />
            <span>Wallpaper</span>
          </button>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8cab87] px-2.5 py-1 rounded-full bg-[#181818] border border-[#485346]" title="Real Root on disk">
            <HardDrive size={12} className="text-[#7fee64]" />
            <span>Documents/HK OS</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#ddffdc] font-mono text-xs pl-1">
            <Clock size={12} className="text-[#8cab87]" />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* 2. WALLPAPER PICKER OVERLAY */}
      {wallpaperModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setWallpaperModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#181818] border border-[#485346] rounded-xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#485346] mb-4">
              <div>
                <p className="text-[11px] font-medium text-[#9cbf93] uppercase tracking-[0.05em]">SYSTEM APPEARANCE</p>
                <h3 className="text-base font-medium text-[#ddffdc] font-['Space_Grotesk']">Wallpaper & Ambience</h3>
              </div>
              <button
                onClick={() => setWallpaperModalOpen(false)}
                className="text-[#8cab87] hover:text-[#ddffdc] p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2 mb-5">
              <p className="text-xs text-[#8cab87] font-medium mb-2">Phosphor Presets</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'void', name: 'Void Phosphor', desc: 'Dark terminal void with top bloom' },
                  { id: 'circuit', name: 'Circuit Grid', desc: 'Phosphor hardware grid lines' },
                  { id: 'server', name: 'Server Scanline', desc: 'Phosphor terminal scanlines' },
                  { id: 'carbon', name: 'Carbon Veil', desc: 'Elevated surface carbon mesh' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setPreset(item.id as WallpaperPreset)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      preset === item.id
                        ? 'border-[#7fee64] bg-[#7fee64]/10 text-[#ddffdc]'
                        : 'border-[#485346] bg-[#212525] text-[#8cab87] hover:border-[#8cab87] hover:text-[#ddffdc]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{item.name}</span>
                      {preset === item.id && <Check size={12} className="text-[#7fee64]" />}
                    </div>
                    <span className="text-[10px] text-[#677d64] block leading-tight">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Wallpaper URL */}
            <div className="space-y-2">
              <p className="text-xs text-[#8cab87] font-medium">Custom Image URL</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/wallpaper.jpg"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  className="flex-1 bg-[#212525] border border-[#485346] rounded-lg px-3 py-2 text-xs text-[#ddffdc] placeholder-[#677d64] outline-none focus:border-[#7fee64]"
                />
                <button
                  onClick={() => {
                    if (inputUrl.trim()) {
                      setCustomUrl(inputUrl.trim());
                      setWallpaperModalOpen(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-[#7fee64] text-[#000000] text-xs font-semibold hover:brightness-110"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. RIBBON: OPEN APPS STRIP */}
      {windows.length > 0 && (
        <div className="h-10 bg-[#181818]/95 border-b border-[#1f2a33] px-4 flex items-center gap-2 z-30 shrink-0 overflow-x-auto">
          {windows.map(win => {
            const Icon = ICON_MAP[win.app.icon] || Globe;
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <div
                key={win.id}
                onClick={() => focusWindow(win.id)}
                className={`h-7 px-3 rounded-full flex items-center gap-2 cursor-pointer transition-all border text-xs font-medium shrink-0 ${
                  isActive
                    ? 'bg-[#212525] border-[#7fee64] text-[#ddffdc] shadow-[0_0_8px_rgba(127,238,100,0.2)]'
                    : 'bg-[#181818] border-[#485346] text-[#8cab87] hover:border-[#8cab87] hover:text-[#ddffdc]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#7fee64]' : 'bg-[#485346]'}`} />
                <Icon size={12} className={isActive ? 'text-[#7fee64]' : 'text-[#8cab87]'} />
                <span className="truncate max-w-[120px]">{win.title}</span>

                <div className="flex items-center gap-1 ml-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => snapWindow(win.id, 'left')}
                    className="hover:text-[#7fee64] text-[#677d64] px-0.5"
                    title="Snap 50% Left"
                  >
                    ◧
                  </button>
                  <button
                    onClick={() => snapWindow(win.id, 'right')}
                    className="hover:text-[#7fee64] text-[#677d64] px-0.5"
                    title="Snap 50% Right"
                  >
                    ◨
                  </button>
                  <button
                    onClick={() => closeWindow(win.id)}
                    className="hover:text-[#f87171] text-[#677d64] px-1 font-bold"
                    title="Close window"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL APP SHELF (Slide-out Workload Grid) */}
      {shelfOpen && (
        <div
          className="fixed inset-0 top-14 z-50 bg-black/75 backdrop-blur-md flex justify-center p-8 animate-fadeIn"
          onClick={() => setShelfOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-[#181818] border border-[#485346] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] p-8 flex flex-col max-h-[82vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-[#485346] mb-6">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-[#9cbf93] mb-1">
                  SYSTEM REGISTRY // LIVE DISK DISCOVERY
                </p>
                <h2 className="text-2xl font-medium text-[#ddffdc] font-['Space_Grotesk'] tracking-tight">
                  <span className="text-[#7fee64]">Autonomous</span> Applications
                </h2>
                <p className="text-xs text-[#8cab87] mt-1 font-mono">
                  Discovered from <span className="text-[#ddffdc]">Documents/HK OS/apps/</span> (zero shell dependencies)
                </p>
              </div>

              <button
                onClick={() => setShelfOpen(false)}
                className="w-8 h-8 rounded-full border border-[#485346] flex items-center justify-center text-[#8cab87] hover:border-[#7fee64] hover:text-[#ddffdc] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Application Grid (Modal Workload Card Style) */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {['web', 'local', 'native'].map(type => {
                const groupApps = apps.filter(a => a.type === type);
                if (groupApps.length === 0) return null;
                const label = type === 'web' ? 'Isolated Web Apps' : type === 'local' ? 'Local Learning Tools' : 'Host Subprocesses';
                return (
                  <div key={type}>
                    <p className="text-[11px] uppercase tracking-[0.05em] font-medium text-[#9cbf93] mb-3">
                      {label}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {groupApps.map(app => {
                        const Icon = ICON_MAP[app.icon] || Globe;
                        return (
                          <div
                            key={app.id}
                            onClick={() => handleLaunch(app)}
                            className="p-5 rounded-lg border border-[#485346] bg-[#1f2a33] hover:border-[#7fee64] hover:bg-[#212525] cursor-pointer flex flex-col justify-between group transition-all duration-300"
                          >
                            <div className="flex items-start justify-between">
                              <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#485346] flex items-center justify-center text-[#7fee64] group-hover:border-[#7fee64] transition-colors">
                                <Icon size={20} />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-[#485346] text-[#9cbf93] bg-[#181818]">
                                  {app.type}
                                </span>
                                <button
                                  onClick={e => handleDelete(app.id, e)}
                                  className="opacity-0 group-hover:opacity-100 hover:text-[#f87171] text-[#677d64] p-1 transition-opacity"
                                  title="Delete app folder from disk"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm font-medium text-[#ddffdc] group-hover:text-[#7fee64] transition-colors font-['Space_Grotesk']">
                                {app.name}
                              </p>
                              <p className="text-xs text-[#8cab87] line-clamp-1 font-mono mt-1">
                                {app.type === 'web' ? app.url : app.type === 'native' ? app.executable : app.entry}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. MAIN STAGE / EMPTY HERO */}
      <main className="flex-1 relative overflow-hidden">
        {/* Empty State Hero (Modal Style centered-stack) */}
        {windows.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
            {/* Glowing 3D Cube with Radial Halo */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-[#7fee64]/15 blur-2xl transform scale-150" />
              <ModalCube size={72} className="relative z-10" />
            </div>

            <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-[#9cbf93] mb-3">
              HK OS // THE LEARNING OPERATING SYSTEM
            </p>

            <h1 className="text-4xl md:text-5xl font-['Space_Grotesk'] font-medium text-[#ddffdc] tracking-tight max-w-2xl leading-tight mb-4">
              <span className="text-[#7fee64]">Dedicated Environment</span> for Learning & Mastery
            </h1>

            <p className="text-base text-[#aed2a4] max-w-xl font-normal leading-relaxed mb-8">
              A self-contained computing platform. Every application is an autonomous folder discovered on your local disk.
            </p>

            {/* Modal CTA Pair: Lime Accent Pill + Ghost Outline */}
            <div className="flex items-center gap-3.5 pointer-events-auto">
              <button
                onClick={() => setShelfOpen(true)}
                className="px-6 py-3 rounded-full bg-[#7fee64] text-[#000000] text-sm font-medium hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_rgba(127,238,100,0.35)] flex items-center gap-2"
              >
                <LayoutGrid size={15} />
                <span>Open App Shelf</span>
              </button>

              <button
                onClick={() => {
                  const notesApp = apps.find(a => a.id === 'notes');
                  if (notesApp) openWindow(notesApp);
                }}
                className="px-6 py-3 rounded-xl border border-[#ddffdc] bg-transparent text-[#ddffdc] text-sm font-medium hover:bg-[#ddffdc]/5 transition-all duration-300"
              >
                Launch Notes
              </button>

              <button
                onClick={() => {
                  const codeLabApp = apps.find(a => a.id === 'codelab');
                  if (codeLabApp) openWindow(codeLabApp);
                }}
                className="px-6 py-3 rounded-xl border border-[#485346] bg-[#181818] text-[#8cab87] hover:text-[#ddffdc] hover:border-[#8cab87] text-sm font-medium transition-all duration-300"
              >
                Code Lab
              </button>
            </div>
          </div>
        )}

        {/* Windows Rendering */}
        {windows.map(win => (
          <AppWindow key={win.id} win={win} />
        ))}
      </main>
    </div>
  );
};
