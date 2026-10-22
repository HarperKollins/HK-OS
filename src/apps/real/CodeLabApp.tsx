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
    <div className="h-full flex flex-col bg-hk-bg text-white font-sans">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-hk-border bg-hk-surface">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-orange-400" />
          <span className="text-sm font-semibold">Real Code Lab</span>
          <span className="text-xs text-hk-muted">Python 3.11 Subprocess Engine</span>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && <span className="text-xs text-hk-emerald font-mono">{saveStatus}</span>}
          <button
            onClick={() => setCode(STARTER_CODE)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs border border-hk-border rounded text-hk-muted hover:text-white"
          >
            <RotateCcw size={11} /> Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1 text-xs border border-hk-border rounded text-white hover:bg-white/5"
          >
            <Save size={12} /> Save to Projects
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1 text-xs font-semibold rounded bg-hk-blue text-white hover:bg-hk-blue/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Play size={12} fill="white" /> {running ? 'Running...' : 'Run Python'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col border-r border-hk-border">
          <div className="flex flex-1 overflow-hidden">
            {/* Line numbers */}
            <div className="bg-hk-bg/80 border-r border-hk-border px-3 py-4 text-right select-none font-mono text-xs text-hk-muted/40 leading-6">
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
              className="flex-1 bg-transparent text-hk-emerald font-mono text-xs leading-6 p-4 outline-none resize-none caret-white"
              style={{ fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace' }}
            />
          </div>
        </div>

        {/* Real Execution Output Console */}
        <div className="w-80 flex flex-col bg-hk-surface/30">
          <div className="px-3 py-2 border-b border-hk-border bg-hk-surface/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-hk-muted flex items-center gap-1.5">
              <Terminal size={12} /> Subprocess Output
            </span>
            {output && (
              <span className={`text-[10px] font-mono flex items-center gap-1 ${output.success ? 'text-hk-emerald' : 'text-hk-red'}`}>
                {output.success ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                Exit {output.exitCode} ({output.durationMs}ms)
              </span>
            )}
          </div>

          <div className="flex-1 p-3 font-mono text-xs overflow-y-auto leading-relaxed">
            {running && (
              <div className="text-hk-blue animate-pulse flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-hk-blue animate-ping" />
                Spawning python process...
              </div>
            )}
            {output && (
              <div className="space-y-2">
                {output.stdout && (
                  <pre className="text-white whitespace-pre-wrap">{output.stdout}</pre>
                )}
                {output.stderr && (
                  <pre className="text-hk-red whitespace-pre-wrap">{output.stderr}</pre>
                )}
              </div>
            )}
            {!running && !output && (
              <div className="text-hk-muted/60 text-center mt-12">
                Click <span className="text-white">Run Python</span> to execute this script in a real local subprocess.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
