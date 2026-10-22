import React, { useState, useRef } from 'react';
import { Code2, Play, Save, RotateCcw, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ExecResult } from '../../types/hkos';

const STARTER_CODE = `# HK Code Lab — Real Python 3 Subprocess Execution
# This code runs directly on your machine via Python 3.11
import math

def calculate_trajectory(v0, theta_deg, g=9.81):
    rad = math.radians(theta_deg)
    # Range: R = v² * sin(2θ) / g
    r = (v0**2 * math.sin(2 * rad)) / g
    # Max Height: H = v² * sin²(θ) / (2g)
    h = (v0**2 * (math.sin(rad)**2)) / (2 * g)
    # Flight Time: T = 2v * sin(θ) / g
    t = (2 * v0 * math.sin(rad)) / g
    return r, h, t

# Parameters
v0 = 50.0       # Initial speed in m/s
theta = 45.0    # Launch angle in degrees
g = 9.81        # Gravity (Earth)

r, h, t = calculate_trajectory(v0, theta, g)

print("=== REAL KINEMATIC SOLVER OUTPUT ===")
print(f"Initial Velocity: {v0} m/s")
print(f"Launch Angle:     {theta}°")
print(f"Gravitational g:  {g} m/s²")
print("------------------------------------")
print(f"Horizontal Range: {r:.2f} meters")
print(f"Maximum Height:   {h:.2f} meters")
print(f"Flight Duration:  {t:.2f} seconds")
print("====================================")
`;

export const CodeLabApp: React.FC = () => {
  const [code, setCode] = useState(STARTER_CODE);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<ExecResult | null>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);

    if (window.hkos?.execRun) {
      const res = await window.hkos.execRun('python', code);
      setOutput(res);
    } else {
      setOutput({
        success: false,
        stdout: '',
        stderr: 'Error: hkos execution bridge not available in pure browser mode. Run via Electron.',
        exitCode: -1,
        durationMs: 0
      });
    }
    setRunning(false);
  };

  const handleSave = async () => {
    setSaveStatus('Saving...');
    if (window.hkos?.fsWrite) {
      const res = await window.hkos.fsWrite('Projects/trajectory_solver.py', code);
      if (res.success) {
        setSaveStatus('Saved to Projects/ ✓');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus(`Error: ${res.error}`);
      }
    }
  };

  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newVal = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newVal);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#000000] text-[#ddffdc] font-['Inter']">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#485346] bg-[#181818]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#212525] border border-[#485346] flex items-center justify-center text-[#7fee64]">
            <Code2 size={14} />
          </div>
          <div>
            <span className="text-xs font-medium text-[#ddffdc] font-['Space_Grotesk']">Python 3 Execution Engine</span>
            <span className="text-[10px] text-[#8cab87] block font-mono">Projects/trajectory_solver.py</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && <span className="text-xs text-[#7fee64] font-mono mr-1">{saveStatus}</span>}
          <button
            onClick={() => setCode(STARTER_CODE)}
            className="flex items-center gap-1 px-3 py-1 text-xs border border-[#485346] rounded-lg text-[#8cab87] hover:text-[#ddffdc] hover:border-[#8cab87] transition-all"
          >
            <RotateCcw size={11} /> Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1 text-xs border border-[#485346] rounded-lg text-[#ddffdc] bg-[#212525] hover:border-[#7fee64] transition-all"
          >
            <Save size={12} /> Save
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-[#7fee64] text-[#000000] hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(127,238,100,0.3)]"
          >
            <Play size={11} fill="#000000" /> {running ? 'Executing...' : 'Run Python'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col border-r border-[#485346]">
          <div className="flex flex-1 overflow-hidden bg-[#000000]">
            {/* Line numbers */}
            <div className="bg-[#181818]/60 border-r border-[#485346] px-3 py-4 text-right select-none font-mono text-xs text-[#485346] leading-6">
              {code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleTabKey}
              spellCheck={false}
              className="flex-1 bg-transparent text-[#ddffdc] font-mono text-xs leading-6 p-4 outline-none resize-none caret-[#7fee64]"
              style={{ fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace' }}
            />
          </div>
        </div>

        {/* Real Execution Output Console */}
        <div className="w-88 flex flex-col bg-[#181818]">
          <div className="px-3.5 py-2.5 border-b border-[#485346] bg-[#212525] flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.05em] font-medium text-[#9cbf93] flex items-center gap-1.5">
              <Terminal size={12} className="text-[#7fee64]" /> Subprocess Console
            </span>
            {output && (
              <span className={`text-[10px] font-mono flex items-center gap-1 ${output.success ? 'text-[#7fee64]' : 'text-[#f87171]'}`}>
                {output.success ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                Exit {output.exitCode} ({output.durationMs}ms)
              </span>
            )}
          </div>

          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto leading-relaxed bg-[#181818]">
            {running && (
              <div className="text-[#7fee64] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7fee64] animate-ping" />
                Spawning python.exe subprocess...
              </div>
            )}
            {output && (
              <div className="space-y-2">
                {output.stdout && (
                  <pre className="text-[#7fee64] whitespace-pre-wrap font-mono leading-5">{output.stdout}</pre>
                )}
                {output.stderr && (
                  <pre className="text-[#f87171] whitespace-pre-wrap font-mono leading-5">{output.stderr}</pre>
                )}
              </div>
            )}
            {!running && !output && (
              <div className="text-[#677d64] text-center mt-12 font-mono text-xs">
                Click <span className="text-[#7fee64]">Run Python</span> to execute script in a host subprocess.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
