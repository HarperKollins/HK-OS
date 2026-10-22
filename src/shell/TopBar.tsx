import React, { useState, useEffect } from 'react';
import {
  Monitor, Wifi, Battery, Focus, Shield, ChevronDown,
  Info, LayoutGrid, Cpu, User, RotateCcw
} from 'lucide-react';
import { useSystemStore } from '../store/systemStore';
import { useLearningStore } from '../store/learningStore';

const APP_DISPLAY_NAMES: Record<string, string> = {
  hkai: 'HK AI', simulation: 'HK Simulation', docs: 'HK Docs',
  codelab: 'HK Code Lab', schools: 'Digital Schools',
  media: 'Learning Media', store: 'Edu-Store', settings: 'Settings',
};

export const TopBar: React.FC = () => {
  const { activeApp, mode, reboot, endExam, examEndTime } = useSystemStore();
  const { context } = useLearningStore();
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState('');

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Exam countdown
  useEffect(() => {
    if (mode !== 'exam' || !examEndTime) return;
    const t = setInterval(() => {
      const diff = new Date(examEndTime).getTime() - Date.now();
      if (diff <= 0) { endExam(); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setExamTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, [mode, examEndTime, endExam]);

  const activeMilestone = context.roadmap.milestones.find(
    m => m.id === context.activeMilestoneId
  );

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <>
      <div
        className={`
          fixed top-0 left-0 right-0 h-8 z-40 flex items-center px-3 gap-3 text-xs
          border-b border-hk-border select-none
          ${mode === 'exam' ? 'bg-hk-red/20 border-hk-red/50' : 'bg-hk-surface/90 backdrop-blur-sm'}
        `}
      >
        {/* HK OS Menu */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="flex items-center gap-1.5 font-semibold text-white hover:text-hk-emerald transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"
        >
          <div className="w-4 h-4 rounded bg-hk-emerald flex items-center justify-center">
            <span className="text-black font-bold text-[8px]">HK</span>
          </div>
          <span>HK OS</span>
          <ChevronDown size={10} />
        </button>

        {/* Separator */}
        <div className="w-px h-4 bg-hk-border" />

        {/* Active app + learning context */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {activeApp && (
            <span className="text-white font-medium truncate">
              {APP_DISPLAY_NAMES[activeApp] ?? activeApp}
            </span>
          )}
          {activeMilestone && (
            <>
              <span className="text-hk-border">·</span>
              <span className="text-hk-muted truncate hidden sm:block">
                {context.roadmap.subject} · {activeMilestone.title}
              </span>
            </>
          )}
        </div>

        {/* Right side indicators */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Mode indicators */}
          {mode === 'focus' && (
            <div className="flex items-center gap-1 text-hk-blue">
              <Focus size={11} />
              <span className="font-medium">Focus</span>
            </div>
          )}
          {mode === 'exam' && (
            <div className="flex items-center gap-1.5 text-hk-red font-mono font-bold animate-pulse">
              <Shield size={11} />
              <span>EXAM · {examTimeLeft}</span>
            </div>
          )}

          {/* System indicators */}
          <div className="flex items-center gap-2 text-hk-muted">
            <Wifi size={11} />
            <Monitor size={11} />
            <div className="flex items-center gap-0.5">
              <Battery size={11} />
              <span className="text-[10px]">87%</span>
            </div>
          </div>

          {/* Clock */}
          <div className="text-right">
            <div className="text-white font-medium tabular-nums">{formatTime(time)}</div>
          </div>
          <div className="text-hk-muted text-[10px] hidden md:block">{formatDate(time)}</div>
        </div>
      </div>

      {/* System Menu Dropdown */}
      {menuOpen && (
        <SystemMenu onClose={() => setMenuOpen(false)} onReboot={() => { setMenuOpen(false); reboot(); }} />
      )}
    </>
  );
};

interface SystemMenuProps {
  onClose: () => void;
  onReboot: () => void;
}

const SystemMenu: React.FC<SystemMenuProps> = ({ onClose, onReboot }) => {
  const { apps, mode, setMode } = useSystemStore();
  const installedApps = apps.filter(a => a.isInstalled);

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div className="fixed top-8 left-2 z-50 w-72 bg-hk-surface border border-hk-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="px-4 py-3 border-b border-hk-border bg-hk-bg/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-hk-emerald flex items-center justify-center">
              <span className="text-black font-bold text-xs">HK</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">HK OS</p>
              <p className="text-hk-muted text-xs">v0.1.0 Pioneer · Ubuntu 24.04 LTS</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1">
          <MenuSection label="System">
            <MenuItem icon={<Info size={13} />} label="About HK OS" sub="v0.1.0 · Ubuntu 24.04 base" onClick={onClose} />
            <MenuItem icon={<Cpu size={13} />} label="System Information" sub="x86_64 · 4 cores · 8 GB RAM" onClick={onClose} />
            <MenuItem icon={<User size={13} />} label="Session Information" sub="Harper Kollins · Active" onClick={onClose} />
          </MenuSection>

          <MenuSection label="Applications">
            {installedApps.map(app => (
              <MenuItem
                key={app.id}
                icon={<LayoutGrid size={13} />}
                label={app.name}
                sub={app.description}
                onClick={onClose}
              />
            ))}
          </MenuSection>

          <MenuSection label="Mode">
            <MenuItem
              icon={<Focus size={13} />}
              label={mode === 'focus' ? 'Exit Focus Mode' : 'Enter Focus Mode'}
              onClick={() => { setMode(mode === 'focus' ? 'normal' : 'focus'); onClose(); }}
            />
          </MenuSection>

          <div className="border-t border-hk-border mt-1 pt-1">
            <MenuItem
              icon={<RotateCcw size={13} />}
              label="Restart Shell"
              sub="Replays boot sequence"
              onClick={onReboot}
              danger
            />
          </div>
        </div>
      </div>
    </>
  );
};

const MenuSection: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-hk-muted text-[10px] uppercase tracking-widest px-4 py-1.5">{label}</p>
    {children}
  </div>
);

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, label, sub, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-start gap-2.5 px-4 py-2 hover:bg-white/5 transition-colors text-left ${danger ? 'hover:text-hk-red' : ''}`}
  >
    <span className={`mt-0.5 ${danger ? 'text-hk-red' : 'text-hk-muted'}`}>{icon}</span>
    <div>
      <p className={`text-sm font-medium ${danger ? 'text-hk-red' : 'text-white'}`}>{label}</p>
      {sub && <p className="text-hk-muted text-xs mt-0.5">{sub}</p>}
    </div>
  </button>
);
