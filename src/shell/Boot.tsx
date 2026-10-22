import React, { useEffect, useState } from 'react';
import { useSystemStore } from '../store/systemStore';

const BOOT_MESSAGES = [
  { delay: 200,  text: '[  OK  ] Initializing HK OS environment',         color: 'text-hk-emerald' },
  { delay: 600,  text: '[  OK  ] Loading system shell',                    color: 'text-hk-emerald' },
  { delay: 1000, text: '[  OK  ] Mounting local learning workspace',       color: 'text-hk-emerald' },
  { delay: 1400, text: '[  OK  ] Initializing application registry',       color: 'text-hk-emerald' },
  { delay: 1800, text: '[  OK  ] Loading open-source integrations',        color: 'text-hk-emerald' },
  { delay: 2200, text: '[  OK  ] Connecting HK AI services (hkai.site)',   color: 'text-hk-emerald' },
  { delay: 2600, text: '[  OK  ] Loading learner session',                 color: 'text-hk-emerald' },
  { delay: 2900, text: '[  OK  ] Registering activity event system',       color: 'text-hk-emerald' },
  { delay: 3200, text: '[  OK  ] Starting desktop environment',            color: 'text-hk-blue' },
];

export const Boot: React.FC = () => {
  const setBootState = useSystemStore(s => s.setBootState);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_MESSAGES.forEach((msg, i) => {
      timers.push(setTimeout(() => {
        setVisibleMessages(prev => [...prev, i]);
        setProgress(Math.round(((i + 1) / BOOT_MESSAGES.length) * 100));
      }, msg.delay));
    });

    // Enter desktop after boot sequence
    timers.push(setTimeout(() => {
      setBootState('desktop');
    }, 3800));

    return () => timers.forEach(clearTimeout);
  }, [setBootState]);

  return (
    <div className="fixed inset-0 bg-hk-bg flex flex-col items-center justify-center z-50 font-mono">
      {/* Logo */}
      <div className="mb-12 text-center animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-hk-emerald flex items-center justify-center shadow-lg shadow-hk-emerald/30">
            <span className="text-black font-bold text-xl tracking-tight">HK</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide font-sans">HK OS</h1>
            <p className="text-hk-muted text-xs tracking-widest uppercase">v0.1.0 — Pioneer</p>
          </div>
        </div>
      </div>

      {/* Boot log */}
      <div className="w-full max-w-xl px-6 mb-8 min-h-[220px]">
        {BOOT_MESSAGES.map((msg, i) => (
          <div
            key={i}
            className={`text-xs mb-1 transition-all duration-200 ${
              visibleMessages.includes(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <span className={msg.color}>{msg.text}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xl px-6">
        <div className="h-0.5 bg-hk-border rounded-full overflow-hidden">
          <div
            className="h-full bg-hk-emerald transition-all duration-300 ease-out rounded-full shadow-sm shadow-hk-emerald/50"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-hk-muted text-xs">Ubuntu 24.04 LTS</span>
          <span className="text-hk-muted text-xs">{progress}%</span>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-hk-muted text-xs mt-10 tracking-wider uppercase">
        The Learning Operating System
      </p>
    </div>
  );
};
