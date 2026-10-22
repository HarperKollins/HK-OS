import React, { useRef, useState } from 'react';
import {
  Brain, FileText, Code2, FlaskConical, Folder, Store,
  Terminal, Globe, Minus, Square, Copy, X, Play
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
        width: Math.max(380, dragRef.current.origW + dw),
        height: Math.max(260, dragRef.current.origH + dh)
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
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)'
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
      className={`flex flex-col bg-hk-bg border border-hk-border rounded-xl overflow-hidden transition-all duration-75 select-none ${
        isDragging ? 'opacity-90 cursor-move' : ''
      } ${isResizing ? 'select-none pointer-events-auto' : ''}`}
    >
      {/* Real Window Titlebar */}
      <div
        onMouseDown={handleMouseDownHeader}
        className="h-9 px-3 bg-hk-surface border-b border-hk-border flex items-center justify-between cursor-move shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <IconComponent size={15} className="text-hk-blue shrink-0" />
          <span className="text-xs font-semibold text-white truncate">{win.title}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-hk-bg border border-hk-border text-hk-muted uppercase">
            {win.app.type}
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 shrink-0" onMouseDown={e => e.stopPropagation()}>
          {/* Snap Left */}
          <button
            onClick={() => snapWindow(win.id, 'left')}
            className={`p-1.5 rounded hover:bg-white/10 text-hk-muted hover:text-white transition-colors ${
              win.isSnapped === 'left' ? 'text-hk-blue bg-hk-blue/10' : ''
            }`}
            title="Snap Left (50%)"
          >
            <div className="w-3 h-3 border border-current rounded-sm flex">
              <div className="w-1.5 h-full bg-current opacity-70" />
            </div>
          </button>

          {/* Snap Right */}
          <button
            onClick={() => snapWindow(win.id, 'right')}
            className={`p-1.5 rounded hover:bg-white/10 text-hk-muted hover:text-white transition-colors ${
              win.isSnapped === 'right' ? 'text-hk-blue bg-hk-blue/10' : ''
            }`}
            title="Snap Right (50%)"
          >
            <div className="w-3 h-3 border border-current rounded-sm flex justify-end">
              <div className="w-1.5 h-full bg-current opacity-70" />
            </div>
          </button>

          {/* Minimize */}
          <button
            onClick={() => minimizeWindow(win.id)}
            className="p-1.5 rounded hover:bg-white/10 text-hk-muted hover:text-white transition-colors"
            title="Minimize"
          >
            <Minus size={12} />
          </button>

          {/* Maximize */}
          <button
            onClick={() => maximizeWindow(win.id)}
            className="p-1.5 rounded hover:bg-white/10 text-hk-muted hover:text-white transition-colors"
            title={win.isMaximized ? 'Restore' : 'Maximize'}
          >
            {win.isMaximized ? <Copy size={11} /> : <Square size={11} />}
          </button>

          {/* Close */}
          <button
            onClick={() => closeWindow(win.id)}
            className="p-1.5 rounded hover:bg-hk-red/20 text-hk-muted hover:text-hk-red transition-colors ml-1"
            title="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* App Content Stage */}
      <div className="flex-1 overflow-hidden relative select-text">
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
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-hk-bg">
            <div className="w-16 h-16 rounded-2xl bg-hk-surface border border-hk-border flex items-center justify-center mb-4 text-hk-blue">
              <Terminal size={32} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">{win.app.name}</h3>
            <p className="text-xs text-hk-muted mb-4 font-mono">Native Executable: {win.app.executable}</p>
            <button
              onClick={() => {
                if (win.app.executable && window.hkos?.launchNative) {
                  window.hkos.launchNative(win.app.executable);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hk-blue text-white text-xs font-semibold hover:bg-hk-blue/90 transition-colors shadow-lg shadow-hk-blue/20"
            >
              <Play size={13} fill="white" /> Launch Native Process
            </button>
          </div>
        )}
      </div>

      {/* Resize Handle (Bottom-Right) */}
      {!win.isMaximized && !win.isSnapped && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 flex items-center justify-center text-hk-muted/40 hover:text-white"
        >
          <div className="w-1.5 h-1.5 border-r border-b border-current" />
        </div>
      )}
    </div>
  );
};
