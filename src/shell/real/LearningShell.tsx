import React, { useState, useEffect } from 'react';
import {
  Brain, FileText, Code2, FlaskConical, Folder, Store,
  Terminal, Globe, LayoutGrid, Clock, Wifi, HardDrive, Trash2, X
} from 'lucide-react';
import { useWindowStore } from '../../store/windowStore';
import { useAppDiscoveryStore } from '../../store/appDiscoveryStore';
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

export const LearningShell: React.FC = () => {
  const { windows, activeWindowId, openWindow, closeWindow, focusWindow, snapWindow, maximizeWindow } = useWindowStore();
  const { apps, loadApps, deleteApp } = useAppDiscoveryStore();
  const [shelfOpen, setShelfOpen] = useState(false);
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

  return (
    <div className="fixed inset-0 bg-hk-bg flex flex-col overflow-hidden select-none font-sans">
      {/* 1. TOP LEARNING MASTHEAD */}
      <header className="h-11 bg-hk-surface border-b border-hk-border flex items-center justify-between px-4 z-40 shrink-0">
        {/* Left: Brand + App Shelf Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-hk-emerald flex items-center justify-center font-bold text-black text-xs shadow-md shadow-hk-emerald/20">
              HK
            </div>
            <span className="font-bold text-sm tracking-wide text-white">HK OS</span>
          </div>

          <div className="w-px h-4 bg-hk-border" />

          <button
            onClick={() => setShelfOpen(!shelfOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              shelfOpen ? 'bg-hk-blue text-white' : 'bg-hk-bg border border-hk-border text-hk-muted hover:text-white hover:border-white/20'
            }`}
          >
            <LayoutGrid size={13} />
            <span>App Shelf</span>
          </button>
        </div>

        {/* Center: CURRENT SUBJECT HORIZON */}
        <div className="flex items-center gap-3 text-xs max-w-xl truncate">
          <span className="text-hk-muted uppercase tracking-widest font-bold text-[10px]">CURRENT SUBJECT:</span>
          <span className="font-semibold text-white truncate">
            Physics & Computational Modeling — Kinematics & Trajectory Solver
          </span>
          <span className="px-2 py-0.5 rounded-full bg-hk-blue/10 border border-hk-blue/30 text-hk-blue text-[10px] font-mono font-medium">
            Focus: {formatTimer(sessionSeconds)}
          </span>
        </div>

        {/* Right: Real Telemetry & Clock */}
        <div className="flex items-center gap-4 text-xs text-hk-muted">
          <div className="flex items-center gap-1.5 font-mono text-[11px]" title="Real root path on disk">
            <HardDrive size={13} className="text-hk-emerald" />
            <span>Documents/HK OS</span>
          </div>
          <Wifi size={13} className="text-hk-muted" />
          <div className="flex items-center gap-1 text-white font-mono font-medium tabular-nums">
            <Clock size={12} className="text-hk-muted" />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* 2. THE RIBBON — STRIP OF OPEN APPS */}
      <div className="h-9 bg-hk-surface/60 border-b border-hk-border flex items-center px-3 gap-2 overflow-x-auto z-30 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-hk-muted mr-1">Open:</span>
        {windows.map(win => {
          const Icon = ICON_MAP[win.app.icon] || Globe;
          const isActive = activeWindowId === win.id && !win.isMinimized;
          return (
            <div
              key={win.id}
              onClick={() => focusWindow(win.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs cursor-pointer transition-all border shrink-0 ${
                isActive
                  ? 'bg-hk-blue/20 border-hk-blue text-white font-medium shadow-sm'
                  : 'bg-hk-bg border-hk-border text-hk-muted hover:text-white hover:border-white/10'
              }`}
            >
              <Icon size={12} className={isActive ? 'text-hk-blue' : 'text-hk-muted'} />
              <span className="truncate max-w-[130px]">{win.title}</span>

              {/* Quick Snap & Close from Ribbon */}
              <div className="flex items-center gap-1 ml-1" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => snapWindow(win.id, 'left')}
                  className="hover:text-hk-blue text-hk-muted p-0.5"
                  title="Snap Left"
                >
                  <div className="w-2.5 h-2.5 border border-current rounded-xs flex"><div className="w-1.5 h-full bg-current opacity-70" /></div>
                </button>
                <button
                  onClick={() => snapWindow(win.id, 'right')}
                  className="hover:text-hk-blue text-hk-muted p-0.5"
                  title="Snap Right"
                >
                  <div className="w-2.5 h-2.5 border border-current rounded-xs flex justify-end"><div className="w-1.5 h-full bg-current opacity-70" /></div>
                </button>
                <button
                  onClick={() => maximizeWindow(win.id)}
                  className="hover:text-white text-hk-muted p-0.5"
                  title="Maximize"
                >
                  🗖
                </button>
                <button
                  onClick={() => closeWindow(win.id)}
                  className="hover:text-hk-red text-hk-muted p-0.5 ml-0.5"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
        {windows.length === 0 && (
          <span className="text-xs text-hk-muted/60 italic">No windows open. Open an app from the App Shelf.</span>
        )}
      </div>

      {/* 3. APP SHELF LAUNCHER DRAWER */}
      {shelfOpen && (
        <div className="fixed inset-0 top-20 z-50 bg-black/60 backdrop-blur-sm flex justify-center p-8 animate-fadeIn" onClick={() => setShelfOpen(false)}>
          <div
            className="w-full max-w-3xl bg-hk-surface border border-hk-border rounded-2xl shadow-2xl p-6 flex flex-col max-h-[75vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-hk-border mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <LayoutGrid size={18} className="text-hk-emerald" /> Dynamic App Shelf
                </h2>
                <p className="text-xs text-hk-muted">
                  Scanned live from <span className="font-mono text-white">Documents/HK OS/apps/</span> (zero hardcoded apps)
                </p>
              </div>
              <button onClick={() => setShelfOpen(false)} className="p-1 text-hk-muted hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              {['web', 'local', 'native'].map(type => {
                const groupApps = apps.filter(a => a.type === type);
                if (groupApps.length === 0) return null;
                const label = type === 'web' ? 'Web Services' : type === 'local' ? 'Local Learning Tools' : 'Native Programs';
                return (
                  <div key={type}>
                    <h3 className="text-xs uppercase font-bold text-hk-muted tracking-wider mb-3">{label}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupApps.map(app => {
                        const Icon = ICON_MAP[app.icon] || Globe;
                        return (
                          <div
                            key={app.id}
                            onClick={() => handleLaunch(app)}
                            className="p-3.5 rounded-xl border border-hk-border bg-hk-bg hover:border-hk-blue hover:bg-hk-blue/5 cursor-pointer flex flex-col justify-between group transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="w-10 h-10 rounded-xl bg-hk-surface border border-hk-border flex items-center justify-center text-white">
                                <Icon size={20} />
                              </div>
                              <button
                                onClick={e => handleDelete(app.id, e)}
                                className="opacity-0 group-hover:opacity-100 hover:text-hk-red text-hk-muted p-1 transition-opacity"
                                title="Delete app folder from disk"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-white">{app.name}</p>
                              <p className="text-[10px] text-hk-muted truncate font-mono mt-0.5">
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

      {/* 4. MAIN WINDOW CANVAS */}
      <main className="flex-1 relative overflow-hidden bg-hk-bg">
        {/* Background Empty State */}
        {windows.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none">
            <div className="w-16 h-16 rounded-2xl bg-hk-surface border border-hk-border flex items-center justify-center text-hk-emerald mb-4 shadow-xl">
              <span className="font-bold text-2xl">HK</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">HK OS Platform</h1>
            <p className="text-xs text-hk-muted max-w-md text-center leading-relaxed mb-6">
              A dynamic educational computing environment. Every application is a discovered folder on your hard drive.
            </p>
            <div className="flex gap-3 pointer-events-auto">
              <button
                onClick={() => setShelfOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hk-blue text-white text-xs font-semibold hover:bg-hk-blue/90 shadow-lg shadow-hk-blue/20 transition-all"
              >
                <LayoutGrid size={14} /> Open App Shelf
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
