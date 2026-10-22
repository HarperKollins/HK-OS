import React, { useState, useEffect } from 'react';
import {
  Brain, FileText, Code2, FlaskConical, Folder, Store,
  Terminal, Globe, X, ArrowRight
} from 'lucide-react';
import { useWindowStore } from '../../store/windowStore';
import { useAppDiscoveryStore } from '../../store/appDiscoveryStore';
import { AppWindow } from './AppWindow';

const YoutubeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Brain, Youtube: YoutubeIcon, FileText, Code2, FlaskConical, Folder, Store, Terminal, Globe
};

// Modal 3D Signature Glowing Cube with marketing gradient and bloom
const ModalSignatureCube: React.FC<{ size?: number }> = ({ size = 180 }) => (
  <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
    {/* Emissive radial bloom casting green light onto the void */}
    <div
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{
        background: 'radial-gradient(circle, rgba(127, 238, 100, 0.22) 0%, rgba(24, 183, 89, 0.08) 45%, transparent 75%)',
        filter: 'blur(28px)',
        transform: 'scale(1.4)',
      }}
    />
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className="relative z-10 drop-shadow-[0_0_25px_rgba(127,238,100,0.3)]">
      <defs>
        {/* Marketing Gradient: #80ee64 -> #18b759 -> #09af58 */}
        <linearGradient id="cubeTop" x1="50" y1="20" x2="150" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#80ee64" />
          <stop offset="100%" stopColor="#7fee64" />
        </linearGradient>
        <linearGradient id="cubeLeft" x1="20" y1="80" x2="100" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#18b759" />
          <stop offset="100%" stopColor="#0f823e" />
        </linearGradient>
        <linearGradient id="cubeRight" x1="100" y1="80" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#09af58" />
          <stop offset="100%" stopColor="#066633" />
        </linearGradient>
      </defs>

      {/* Isometric 3D Cube Faces */}
      {/* Top Face */}
      <polygon points="100,30 165,68 100,105 35,68" fill="url(#cubeTop)" stroke="#ddffdc" strokeWidth="0.8" strokeOpacity="0.8" />
      {/* Left Face */}
      <polygon points="35,68 100,105 100,175 35,138" fill="url(#cubeLeft)" stroke="#ddffdc" strokeWidth="0.8" strokeOpacity="0.4" />
      {/* Right Face */}
      <polygon points="100,105 165,68 165,138 100,175" fill="url(#cubeRight)" stroke="#ddffdc" strokeWidth="0.8" strokeOpacity="0.4" />

      {/* Precision Internal Matrix Lines */}
      <line x1="100" y1="105" x2="100" y2="175" stroke="#ddffdc" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="35" y1="68" x2="100" y2="105" stroke="#ddffdc" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="165" y1="68" x2="100" y2="105" stroke="#ddffdc" strokeWidth="1" strokeOpacity="0.6" />

      {/* Wireframe inner geometry */}
      <polygon points="100,55 135,75 100,95 65,75" fill="none" stroke="#ddffdc" strokeWidth="0.7" strokeDasharray="3 3" strokeOpacity="0.5" />
    </svg>
  </div>
);

// Modal 3D Isometric Workload Icons
const IsometricCubeIcon = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
    <polygon points="32,8 54,20 32,32 10,20" fill="none" stroke="#7fee64" strokeWidth="1.5" />
    <polygon points="10,20 32,32 32,56 10,44" fill="none" stroke="#7fee64" strokeWidth="1.5" />
    <polygon points="32,32 54,20 54,44 32,56" fill="none" stroke="#7fee64" strokeWidth="1.5" />
    <line x1="32" y1="32" x2="32" y2="56" stroke="#7fee64" strokeWidth="1.5" />
  </svg>
);

const IsometricStairsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
    <path d="M14 48 L26 48 L26 36 L38 36 L38 24 L50 24 L50 16 L38 16 L38 24 L26 24 L26 36 L14 36 Z" fill="none" stroke="#7fee64" strokeWidth="1.5" />
    <polygon points="14,48 26,48 26,56 14,56" fill="#7fee64" fillOpacity="0.2" stroke="#7fee64" strokeWidth="1" />
    <polygon points="26,36 38,36 38,56 26,56" fill="#7fee64" fillOpacity="0.3" stroke="#7fee64" strokeWidth="1" />
    <polygon points="38,24 50,24 50,56 38,56" fill="#7fee64" fillOpacity="0.4" stroke="#7fee64" strokeWidth="1" />
  </svg>
);

const IsometricLayersIcon = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
    <polygon points="32,12 52,22 32,32 12,22" fill="#7fee64" fillOpacity="0.1" stroke="#7fee64" strokeWidth="1.5" />
    <polygon points="32,24 52,34 32,44 12,34" fill="#7fee64" fillOpacity="0.25" stroke="#7fee64" strokeWidth="1.5" />
    <polygon points="32,36 52,46 32,56 12,46" fill="#7fee64" fillOpacity="0.4" stroke="#7fee64" strokeWidth="1.5" />
  </svg>
);

export const LearningShell: React.FC = () => {
  const { windows, activeWindowId, openWindow, closeWindow, focusWindow } = useWindowStore();
  const { apps, loadApps } = useAppDiscoveryStore();
  const [shelfModalOpen, setShelfModalOpen] = useState(false);

  useEffect(() => {
    loadApps();
  }, []);

  const openAppByName = (id: string) => {
    const app = apps.find(a => a.id === id);
    if (app) openWindow(app);
  };

  return (
    <div className="w-screen h-screen overflow-x-hidden overflow-y-auto bg-[#000000] text-[#ddffdc] font-['Inter'] selection:bg-[#7fee64]/20 selection:text-[#ddffdc]">
      {/* ============================================================== */}
      {/* 1. MODAL NAVIGATION BAR (Fixed top, 64px, 24px pad, Carbon Veil) */}
      {/* ============================================================== */}
      <nav
        className="fixed top-0 left-0 right-0 h-16 bg-[#212525]/90 backdrop-blur-[10px] border-b border-[#1f2a33] px-6 flex items-center justify-between z-50 select-none"
        style={{
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px',
        }}
      >
        {/* Left: Logo (green 3D mark + 'HK OS' in Goga 20px weight 500, #ddffdc) */}
        <div className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
            <polygon points="50,15 85,35 50,55 15,35" fill="#7fee64" />
            <polygon points="15,35 50,55 50,90 15,70" fill="#18b759" />
            <polygon points="50,55 85,35 85,70 50,90" fill="#09af58" />
          </svg>
          <span
            className="font-['Space_Grotesk'] font-medium text-[20px] text-[#ddffdc] tracking-[-0.018em]"
          >
            HK OS
          </span>
        </div>

        {/* Center: Nav links (Inter 14px weight 500, #ddffdc, 32px gap) */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => setShelfModalOpen(true)}
            className="text-sm font-medium text-[#ddffdc] hover:text-[#7fee64] transition-colors duration-300"
          >
            Platform
          </button>
          <button
            onClick={() => openAppByName('codelab')}
            className="text-sm font-medium text-[#ddffdc] hover:text-[#7fee64] transition-colors duration-300"
          >
            Code Lab
          </button>
          <button
            onClick={() => openAppByName('simulation')}
            className="text-sm font-medium text-[#ddffdc] hover:text-[#7fee64] transition-colors duration-300"
          >
            Simulation
          </button>
          <button
            onClick={() => openAppByName('notes')}
            className="text-sm font-medium text-[#ddffdc] hover:text-[#7fee64] transition-colors duration-300"
          >
            Notes
          </button>
          <button
            onClick={() => openAppByName('files')}
            className="text-sm font-medium text-[#ddffdc] hover:text-[#7fee64] transition-colors duration-300"
          >
            Files
          </button>
          <button
            onClick={() => openAppByName('store')}
            className="text-sm font-medium text-[#ddffdc] hover:text-[#7fee64] transition-colors duration-300"
          >
            Edu-Store
          </button>
        </div>

        {/* Right: Fern Link + Lime Accent Pill Button (8px 16px padding, 9999px radius) */}
        <div className="flex items-center gap-5">
          <span className="hidden sm:inline text-xs font-mono text-[#859984] tracking-tight">
            Documents/HK OS
          </span>
          <button
            onClick={() => setShelfModalOpen(true)}
            className="h-8 px-4 rounded-full bg-[#7fee64] text-[#181818] text-sm font-medium tracking-tight hover:brightness-110 transition-all duration-300"
            style={{ borderRadius: '9999px' }}
          >
            App Shelf
          </button>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* ACTIVE WINDOWS BAR (When windows are open)                     */}
      {/* ============================================================== */}
      {windows.length > 0 && (
        <div className="fixed top-16 left-0 right-0 h-10 bg-[#181818] border-b border-[#1f2a33] px-6 flex items-center gap-3 z-40 overflow-x-auto select-none">
          <span className="text-[11px] uppercase tracking-[0.05em] text-[#9cbf93] font-medium shrink-0">
            ACTIVE WINDOWS
          </span>
          <div className="w-px h-3.5 bg-[#485346]" />
          {windows.map(win => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <div
                key={win.id}
                onClick={() => focusWindow(win.id)}
                className={`h-7 px-3 rounded-full flex items-center gap-2 cursor-pointer transition-all border text-xs font-medium shrink-0 ${
                  isActive
                    ? 'bg-[#212525] border-[#7fee64] text-[#ddffdc]'
                    : 'bg-[#181818] border-[#485346] text-[#8cab87] hover:border-[#8cab87] hover:text-[#ddffdc]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#7fee64]' : 'bg-[#485346]'}`} />
                <span>{win.title}</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    closeWindow(win.id);
                  }}
                  className="hover:text-[#f87171] text-[#677d64] pl-1 font-bold"
                  title="Close"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MODAL HERO SECTION (Full-bleed #000000, centered stack)     */}
      {/* ============================================================== */}
      <section className={`pt-32 pb-20 px-6 max-w-[1280px] mx-auto flex flex-col items-center text-center ${windows.length > 0 ? 'mt-8' : ''}`}>
        {/* Eyebrow Label: Inter 12px weight 500, uppercase, +0.05em, Moss 70 */}
        <p className="text-[12px] font-medium uppercase tracking-[0.6px] text-[#9cbf93] mb-3">
          EDUCATIONAL COMPUTING PLATFORM
        </p>

        {/* Headline: Goga 64px weight 500, lh 1.0, tracking -0.448px */}
        <h1 className="font-['Space_Grotesk'] font-medium text-[42px] sm:text-[54px] md:text-[64px] leading-[1.0] tracking-[-0.448px] text-[#ddffdc] max-w-4xl mb-6">
          <span className="text-[#7fee64]">The Learning</span> Operating System
        </h1>

        {/* Subhead: Inter 20px weight 400, #aed2a4 (Moss 80), max-width 640px */}
        <p className="text-[18px] sm:text-[20px] font-normal leading-[1.5] tracking-[-0.018em] text-[#aed2a4] max-w-[640px] mb-10">
          An autonomous computing environment dedicated to learning. Every application is a directory discovered directly on your physical disk.
        </p>

        {/* Dual CTA Buttons (Side-by-side, 12px gap) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {/* Lime Accent Pill Button: #7fee64 bg, #181818 text, 9999px radius, 16px 24px pad, Inter 16px weight 500 */}
          <button
            onClick={() => setShelfModalOpen(true)}
            className="px-6 py-4 rounded-full bg-[#7fee64] text-[#181818] text-base font-medium tracking-[-0.352px] hover:brightness-110 transition-all duration-300"
            style={{ borderRadius: '9999px' }}
          >
            Explore Applications
          </button>

          {/* Ghost Outline Button: transparent bg, 1px #ddffdc border, #ddffdc text, 12px radius, 16px 32px pad */}
          <button
            onClick={() => openAppByName('codelab')}
            className="px-8 py-4 rounded-xl border border-[#ddffdc] bg-transparent text-[#ddffdc] text-base font-medium tracking-[-0.352px] hover:bg-[#ddffdc]/5 transition-all duration-300"
            style={{ borderRadius: '12px' }}
          >
            Launch Code Lab
          </button>
        </div>

        {/* Centered 3D glowing cube with radial green bloom onto void */}
        <ModalSignatureCube size={200} />
      </section>

      {/* ============================================================== */}
      {/* 3. SECTION DIVIDER (1px horizontal in #1f2a33)                  */}
      {/* ============================================================== */}
      <div className="max-w-[1280px] mx-auto px-6 mb-20">
        <div className="w-full h-px bg-[#1f2a33]" />
      </div>

      {/* ============================================================== */}
      {/* 4. CODE WINDOW CARD SECTION (Example component 2 in reference)  */}
      {/* ============================================================== */}
      <section className="max-w-[1280px] mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 text-left">
            <p className="text-[12px] font-medium uppercase tracking-[0.6px] text-[#9cbf93] mb-3">
              REAL KERNEL & SUBPROCESSES
            </p>
            <h2 className="font-['Space_Grotesk'] font-medium text-[36px] sm:text-[42px] leading-[1.05] tracking-[-0.336px] text-[#ddffdc] mb-4">
              Real Python Execution on Host
            </h2>
            <p className="text-base text-[#8cab87] leading-[1.5] tracking-[-0.352px] mb-6">
              Code Lab does not simulate execution. Scripts are spawned as actual Python 3 subprocesses on your host machine with real exit codes and real standard output.
            </p>
            <button
              onClick={() => openAppByName('codelab')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#485346] bg-[#181818] text-[#ddffdc] text-sm font-medium hover:border-[#ddffdc] transition-all"
            >
              Open Interactive Terminal <ArrowRight size={14} className="text-[#7fee64]" />
            </button>
          </div>

          {/* Code Window Card: 16px radius, #181818 bg, 1px solid #485346 border */}
          <div className="lg:col-span-7">
            <div
              className="rounded-2xl bg-[#181818] border border-[#485346] overflow-hidden text-left"
              style={{ borderRadius: '16px' }}
            >
              {/* Top bar: 3 traffic-light dots + right-aligned title in #9cbf93 at 12px Inter */}
              <div className="h-10 px-4 bg-[#212525] border-b border-[#485346] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[12px] font-medium text-[#9cbf93] font-['Inter']">
                  trajectory_solver.py
                </span>
              </div>

              {/* Content area: 24px padding, monospace text at 14px, line-height 1.5 */}
              <div className="p-6 font-mono text-[14px] leading-[1.5] overflow-x-auto bg-[#181818]">
                <div className="text-[#677d64]"># Kinematic equations executed via host Python subprocess</div>
                <div><span className="text-[#7fee64]">import</span> <span className="text-[#ddffdc]">math</span></div>
                <div className="h-2" />
                <div><span className="text-[#7fee64]">def</span> <span className="text-[#ddffdc]">compute_trajectory</span>(v0, theta, g=9.81):</div>
                <div className="pl-6 text-[#8cab87]">rad = math.radians(theta)</div>
                <div className="pl-6 text-[#8cab87]">range_m = (v0**2 * math.sin(2 * rad)) / g</div>
                <div className="pl-6"><span className="text-[#7fee64]">return</span> range_m</div>
                <div className="h-2" />
                <div className="text-[#677d64]"># Output verified: Range = 254.84 meters</div>
                <div><span className="text-[#7fee64]">print</span>(<span className="text-[#ddffdc]">f"Trajectory Range: {"{"}compute_trajectory(50.0, 45.0){":.2f"} m"</span>)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. WORKLOAD CARDS SECTION (3-Column Grid with 20px gap)        */}
      {/* ============================================================== */}
      <section className="max-w-[1280px] mx-auto px-6 mb-28 text-left">
        <p className="text-[12px] font-medium uppercase tracking-[0.6px] text-[#9cbf93] mb-3">
          SYSTEM WORKLOADS
        </p>
        <h2 className="font-['Space_Grotesk'] font-medium text-[36px] sm:text-[42px] leading-[1.05] tracking-[-0.336px] text-[#ddffdc] mb-4">
          Autonomous Learning Applications
        </h2>
        <p className="text-base text-[#8cab87] max-w-2xl leading-[1.5] tracking-[-0.352px] mb-12">
          Each workload is packaged as an autonomous folder on disk with its own manifest and entry point.
        </p>

        {/* 3-Column Workload Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Workload Card 1: Code Lab */}
          <div
            onClick={() => openAppByName('codelab')}
            className="p-8 rounded-lg bg-[#1f2a33] border border-[#485346] hover:border-[#7fee64] cursor-pointer transition-all duration-300 flex flex-col justify-between"
            style={{ borderRadius: '8px' }}
          >
            <div>
              <div className="mb-6"><IsometricCubeIcon /></div>
              <h3 className="font-['Space_Grotesk'] font-normal text-[24px] text-[#ddffdc] mb-2">
                HK Code Lab
              </h3>
              <p className="text-base text-[#8cab87] leading-[1.5] tracking-[-0.352px]">
                Direct Python 3.11 code execution environment with live standard input/output streaming.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#485346]/40 flex items-center justify-between">
              <span className="text-xs font-mono text-[#9cbf93]">LOCAL SUBPROCESS</span>
              <span className="text-xs text-[#7fee64] font-medium inline-flex items-center gap-1">Open ↗</span>
            </div>
          </div>

          {/* Workload Card 2: Simulation */}
          <div
            onClick={() => openAppByName('simulation')}
            className="p-8 rounded-lg bg-[#1f2a33] border border-[#485346] hover:border-[#7fee64] cursor-pointer transition-all duration-300 flex flex-col justify-between"
            style={{ borderRadius: '8px' }}
          >
            <div>
              <div className="mb-6"><IsometricStairsIcon /></div>
              <h3 className="font-['Space_Grotesk'] font-normal text-[24px] text-[#ddffdc] mb-2">
                HK Simulation
              </h3>
              <p className="text-base text-[#8cab87] leading-[1.5] tracking-[-0.352px]">
                HTML5 Canvas projectile physics with continuous gravity sweeps across Earth, Moon, and Mars.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#485346]/40 flex items-center justify-between">
              <span className="text-xs font-mono text-[#9cbf93]">EMISSIVE CANVAS</span>
              <span className="text-xs text-[#7fee64] font-medium inline-flex items-center gap-1">Open ↗</span>
            </div>
          </div>

          {/* Workload Card 3: Notes & Markdown */}
          <div
            onClick={() => openAppByName('notes')}
            className="p-8 rounded-lg bg-[#1f2a33] border border-[#485346] hover:border-[#7fee64] cursor-pointer transition-all duration-300 flex flex-col justify-between"
            style={{ borderRadius: '8px' }}
          >
            <div>
              <div className="mb-6"><IsometricLayersIcon /></div>
              <h3 className="font-['Space_Grotesk'] font-normal text-[24px] text-[#ddffdc] mb-2">
                HK Notes
              </h3>
              <p className="text-base text-[#8cab87] leading-[1.5] tracking-[-0.352px]">
                Markdown note-taking tool that reads and persists real .md files on your local hard drive.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#485346]/40 flex items-center justify-between">
              <span className="text-xs font-mono text-[#9cbf93]">REAL DISK PERSISTENCE</span>
              <span className="text-xs text-[#7fee64] font-medium inline-flex items-center gap-1">Open ↗</span>
            </div>
          </div>

          {/* Workload Card 4: Files */}
          <div
            onClick={() => openAppByName('files')}
            className="p-8 rounded-lg bg-[#1f2a33] border border-[#485346] hover:border-[#7fee64] cursor-pointer transition-all duration-300 flex flex-col justify-between"
            style={{ borderRadius: '8px' }}
          >
            <div>
              <div className="mb-6">
                <Folder size={44} className="text-[#7fee64]" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-normal text-[24px] text-[#ddffdc] mb-2">
                File Explorer
              </h3>
              <p className="text-base text-[#8cab87] leading-[1.5] tracking-[-0.352px]">
                Direct file system manager for Documents/HK OS directories, notes, code, and project files.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#485346]/40 flex items-center justify-between">
              <span className="text-xs font-mono text-[#9cbf93]">HOST FS ACCESS</span>
              <span className="text-xs text-[#7fee64] font-medium inline-flex items-center gap-1">Open ↗</span>
            </div>
          </div>

          {/* Workload Card 5: Edu-Store */}
          <div
            onClick={() => openAppByName('store')}
            className="p-8 rounded-lg bg-[#1f2a33] border border-[#485346] hover:border-[#7fee64] cursor-pointer transition-all duration-300 flex flex-col justify-between"
            style={{ borderRadius: '8px' }}
          >
            <div>
              <div className="mb-6">
                <Store size={44} className="text-[#7fee64]" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-normal text-[24px] text-[#ddffdc] mb-2">
                Edu-Store
              </h3>
              <p className="text-base text-[#8cab87] leading-[1.5] tracking-[-0.352px]">
                Installer engine supporting web manifest addition and real Windows software installs via winget.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#485346]/40 flex items-center justify-between">
              <span className="text-xs font-mono text-[#9cbf93]">WINGET & MANIFESTS</span>
              <span className="text-xs text-[#7fee64] font-medium inline-flex items-center gap-1">Open ↗</span>
            </div>
          </div>

          {/* Workload Card 6: HK AI */}
          <div
            onClick={() => openAppByName('hk-ai')}
            className="p-8 rounded-lg bg-[#1f2a33] border border-[#485346] hover:border-[#7fee64] cursor-pointer transition-all duration-300 flex flex-col justify-between"
            style={{ borderRadius: '8px' }}
          >
            <div>
              <div className="mb-6">
                <Brain size={44} className="text-[#7fee64]" />
              </div>
              <h3 className="font-['Space_Grotesk'] font-normal text-[24px] text-[#ddffdc] mb-2">
                HK AI
              </h3>
              <p className="text-base text-[#8cab87] leading-[1.5] tracking-[-0.352px]">
                Isolated web application session container connected to the hkai.site learning platform.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#485346]/40 flex items-center justify-between">
              <span className="text-xs font-mono text-[#9cbf93]">PARTITIONED WEBVIEW</span>
              <span className="text-xs text-[#7fee64] font-medium inline-flex items-center gap-1">Open ↗</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. ECOSYSTEM LOGO STRIP (Desaturated green-gray Deep Fern)     */}
      {/* ============================================================== */}
      <section className="max-w-[1280px] mx-auto px-6 mb-28 text-center">
        <p className="text-[12px] font-medium uppercase tracking-[0.6px] text-[#697368] mb-8">
          REAL OPEN-SOURCE ENGINE & SYSTEM INTEGRATIONS
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm font-mono text-[#697368]">
          <span>PYTHON 3.11</span>
          <span>UBUNTU 24.04 LTS</span>
          <span>MICROSOFT WINGET</span>
          <span>NODE.JS 24 FS</span>
          <span>ELECTRON RUNTIME</span>
          <span>VSCODIUM</span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. APP SHELF MODAL (Workload Grid Modal)                       */}
      {/* ============================================================== */}
      {shelfModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[10px] flex items-center justify-center p-6"
          onClick={() => setShelfModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-[#181818] border border-[#485346] rounded-xl p-8 max-h-[85vh] overflow-y-auto"
            style={{ borderRadius: '12px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#485346] mb-6">
              <div>
                <p className="text-[12px] uppercase tracking-[0.6px] text-[#9cbf93] font-medium mb-1">
                  APP SHELF // ZERO HARDCODED REGISTRY
                </p>
                <h3 className="font-['Space_Grotesk'] text-[24px] text-[#ddffdc] font-medium">
                  Installed Applications on Disk
                </h3>
              </div>
              <button
                onClick={() => setShelfModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#485346] flex items-center justify-center text-[#8cab87] hover:border-[#7fee64] hover:text-[#ddffdc]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {apps.map(app => {
                const Icon = ICON_MAP[app.icon] || Globe;
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      openWindow(app);
                      setShelfModalOpen(false);
                    }}
                    className="p-5 rounded-lg border border-[#485346] bg-[#212525] hover:border-[#7fee64] cursor-pointer flex flex-col justify-between transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded bg-[#181818] border border-[#485346] flex items-center justify-center text-[#7fee64]">
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-mono uppercase text-[#9cbf93] px-2 py-0.5 rounded border border-[#485346] bg-[#181818]">
                        {app.type}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-['Space_Grotesk'] text-sm font-medium text-[#ddffdc]">{app.name}</h4>
                      <p className="text-xs text-[#8cab87] font-mono truncate mt-1">
                        {app.type === 'web' ? app.url : app.type === 'native' ? app.executable : app.entry}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. ACTIVE RUNNING WINDOWS (Modal Code Window Card Format)       */}
      {/* ============================================================== */}
      {windows.map(win => (
        <AppWindow key={win.id} win={win} />
      ))}
    </div>
  );
};
