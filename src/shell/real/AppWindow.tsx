import React, { useRef, useState } from 'react';
import {
  Brain, FileText, Code2, FlaskConical, Folder, Store,
  Terminal, Globe, Play
} from 'lucide-react';
import { useWindowStore, type WindowInstance } from '../../store/windowStore';
import { WebAppContainer } from '../../apps/real/WebAppContainer';
import { NotesApp } from '../../apps/real/NotesApp';
import { CodeLabApp } from '../../apps/real/CodeLabApp';
import { SimulationApp } from '../../apps/SimulationApp';
import { FileManagerApp } from '../../apps/real/FileManagerApp';
import { EduStoreApp } from '../../apps/real/EduStoreApp';

const YoutubeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Brain, Youtube: YoutubeIcon, FileText, Code2, FlaskConical, Folder, Store, Terminal, Globe
};

export const AppWindow: React.FC<{ win: WindowInstance }> = ({ win }) => {
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, snapWindow, updateWindowBounds } = useWindowStore();
  const IconComponent = ICON_MAP[win.app.icon] || Globe;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; origW: number; origH: number }>({
    startX: 0, startY: 0, origX: 0, origY: 0, origW: 0, origH: 0
  });

  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (win.isMaximized || win.isSnapped) return;
    focusWindow(win.id);
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: win.x,
      origY: win.y,
      origW: win.width,
      origH: win.height
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      updateWindowBounds(win.id, {
        x: Math.max(0, dragRef.current.origX + dx),
        y: Math.max(0, dragRef.current.origY + dy)
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    focusWindow(win.id);
    setIsResizing(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: win.x,
      origY: win.y,
      origW: win.width,
      origH: win.height
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dw = moveEvent.clientX - dragRef.current.startX;
      const dh = moveEvent.clientY - dragRef.current.startY;
      updateWindowBounds(win.id, {
        width: Math.max(400, dragRef.current.origW + dw),
        height: Math.max(280, dragRef.current.origH + dh)
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (win.isMinimized) return null;

  // Window positioning styles
  let style: React.CSSProperties = {
    position: 'absolute',
    zIndex: win.zIndex,
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px #485346',
  };

  if (win.isMaximized) {
    style = { ...style, top: 0, left: 0, width: '100%', height: '100%', borderRadius: 0 };
  } else if (win.isSnapped === 'left') {
    style = { ...style, top: 0, left: 0, width: '50%', height: '100%', borderRadius: 0 };
  } else if (win.isSnapped === 'right') {
    style = { ...style, top: 0, left: '50%', width: '50%', height: '100%', borderRadius: 0 };
  } else {
    style = { ...style, top: win.y, left: win.x, width: win.width, height: win.height };
  }

  return (
    <div
      style={style}
      onMouseDown={() => focusWindow(win.id)}
      className={`flex flex-col bg-[#181818] border border-[#485346] rounded-xl overflow-hidden transition-all duration-75 select-none ${
        isDragging ? 'opacity-95 cursor-move' : ''
      } ${isResizing ? 'select-none pointer-events-auto' : ''}`}
    >
      {/* Modal Phosphor Window Titlebar */}
      <div
        onMouseDown={handleMouseDownHeader}
        className="h-10 px-3 bg-[#212525] border-b border-[#485346] flex items-center justify-between cursor-move shrink-0"
      >
        {/* Left: Traffic Light Dots + App Identity */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Traffic light control dots */}
          <div className="flex items-center gap-1.5 shrink-0" onMouseDown={e => e.stopPropagation()}>
            <button
              onClick={() => closeWindow(win.id)}
              className="w-3 h-3 rounded-full bg-[#f87171] hover:brightness-125 transition-all flex items-center justify-center group"
              title="Close window"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] text-black font-bold">×</span>
            </button>
            <button
              onClick={() => minimizeWindow(win.id)}
              className="w-3 h-3 rounded-full bg-[#fbbf24] hover:brightness-125 transition-all flex items-center justify-center group"
              title="Minimize window"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] text-black font-bold">−</span>
            </button>
            <button
              onClick={() => maximizeWindow(win.id)}
              className="w-3 h-3 rounded-full bg-[#7fee64] hover:brightness-125 transition-all flex items-center justify-center group"
              title={win.isMaximized ? 'Restore window' : 'Maximize window'}
            >
              <span className="opacity-0 group-hover:opacity-100 text-[7px] text-black font-bold">+</span>
            </button>
          </div>

          <div className="w-px h-3.5 bg-[#485346]" />

          <div className="flex items-center gap-2 truncate">
            <IconComponent size={14} className="text-[#7fee64] shrink-0" />
            <span className="text-xs font-medium text-[#ddffdc] tracking-tight truncate font-['Inter']">
              {win.title}
            </span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-[#485346] text-[#9cbf93] bg-[#181818]">
              {win.app.type}
            </span>
          </div>
        </div>

        {/* Right: Window Snapping Controls */}
        <div className="flex items-center gap-1 shrink-0" onMouseDown={e => e.stopPropagation()}>
          {/* Snap Left */}
          <button
            onClick={() => snapWindow(win.id, 'left')}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition-all ${
              win.isSnapped === 'left'
                ? 'bg-[#7fee64]/10 border-[#7fee64] text-[#7fee64]'
                : 'border-[#485346] text-[#8cab87] hover:text-[#ddffdc] hover:border-[#8cab87]'
            }`}
            title="Snap 50% Left"
          >
            ◧ 50% L
          </button>

          {/* Snap Right */}
          <button
            onClick={() => snapWindow(win.id, 'right')}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition-all ${
              win.isSnapped === 'right'
                ? 'bg-[#7fee64]/10 border-[#7fee64] text-[#7fee64]'
                : 'border-[#485346] text-[#8cab87] hover:text-[#ddffdc] hover:border-[#8cab87]'
            }`}
            title="Snap 50% Right"
          >
            ◨ 50% R
          </button>
        </div>
      </div>

      {/* App Content Stage */}
      <div className="flex-1 overflow-hidden relative select-text bg-[#000000]">
        {win.app.type === 'web' && (
          <WebAppContainer app={win.app} />
        )}

        {win.app.type === 'local' && (
          <>
            {win.app.entry === 'notes' && <NotesApp />}
            {win.app.entry === 'codelab' && <CodeLabApp />}
            {win.app.entry === 'simulation' && <SimulationApp />}
            {win.app.entry === 'files' && <FileManagerApp />}
            {win.app.entry === 'store' && <EduStoreApp />}
          </>
        )}

        {win.app.type === 'native' && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#000000]">
            <div className="w-16 h-16 rounded-xl bg-[#181818] border border-[#485346] flex items-center justify-center mb-4 text-[#7fee64]">
              <Terminal size={30} />
            </div>
            <h3 className="text-base font-medium text-[#ddffdc] mb-1">{win.app.name}</h3>
            <p className="text-xs text-[#8cab87] mb-5 font-mono">
              host binary: <span className="text-[#ddffdc]">{win.app.executable}</span>
            </p>
            <button
              onClick={() => {
                if (win.app.executable && window.hkos?.launchNative) {
                  window.hkos.launchNative(win.app.executable);
                }
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7fee64] text-[#000000] text-xs font-semibold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(127,238,100,0.3)]"
            >
              <Play size={13} fill="#000000" /> Spawn Native Subprocess
            </button>
          </div>
        )}
      </div>

      {/* Resize Handle (Bottom-Right) */}
      {!win.isMaximized && !win.isSnapped && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 flex items-center justify-center text-[#485346] hover:text-[#7fee64]"
        >
          <div className="w-1.5 h-1.5 border-r border-b border-current" />
        </div>
      )}
    </div>
  );
};
