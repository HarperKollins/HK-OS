import React, { useState } from 'react';
import { Settings, User, Shield, Database, Info, Focus, Clock } from 'lucide-react';
import { useSystemStore } from '../store/systemStore';
import { useLearningStore } from '../store/learningStore';
import { useActivityStore } from '../store/activityStore';

export const SettingsApp: React.FC = () => {
  const { mode, setMode, startExam } = useSystemStore();
  const { context, updateLearnerName } = useLearningStore();
  const { clearEvents } = useActivityStore();
  const [name, setName] = useState(context.learnerName);
  const [examDuration, setExamDuration] = useState(30);
  const [cleared, setCleared] = useState(false);

  const handleClearData = () => {
    clearEvents();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-hk-bg">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-hk-border bg-hk-surface/50">
        <Settings size={18} className="text-hk-muted" />
        <h1 className="text-white font-semibold">Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-6">
        {/* Profile */}
        <Section icon={<User size={14} />} title="Learner Profile">
          <div className="flex items-center gap-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 bg-hk-bg border border-hk-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-hk-blue transition-colors"
              placeholder="Your name"
            />
            <button
              onClick={() => updateLearnerName(name)}
              className="px-4 py-2 rounded-lg bg-hk-blue text-white text-sm font-medium hover:bg-hk-blue/90 transition-colors"
            >
              Save
            </button>
          </div>
          <p className="text-hk-muted text-xs mt-1">Enrolled schools: {context.enrolledSchools.length}</p>
        </Section>

        {/* Focus & Exam Mode */}
        <Section icon={<Focus size={14} />} title="Focus & Exam Mode">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Focus Mode</p>
              <p className="text-hk-muted text-xs">Reduces distractions, shows active objective and session timer</p>
            </div>
            <button
              onClick={() => setMode(mode === 'focus' ? 'normal' : 'focus')}
              className={`w-10 h-5 rounded-full transition-colors ${
                mode === 'focus' ? 'bg-hk-blue' : 'bg-hk-border'
              } relative`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                mode === 'focus' ? 'left-5' : 'left-0.5'
              }`} />
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-hk-border">
            <p className="text-white text-sm mb-2">Start Exam Mode</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-hk-muted" />
                <select
                  value={examDuration}
                  onChange={e => setExamDuration(Number(e.target.value))}
                  className="bg-hk-bg border border-hk-border rounded-lg px-2 py-1.5 text-sm text-white outline-none"
                >
                  {[15, 20, 30, 45, 60, 90].map(d => (
                    <option key={d} value={d}>{d} minutes</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => startExam(examDuration)}
                className="px-4 py-1.5 rounded-lg bg-hk-red text-white text-sm font-medium hover:bg-hk-red/90 transition-colors flex items-center gap-1.5"
              >
                <Shield size={12} /> Start Exam
              </button>
            </div>
            <p className="text-hk-muted text-xs mt-2">UI-level restriction only. Does not enforce OS-level lockdown.</p>
          </div>
        </Section>

        {/* Data */}
        <Section icon={<Database size={14} />} title="Data & Privacy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Clear Activity Log</p>
              <p className="text-hk-muted text-xs">Removes all recorded activity events from this device</p>
            </div>
            <button
              onClick={handleClearData}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                cleared ? 'bg-hk-emerald/10 text-hk-emerald border border-hk-emerald/20' : 'border border-hk-red/30 text-hk-red hover:bg-hk-red/5'
              }`}
            >
              {cleared ? 'Cleared ✓' : 'Clear'}
            </button>
          </div>
          <p className="text-hk-muted text-xs mt-3">Notes and progress are stored locally in your browser (localStorage). Cloud sync is not yet active.</p>
        </Section>

        {/* About */}
        <Section icon={<Info size={14} />} title="About HK OS">
          <div className="space-y-1 text-sm">
            <Row label="Version" value="0.1.0 Pioneer" />
            <Row label="Base" value="Ubuntu 24.04 LTS" />
            <Row label="Desktop App" value="Electron (Windows)" />
            <Row label="Build" value="github.com/HarperKollins/HK-OS" />
            <Row label="HK AI" value="hkai.site" />
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section: React.FC<{icon: React.ReactNode; title: string; children: React.ReactNode}> = ({icon, title, children}) => (
  <div className="bg-hk-surface border border-hk-border rounded-xl p-5">
    <h3 className="text-white font-medium text-sm flex items-center gap-2 mb-4">
      <span className="text-hk-muted">{icon}</span> {title}
    </h3>
    {children}
  </div>
);

const Row: React.FC<{label: string; value: string}> = ({label, value}) => (
  <div className="flex justify-between">
    <span className="text-hk-muted">{label}</span>
    <span className="text-white font-mono text-xs">{value}</span>
  </div>
);
