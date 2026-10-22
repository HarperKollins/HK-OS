import React from 'react';
import { TopBar } from './TopBar';
import { Dock } from './Dock';
import { useSystemStore } from '../store/systemStore';
import { HKAIApp } from '../apps/HKAIApp';
import { SimulationApp } from '../apps/SimulationApp';
import { DocsApp } from '../apps/DocsApp';
import { CodeLabApp } from '../apps/CodeLabApp';
import { SchoolsApp } from '../apps/SchoolsApp';
import { MediaApp } from '../apps/MediaApp';
import { EduStoreApp } from '../apps/EduStoreApp';
import { SettingsApp } from '../apps/SettingsApp';
import { FocusOverlay } from './FocusOverlay';
import { ExamOverlay } from './ExamOverlay';

const APP_COMPONENTS: Record<string, React.FC> = {
  hkai: HKAIApp,
  simulation: SimulationApp,
  docs: DocsApp,
  codelab: CodeLabApp,
  schools: SchoolsApp,
  media: MediaApp,
  store: EduStoreApp,
  settings: SettingsApp,
};

export const Desktop: React.FC = () => {
  const { activeApp, openApps, mode, splitApp } = useSystemStore();

  return (
    <div className="fixed inset-0 bg-hk-bg flex flex-col">
      <TopBar />
      
      {/* Main workspace */}
      <div className="flex-1 mt-8 mb-16 overflow-hidden flex">
        {/* Welcome screen when no app is open */}
        {openApps.length === 0 && (
          <WelcomeScreen />
        )}

        {/* App rendering */}
        {openApps.map(appId => {
          const AppComponent = APP_COMPONENTS[appId];
          if (!AppComponent) return null;
          const isActive = activeApp === appId;
          const isSplit = splitApp === appId;
          const isOnlyApp = openApps.length === 1;

          // Determine visibility: always render for state, show/hide with CSS
          const show = isActive || (isSplit && activeApp !== null);

          return (
            <div
              key={appId}
              className={`
                h-full overflow-hidden transition-all duration-200
                ${isOnlyApp ? 'w-full' : isSplit && activeApp !== appId ? 'w-1/2 border-r border-hk-border' : isActive && splitApp ? 'w-1/2' : 'w-full'}
                ${show ? 'block' : 'hidden'}
              `}
            >
              <AppComponent />
            </div>
          );
        })}
      </div>

      <Dock />

      {/* Mode overlays */}
      {mode === 'focus' && <FocusOverlay />}
      {mode === 'exam' && <ExamOverlay />}
    </div>
  );
};

const WelcomeScreen: React.FC = () => {
  const { openApp } = useSystemStore();
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 animate-fadeIn">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-hk-emerald/10 border border-hk-emerald/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-hk-emerald font-bold text-2xl">HK</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to HK OS</h2>
        <p className="text-hk-muted text-sm max-w-sm">Select an application from the dock below to begin your learning session.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
        {(['hkai', 'simulation', 'docs', 'codelab'] as const).map(id => (
          <button
            key={id}
            onClick={() => openApp(id)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-hk-surface border border-hk-border hover:border-hk-emerald/30 hover:bg-hk-surface/80 transition-all text-xs text-hk-muted hover:text-white"
          >
            <span className="text-lg">
              {id === 'hkai' ? '🧠' : id === 'simulation' ? '⚗️' : id === 'docs' ? '📝' : '💻'}
            </span>
            <span>{id === 'hkai' ? 'HK AI' : id === 'simulation' ? 'Simulation' : id === 'docs' ? 'HK Docs' : 'Code Lab'}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
