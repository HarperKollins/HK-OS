import React, { useState, useRef } from 'react';
import { Code2, Play, RotateCcw, Copy, CheckCheck, AlertTriangle } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';

const STARTER_CODE = `# HK Code Lab — Projectile Motion Solver
# This script calculates trajectory metrics using physics equations
# Simulated execution environment — not a real Python runtime

import math

# Parameters
v0 = 50      # initial velocity (m/s)
theta = 45   # launch angle (degrees)
g = 9.81     # gravitational acceleration (m/s²)

# Convert angle to radians
theta_rad = math.radians(theta)

# Calculations
range_m    = (v0**2 * math.sin(2 * theta_rad)) / g
max_height = (v0**2 * math.sin(theta_rad)**2) / (2 * g)
flight_t   = (2 * v0 * math.sin(theta_rad)) / g

# Output
print(f"Parameters:")
print(f"  Initial velocity: {v0} m/s")
print(f"  Launch angle:     {theta}°")
print(f"  Gravity:          {g} m/s²")
print()
print(f"Results:")
print(f"  Range:            {range_m:.4f} m")
print(f"  Max height:       {max_height:.4f} m")
print(f"  Flight time:      {flight_t:.4f} s")
`;

function simulatePythonExecution(code: string): { output: string; success: boolean; durationMs: number } {
  const durationMs = 120 + Math.floor(Math.random() * 80);

  // Parse parameters from code
  const v0Match = code.match(/v0\s*=\s*([\d.]+)/);
  const thetaMatch = code.match(/theta\s*=\s*([\d.]+)/);
  const gMatch = code.match(/g\s*=\s*([\d.]+)/);

  const v0 = v0Match ? parseFloat(v0Match[1]) : 50;
  const theta = thetaMatch ? parseFloat(thetaMatch[1]) : 45;
  const g = gMatch ? parseFloat(gMatch[1]) : 9.81;

  if (isNaN(v0) || isNaN(theta) || isNaN(g) || v0 <= 0 || g <= 0 || theta < 0 || theta > 90) {
    return { output: 'ValueError: Invalid parameters. v0 and g must be positive, theta must be 0-90.', success: false, durationMs };
  }

  const thetaRad = (theta * Math.PI) / 180;
  const range = (v0 * v0 * Math.sin(2 * thetaRad)) / g;
  const maxHeight = (v0 * v0 * Math.sin(thetaRad) ** 2) / (2 * g);
  const flightTime = (2 * v0 * Math.sin(thetaRad)) / g;

  const output = [
    'Parameters:',
    `  Initial velocity: ${v0} m/s`,
    `  Launch angle:     ${theta}°`,
    `  Gravity:          ${g} m/s²`,
    '',
    'Results:',
    `  Range:            ${range.toFixed(4)} m`,
    `  Max height:       ${maxHeight.toFixed(4)} m`,
    `  Flight time:      ${flightTime.toFixed(4)} s`,
  ].join('\n');

  return { output, success: true, durationMs };
}

export const CodeLabApp: React.FC = () => {
  const { addEvent } = useActivityStore();
  const [code, setCode] = useState(STARTER_CODE);
  const [output, setOutput] = useState<{ text: string; success: boolean; durationMs: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runCode = () => {
    setRunning(true);
    setOutput(null);
    const result = simulatePythonExecution(code);
    setTimeout(() => {
      setOutput({ text: result.output, success: result.success, durationMs: result.durationMs });
      setRunning(false);
      addEvent('CODE_EXECUTED', 'codelab', {
        language: 'python',
        linesOfCode: code.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length,
        outputLines: result.output.split('\n').length,
        success: result.success,
        simulatedDurationMs: result.durationMs,
      });
    }, result.durationMs);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
    <div className="h-full flex flex-col bg-hk-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-hk-border bg-hk-surface/50">
        <Code2 size={18} className="text-orange-400" />
        <h1 className="text-white font-semibold">HK Code Lab</h1>
        <span className="text-hk-muted text-xs ml-1">Python · Trajectory Solver</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center gap-1">
            <AlertTriangle size={10} /> Simulated execution
          </span>
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-hk-muted hover:text-white transition-colors">
            {copied ? <CheckCheck size={13} className="text-hk-emerald" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col border-r border-hk-border">
          <div className="flex items-center justify-between px-4 py-2 bg-hk-surface/30 border-b border-hk-border">
            <span className="text-hk-muted text-xs font-mono">trajectory_solver.py</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCode(STARTER_CODE)}
                className="flex items-center gap-1 text-xs text-hk-muted hover:text-white transition-colors"
              >
                <RotateCcw size={11} /> Reset
              </button>
              <button
                onClick={runCode}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-hk-blue text-white text-xs font-semibold hover:bg-hk-blue/90 transition-colors disabled:opacity-50"
              >
                <Play size={11} fill="white" />
                {running ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden">
            {/* Line numbers */}
            <div className="bg-hk-bg/50 border-r border-hk-border px-3 py-4 text-right select-none">
              {code.split('\n').map((_, i) => (
                <div key={i} className="text-hk-muted/40 text-xs font-mono leading-6">{i + 1}</div>
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

        {/* Output console */}
        <div className="w-80 flex flex-col">
          <div className="px-4 py-2 border-b border-hk-border bg-hk-surface/30">
            <span className="text-hk-muted text-xs font-mono">output console</span>
          </div>
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
            {running && (
              <div className="text-hk-muted animate-pulse">⟩ Executing...</div>
            )}
            {output && (
              <div className="animate-fadeIn">
                <div className={`mb-2 text-xs ${output.success ? 'text-hk-emerald' : 'text-hk-red'}`}>
                  {output.success ? '✓ Success' : '✗ Error'} · ~{output.durationMs}ms (simulated)
                </div>
                <pre className={`whitespace-pre-wrap leading-5 ${output.success ? 'text-white' : 'text-hk-red'}`}>
                  {output.text}
                </pre>
              </div>
            )}
            {!running && !output && (
              <div className="text-hk-muted">Run code to see output</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
