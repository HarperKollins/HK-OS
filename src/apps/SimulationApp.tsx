import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FlaskConical, Play, RotateCcw, ChevronDown } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';

const GRAVITY_OPTIONS = [
  { label: 'Earth', value: 9.81, icon: '🌍' },
  { label: 'Moon', value: 1.62, icon: '🌕' },
  { label: 'Mars', value: 3.72, icon: '🔴' },
];

interface TrajectoryPoint { x: number; y: number; }

function computeTrajectory(v: number, angleDeg: number, g: number, steps = 300): TrajectoryPoint[] {
  const theta = (angleDeg * Math.PI) / 180;
  const T = (2 * v * Math.sin(theta)) / g;
  const points: TrajectoryPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * T;
    points.push({
      x: v * Math.cos(theta) * t,
      y: v * Math.sin(theta) * t - 0.5 * g * t * t,
    });
  }
  return points;
}

export const SimulationApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { addEvent } = useActivityStore();

  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(50);
  const [gravityIdx, setGravityIdx] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [gravityMenuOpen, setGravityMenuOpen] = useState(false);
  const animFrameRef = useRef<number>(0);

  const gravity = GRAVITY_OPTIONS[gravityIdx];
  const theta = (angle * Math.PI) / 180;
  const g = gravity.value;
  const range = (velocity * velocity * Math.sin(2 * theta)) / g;
  const maxHeight = (velocity * velocity * Math.sin(theta) * Math.sin(theta)) / (2 * g);
  const flightTime = (2 * velocity * Math.sin(theta)) / g;

  const drawTrajectory = useCallback((progress = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD = 40;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 0.5;
    for (let x = PAD; x <= W - PAD; x += (W - 2 * PAD) / 8) {
      ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, H - PAD); ctx.stroke();
    }
    for (let y = PAD; y <= H - PAD; y += (H - 2 * PAD) / 5) {
      ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, H - PAD);
    ctx.lineTo(W - PAD, H - PAD);
    ctx.moveTo(PAD, PAD);
    ctx.lineTo(PAD, H - PAD);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('Horizontal (m)', W / 2 - 30, H - 8);
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Height (m)', -20, 0);
    ctx.restore();

    if (!hasRun) return;

    const points = computeTrajectory(velocity, angle, g);
    const scaleX = (W - 2 * PAD) / Math.max(range, 1);
    const scaleY = (H - 2 * PAD) / Math.max(maxHeight * 1.2, 1);
    const scale = Math.min(scaleX, scaleY);

    const toCanvasX = (x: number) => PAD + x * scale;
    const toCanvasY = (y: number) => H - PAD - y * scale;

    const visibleCount = Math.floor(points.length * progress);

    // Trajectory path
    ctx.beginPath();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#3B82F6';
    ctx.shadowBlur = 4;
    for (let i = 0; i < visibleCount; i++) {
      const p = points[i];
      if (i === 0) ctx.moveTo(toCanvasX(p.x), toCanvasY(p.y));
      else ctx.lineTo(toCanvasX(p.x), toCanvasY(p.y));
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Max height indicator
    if (progress >= 0.5) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD, toCanvasY(maxHeight));
      ctx.lineTo(toCanvasX(range / 2), toCanvasY(maxHeight));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#10B981';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`H=${maxHeight.toFixed(1)}m`, PAD + 4, toCanvasY(maxHeight) - 4);
    }

    // Range indicator
    if (progress >= 0.99) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(range), H - PAD);
      ctx.lineTo(toCanvasX(range), toCanvasY(0));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#EF4444';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`R=${range.toFixed(1)}m`, toCanvasX(range) + 4, H - PAD - 4);
    }

    // Projectile ball
    if (visibleCount > 0) {
      const last = points[visibleCount - 1];
      ctx.beginPath();
      ctx.arc(toCanvasX(last.x), toCanvasY(last.y), 5, 0, Math.PI * 2);
      ctx.fillStyle = '#3B82F6';
      ctx.shadowColor = '#3B82F6';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Launch angle arc
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(PAD, H - PAD, 20, -theta, 0, false);
    ctx.stroke();
  }, [angle, velocity, g, range, maxHeight, hasRun]);

  useEffect(() => { drawTrajectory(); }, [drawTrajectory]);

  const handleFire = () => {
    setHasRun(true);
    setAnimating(true);
    cancelAnimationFrame(animFrameRef.current);
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      drawTrajectory(progress);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setAnimating(false);
        addEvent('SIMULATION_RUN', 'simulation', {
          angle, velocity, gravity: g, gravityLabel: gravity.label,
          range: parseFloat(range.toFixed(2)),
          maxHeight: parseFloat(maxHeight.toFixed(2)),
          flightTime: parseFloat(flightTime.toFixed(2)),
        });
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleReset = () => {
    setHasRun(false);
    cancelAnimationFrame(animFrameRef.current);
    setAnimating(false);
    drawTrajectory(0);
  };

  return (
    <div className="h-full flex flex-col bg-hk-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-hk-border bg-hk-surface/50">
        <FlaskConical size={18} className="text-purple-400" />
        <h1 className="text-white font-semibold">HK Simulation — Projectile Motion</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Controls panel */}
        <div className="w-64 shrink-0 border-r border-hk-border bg-hk-surface/30 p-4 flex flex-col gap-4 overflow-y-auto">
          <SliderControl
            label="Launch Angle"
            value={angle}
            min={15} max={85} step={1}
            unit="°"
            onChange={setAngle}
          />
          <SliderControl
            label="Initial Velocity"
            value={velocity}
            min={10} max={100} step={1}
            unit=" m/s"
            onChange={setVelocity}
          />

          {/* Gravity selector */}
          <div>
            <label className="block text-hk-muted text-xs mb-2">Gravity</label>
            <div className="relative">
              <button
                onClick={() => setGravityMenuOpen(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-hk-bg border border-hk-border text-sm text-white"
              >
                <span>{gravity.icon} {gravity.label} ({gravity.value} m/s²)</span>
                <ChevronDown size={12} className="text-hk-muted" />
              </button>
              {gravityMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-hk-surface border border-hk-border rounded-lg overflow-hidden z-10 shadow-xl">
                  {GRAVITY_OPTIONS.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => { setGravityIdx(i); setGravityMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-hk-bg transition-colors ${
                        i === gravityIdx ? 'text-hk-blue' : 'text-white'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label} ({opt.value} m/s²)</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fire / Reset */}
          <button
            onClick={handleFire}
            disabled={animating}
            className="w-full py-2.5 rounded-xl bg-hk-blue text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-hk-blue/90 transition-colors disabled:opacity-50"
          >
            <Play size={14} fill="white" />
            {animating ? 'Firing...' : 'Fire Projectile'}
          </button>
          <button
            onClick={handleReset}
            className="w-full py-2 rounded-xl border border-hk-border text-hk-muted text-sm flex items-center justify-center gap-2 hover:text-white hover:border-hk-border/80 transition-colors"
          >
            <RotateCcw size={13} /> Reset
          </button>

          {/* Results */}
          {hasRun && (
            <div className="mt-2 space-y-2">
              <p className="text-hk-muted text-xs font-semibold uppercase tracking-wide">Results</p>
              <ResultRow label="Range" value={`${range.toFixed(2)} m`} color="text-hk-red" />
              <ResultRow label="Max Height" value={`${maxHeight.toFixed(2)} m`} color="text-hk-emerald" />
              <ResultRow label="Flight Time" value={`${flightTime.toFixed(2)} s`} color="text-hk-blue" />
              <div className="mt-3 p-2 rounded-lg bg-hk-bg border border-hk-border">
                <p className="text-hk-muted text-xs leading-relaxed font-mono">
                  R = v²·sin(2θ)/g<br />
                  = {velocity}²·sin({2*angle}°)/{g}<br />
                  = {range.toFixed(2)} m
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4 flex flex-col">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-full rounded-xl border border-hk-border bg-hk-bg"
            style={{ imageRendering: 'crisp-edges' }}
          />
          {!hasRun && (
            <p className="text-center text-hk-muted text-xs mt-2">Adjust parameters and click Fire Projectile</p>
          )}
        </div>
      </div>
    </div>
  );
};

const SliderControl: React.FC<{
  label: string; value: number; min: number; max: number;
  step: number; unit: string; onChange: (v: number) => void;
}> = ({ label, value, min, max, step, unit, onChange }) => (
  <div>
    <div className="flex justify-between mb-1">
      <label className="text-hk-muted text-xs">{label}</label>
      <span className="text-white text-xs font-mono font-semibold">{value}{unit}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none bg-hk-border cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-hk-blue"
    />
    <div className="flex justify-between mt-0.5">
      <span className="text-hk-muted text-[10px] font-mono">{min}{unit}</span>
      <span className="text-hk-muted text-[10px] font-mono">{max}{unit}</span>
    </div>
  </div>
);

const ResultRow: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center">
    <span className="text-hk-muted text-xs">{label}</span>
    <span className={`text-xs font-mono font-bold ${color}`}>{value}</span>
  </div>
);
