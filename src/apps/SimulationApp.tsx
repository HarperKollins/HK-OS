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

    // Phosphor Terminal Grid
    ctx.strokeStyle = '#1f2a33';
    ctx.lineWidth = 0.5;
    for (let x = PAD; x <= W - PAD; x += (W - 2 * PAD) / 8) {
      ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, H - PAD); ctx.stroke();
    }
    for (let y = PAD; y <= H - PAD; y += (H - 2 * PAD) / 5) {
      ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
    }

    // Hairline Circuit Axes
    ctx.strokeStyle = '#485346';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, H - PAD);
    ctx.lineTo(W - PAD, H - PAD);
    ctx.moveTo(PAD, PAD);
    ctx.lineTo(PAD, H - PAD);
    ctx.stroke();

    // Axis labels in Sage 60
    ctx.fillStyle = '#8cab87';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('Horizontal (m)', W / 2 - 35, H - 10);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Height (m)', -25, 0);
    ctx.restore();

    if (!hasRun) return;

    const points = computeTrajectory(velocity, angle, g);
    const scaleX = (W - 2 * PAD) / Math.max(range, 1);
    const scaleY = (H - 2 * PAD) / Math.max(maxHeight * 1.2, 1);
    const scale = Math.min(scaleX, scaleY);

    const toCanvasX = (x: number) => PAD + x * scale;
    const toCanvasY = (y: number) => H - PAD - y * scale;

    const visibleCount = Math.floor(points.length * progress);

    // Glowing Phosphor Lime Trajectory path
    ctx.beginPath();
    ctx.strokeStyle = '#7fee64';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#7fee64';
    ctx.shadowBlur = 10;
    for (let i = 0; i < visibleCount; i++) {
      const p = points[i];
      if (i === 0) ctx.moveTo(toCanvasX(p.x), toCanvasY(p.y));
      else ctx.lineTo(toCanvasX(p.x), toCanvasY(p.y));
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Max height indicator in Phosphor White
    if (progress >= 0.5) {
      ctx.strokeStyle = '#ddffdc';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD, toCanvasY(maxHeight));
      ctx.lineTo(toCanvasX(range / 2), toCanvasY(maxHeight));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ddffdc';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`H=${maxHeight.toFixed(1)}m`, PAD + 4, toCanvasY(maxHeight) - 6);
    }

    // Range indicator in Moss 80
    if (progress >= 0.99) {
      ctx.strokeStyle = '#aed2a4';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(range), H - PAD);
      ctx.lineTo(toCanvasX(range), toCanvasY(0));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#aed2a4';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`R=${range.toFixed(1)}m`, toCanvasX(range) + 4, H - PAD - 6);
    }

    // Projectile ball: Emissive status dot
    if (visibleCount > 0) {
      const last = points[visibleCount - 1];
      ctx.beginPath();
      ctx.arc(toCanvasX(last.x), toCanvasY(last.y), 5, 0, Math.PI * 2);
      ctx.fillStyle = '#7fee64';
      ctx.shadowColor = '#7fee64';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Launch angle arc
    ctx.strokeStyle = '#9cbf93';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(PAD, H - PAD, 22, -theta, 0, false);
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
    <div className="h-full flex flex-col bg-[#000000] text-[#ddffdc] font-['Inter']">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[#485346] bg-[#181818]">
        <FlaskConical size={16} className="text-[#7fee64]" />
        <h1 className="text-xs font-semibold text-[#ddffdc] font-['Space_Grotesk']">
          Kinematics Simulation — Projectile Motion
        </h1>
        <span className="text-[11px] font-mono text-[#8cab87] ml-2">HTML5 Canvas Emissive Physics</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Controls panel */}
        <div className="w-68 shrink-0 border-r border-[#485346] bg-[#181818] p-5 flex flex-col gap-4 overflow-y-auto">
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
            <label className="block text-[#8cab87] text-xs font-medium mb-1.5">Gravitational Field</label>
            <div className="relative">
              <button
                onClick={() => setGravityMenuOpen(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#212525] border border-[#485346] text-xs text-[#ddffdc] hover:border-[#7fee64] transition-all"
              >
                <span>{gravity.icon} {gravity.label} ({gravity.value} m/s²)</span>
                <ChevronDown size={12} className="text-[#8cab87]" />
              </button>
              {gravityMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#212525] border border-[#485346] rounded-lg overflow-hidden z-10 shadow-2xl">
                  {GRAVITY_OPTIONS.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => { setGravityIdx(i); setGravityMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#181818] transition-colors ${
                        i === gravityIdx ? 'text-[#7fee64] font-semibold' : 'text-[#ddffdc]'
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
          <div className="space-y-2 mt-2">
            <button
              onClick={handleFire}
              disabled={animating}
              className="w-full py-2.5 rounded-full bg-[#7fee64] text-[#000000] font-semibold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_12px_rgba(127,238,100,0.3)] disabled:opacity-50"
            >
              <Play size={13} fill="#000000" />
              {animating ? 'Tracing Trajectory...' : 'Fire Projectile'}
            </button>
            <button
              onClick={handleReset}
              className="w-full py-2 rounded-lg border border-[#485346] bg-[#212525] text-[#8cab87] text-xs flex items-center justify-center gap-2 hover:text-[#ddffdc] hover:border-[#8cab87] transition-all"
            >
              <RotateCcw size={12} /> Reset Canvas
            </button>
          </div>

          {/* Results */}
          {hasRun && (
            <div className="mt-3 p-3.5 rounded-lg border border-[#485346] bg-[#212525] space-y-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9cbf93]">
                Analytical Solutions
              </p>
              <ResultRow label="Range" value={`${range.toFixed(2)} m`} color="text-[#7fee64]" />
              <ResultRow label="Max Height" value={`${maxHeight.toFixed(2)} m`} color="text-[#ddffdc]" />
              <ResultRow label="Flight Time" value={`${flightTime.toFixed(2)} s`} color="text-[#aed2a4]" />
              <div className="mt-2 pt-2 border-t border-[#485346] text-[10px] font-mono text-[#8cab87] leading-relaxed">
                R = v²·sin(2θ)/g<br />
                = {velocity}²·sin({2*angle}°)/{g}<br />
                = {range.toFixed(2)} m
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 p-5 flex flex-col bg-[#000000]">
          <canvas
            ref={canvasRef}
            width={850}
            height={520}
            className="w-full h-full rounded-lg border border-[#485346] bg-[#000000]"
            style={{ imageRendering: 'crisp-edges' }}
          />
          {!hasRun && (
            <p className="text-center text-[#677d64] text-xs mt-2 font-mono">
              Adjust parameters and click <span className="text-[#7fee64]">Fire Projectile</span> to compute trajectory.
            </p>
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
    <div className="flex justify-between mb-1.5">
      <label className="text-[#8cab87] text-xs">{label}</label>
      <span className="text-[#ddffdc] text-xs font-mono font-medium">{value}{unit}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none bg-[#212525] border border-[#485346] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7fee64]"
    />
    <div className="flex justify-between mt-1">
      <span className="text-[#677d64] text-[10px] font-mono">{min}{unit}</span>
      <span className="text-[#677d64] text-[10px] font-mono">{max}{unit}</span>
    </div>
  </div>
);

const ResultRow: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-[#8cab87]">{label}</span>
    <span className={`font-mono font-semibold ${color}`}>{value}</span>
  </div>
);
