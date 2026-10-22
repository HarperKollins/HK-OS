import React, { useState } from 'react';
import {
  Brain, FlaskConical, FileText, Code2, GraduationCap,
  PlayCircle, Store, Settings, type LucideIcon
} from 'lucide-react';
import type { AppId } from '../types/app';
import { useSystemStore } from '../store/systemStore';

const ICON_MAP: Record<AppId, LucideIcon> = {
  hkai: Brain,
  simulation: FlaskConical,
  docs: FileText,
  codelab: Code2,
  schools: GraduationCap,
  media: PlayCircle,
  store: Store,
  settings: Settings,
};

const APP_COLORS: Record<AppId, string> = {
  hkai:       'bg-hk-blue shadow-hk-blue/30',
  simulation: 'bg-purple-600 shadow-purple-600/30',
  docs:       'bg-hk-emerald shadow-hk-emerald/30',
  codelab:    'bg-orange-500 shadow-orange-500/30',
  schools:    'bg-cyan-500 shadow-cyan-500/30',
  media:      'bg-pink-500 shadow-pink-500/30',
  store:      'bg-yellow-500 shadow-yellow-500/30',
  settings:   'bg-hk-muted shadow-gray-500/30',
};

export const Dock: React.FC = () => {
  const { apps, openApps, activeApp, openApp, setActiveApp } = useSystemStore();
  const [hoveredApp, setHoveredApp] = useState<AppId | null>(null);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-end gap-1.5 px-3 py-2 rounded-2xl bg-hk-surface/80 backdrop-blur-md border border-hk-border shadow-2xl shadow-black/60">
      {apps.map(app => {
        const Icon = ICON_MAP[app.id];
        const isOpen = openApps.includes(app.id);
        const isActive = activeApp === app.id;
        const isHovered = hoveredApp === app.id;

        return (
          <div
            key={app.id}
            className="relative flex flex-col items-center"
            onMouseEnter={() => setHoveredApp(app.id)}
            onMouseLeave={() => setHoveredApp(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute bottom-full mb-2 px-2 py-1 bg-hk-bg border border-hk-border rounded-lg text-xs text-white whitespace-nowrap shadow-xl animate-fadeIn pointer-events-none z-50">
                {app.name}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-hk-border" />
              </div>
            )}

            {/* App icon */}
            <button
              onClick={() => {
                if (isOpen && isActive) return;
                if (isOpen) { setActiveApp(app.id); }
                else { openApp(app.id); }
              }}
              className={`
                relative flex items-center justify-center rounded-xl transition-all duration-150
                ${isActive
                  ? `w-12 h-12 ${APP_COLORS[app.id]} shadow-lg scale-105`
                  : isHovered
                    ? `w-12 h-12 ${APP_COLORS[app.id]} shadow-md scale-100 opacity-90`
                    : `w-11 h-11 bg-hk-bg/80 border border-hk-border hover:border-white/10`
                }
              `}
            >
              <Icon
                size={isActive || isHovered ? 20 : 18}
                className={isActive ? 'text-white' : 'text-hk-muted'}
              />
            </button>

            {/* Open indicator dot */}
            <div className={`mt-1 w-1 h-1 rounded-full transition-all duration-150 ${
              isActive ? 'bg-hk-emerald' : isOpen ? 'bg-hk-muted' : 'bg-transparent'
            }`} />
          </div>
        );
      })}
    </div>
  );
};
