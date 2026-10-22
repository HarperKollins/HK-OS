import React, { useEffect, useState } from 'react';
import { Focus, Clock, X } from 'lucide-react';
import { useSystemStore } from '../store/systemStore';
import { useLearningStore } from '../store/learningStore';

export const FocusOverlay: React.FC = () => {
  const { setMode, focusStartTime } = useSystemStore();
  const { context } = useLearningStore();
  const [elapsed, setElapsed] = useState('0:00');

  useEffect(() => {
    const t = setInterval(() => {
      if (!focusStartTime) return;
      const s = Math.floor((Date.now() - new Date(focusStartTime).getTime()) / 1000);
      setElapsed(`${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, [focusStartTime]);

  const activeMilestone = context.roadmap.milestones.find(m => m.id === context.activeMilestoneId);

  return (
    <div className="fixed bottom-20 left-4 z-30 animate-slideUp">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-hk-blue/10 border border-hk-blue/30 shadow-lg">
        <Focus size={14} className="text-hk-blue" />
        <div>
          <p className="text-xs font-semibold text-hk-blue">Focus Mode</p>
          {activeMilestone && (
            <p className="text-xs text-hk-muted">{activeMilestone.title}</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-hk-muted text-xs font-mono">
          <Clock size={11} />
          <span>{elapsed}</span>
        </div>
        <button
          onClick={() => setMode('normal')}
          className="ml-1 text-hk-muted hover:text-white transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
