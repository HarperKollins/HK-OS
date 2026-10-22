import React, { useState } from 'react';
import { Brain, CheckCircle, Circle, ChevronRight, ExternalLink, BarChart2, FlaskConical, Code2, Send } from 'lucide-react';
import { useSystemStore } from '../store/systemStore';
import { useLearningStore } from '../store/learningStore';
import { useActivityStore } from '../store/activityStore';
import type { Milestone } from '../types/learning';

const TUTOR_RESPONSES: Record<string, string[]> = {
  explain: [
    'Projectile motion is two-dimensional kinematics where an object moves under gravity alone after launch. The horizontal velocity remains constant (ignoring air resistance), while vertical velocity changes at rate g.',
    'The key insight: horizontal and vertical motion are independent. You can analyze them separately and combine results.',
    'Range R = v²sin(2θ)/g. Notice sin(2θ) is maximised at θ=45°, giving maximum range. This is why 45° is the optimal angle on flat ground.',
  ],
  hint: [
    'Try running the simulation at 45° first — this is the theoretical maximum range angle. Then compare 30° and 60°. They should give equal range. Why?',
    'Because sin(2×30°) = sin(60°) and sin(2×60°) = sin(120°) = sin(60°). Complementary angles give equal range.',
    'Run the same simulation on Moon gravity (1.62 m/s²). The range should be about 6× larger than Earth. Does your simulation match?',
  ],
  question: [
    'If you double the initial velocity, how does the range change? (Hint: look at the R formula and think about what v² means.)',
    'Why does maximum height occur at exactly half the flight time?',
    'A ball is launched on Mars (g=3.72) at 50 m/s, 45°. Calculate the range without the simulator first, then verify.',
  ],
  interpret: [
    'Your simulation results look correct. Notice that at 45°, the horizontal range and 4× maximum height have a specific relationship: H = R/4 when θ=45°.',
    'The flight time T = 2v·sin(θ)/g tells you how long gravity acts on the projectile. On the Moon, T is 6× longer — meaning the projectile stays airborne much longer.',
    'Your results confirm the theory. The ratio of ranges between Earth and Mars should be approximately 9.81/3.72 ≈ 2.64. Does your data match?',
  ],
};

export const HKAIApp: React.FC = () => {
  const { openApp } = useSystemStore();
  const { context, setActiveMilestone, completeMilestone } = useLearningStore();
  const { events, simulationCount, codeRunCount } = useActivityStore();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'progress' | 'tutor'>('roadmap');
  const [tutorInput, setTutorInput] = useState('');
  const [tutorHistory, setTutorHistory] = useState<{role: 'user'|'tutor', text: string}[]>([
    { role: 'tutor', text: 'Hello! I am your HK AI learning assistant. I can explain concepts, give hints, ask you questions, or help interpret your simulation results. What would you like to explore?' }
  ]);

  const handleMilestoneClick = (milestone: Milestone) => {
    setActiveMilestone(milestone.id);
    if (milestone.linkedApp && milestone.linkedApp !== 'hkai') {
      setTimeout(() => openApp(milestone.linkedApp as any), 300);
    }
  };

  const sendTutorMessage = () => {
    const msg = tutorInput.trim();
    if (!msg) return;
    setTutorHistory(h => [...h, { role: 'user', text: msg }]);
    setTutorInput('');
    
    // Deterministic demo responses based on keywords
    let cat = 'explain';
    const lower = msg.toLowerCase();
    if (lower.includes('hint') || lower.includes('help') || lower.includes('stuck')) cat = 'hint';
    else if (lower.includes('?') || lower.includes('question') || lower.includes('quiz')) cat = 'question';
    else if (lower.includes('result') || lower.includes('simulation') || lower.includes('data') || lower.includes('interpret')) cat = 'interpret';
    
    const responses = TUTOR_RESPONSES[cat];
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
      setTutorHistory(h => [...h, { role: 'tutor', text: response }]);
    }, 600);
  };

  const recentEvents = events.slice(0, 5);

  return (
    <div className="h-full flex flex-col bg-hk-bg">
      {/* App header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-hk-border bg-hk-surface/50">
        <Brain size={18} className="text-hk-blue" />
        <h1 className="text-white font-semibold">HK AI</h1>
        <span className="text-hk-muted text-xs ml-1">
          {context.roadmap.subject} · {context.roadmap.module}
        </span>
        <a
          href="https://hkai.site"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1.5 text-xs text-hk-blue hover:text-hk-blue/80 transition-colors px-3 py-1.5 rounded-lg border border-hk-blue/30 hover:bg-hk-blue/5"
        >
          <ExternalLink size={11} />
          Open hkai.site
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-3 border-b border-hk-border">
        {(['roadmap', 'progress', 'tutor'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors capitalize ${
              activeTab === tab
                ? 'text-white bg-hk-surface border border-b-0 border-hk-border'
                : 'text-hk-muted hover:text-white'
            }`}
          >
            {tab === 'roadmap' ? '🗺 Roadmap' : tab === 'progress' ? '📊 Progress' : '💬 Tutor'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'roadmap' && (
          <div className="space-y-3 max-w-2xl">
            <p className="text-hk-muted text-sm mb-4">Click a milestone to set it as active and open the linked application.</p>
            {context.roadmap.milestones.map((milestone, i) => (
              <button
                key={milestone.id}
                onClick={() => handleMilestoneClick(milestone)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  milestone.id === context.activeMilestoneId
                    ? 'border-hk-blue bg-hk-blue/5 shadow-sm shadow-hk-blue/10'
                    : 'border-hk-border bg-hk-surface hover:border-hk-border/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {milestone.status === 'completed' ? (
                      <CheckCircle size={18} className="text-hk-emerald" />
                    ) : milestone.status === 'active' ? (
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-hk-blue bg-hk-blue/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-hk-blue" />
                      </div>
                    ) : (
                      <Circle size={18} className="text-hk-muted" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-hk-muted text-xs font-mono">{i + 1}</span>
                      <h3 className={`font-semibold text-sm ${
                        milestone.status === 'completed' ? 'text-hk-muted line-through' : 'text-white'
                      }`}>{milestone.title}</h3>
                      {milestone.status === 'active' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-hk-blue/10 text-hk-blue border border-hk-blue/20">Active</span>
                      )}
                    </div>
                    <p className="text-hk-muted text-xs mt-1">{milestone.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {milestone.completedAt && (
                        <span className="text-hk-emerald text-xs flex items-center gap-1">
                          <CheckCircle size={10} /> Completed {new Date(milestone.completedAt).toLocaleDateString()}
                        </span>
                      )}
                      {milestone.linkedApp && milestone.linkedApp !== 'hkai' && (
                        <span className="text-hk-muted text-xs flex items-center gap-1">
                          {milestone.linkedApp === 'simulation' ? <FlaskConical size={10} /> : <Code2 size={10} />}
                          Opens {milestone.linkedApp === 'simulation' ? 'Simulation' : 'Code Lab'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-hk-muted mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="max-w-2xl space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Simulations Run" value={simulationCount} icon={<FlaskConical size={16} className="text-purple-400" />} color="purple" />
              <StatCard label="Code Executions" value={codeRunCount} icon={<Code2 size={16} className="text-orange-400" />} color="orange" />
              <StatCard
                label="Completed"
                value={context.roadmap.milestones.filter(m => m.status === 'completed').length}
                suffix={`/${context.roadmap.milestones.length}`}
                icon={<CheckCircle size={16} className="text-hk-emerald" />}
                color="emerald"
              />
            </div>

            <div className="bg-hk-surface border border-hk-border rounded-xl p-4">
              <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2"><BarChart2 size={14} /> Recent Activity</h3>
              {recentEvents.length === 0 ? (
                <p className="text-hk-muted text-sm">No activity yet. Start by running the Simulation or Code Lab.</p>
              ) : (
                <div className="space-y-2">
                  {recentEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-3 text-xs">
                      <span className="text-hk-muted font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        event.type === 'SIMULATION_RUN' ? 'bg-purple-500/10 text-purple-400' :
                        event.type === 'CODE_EXECUTED' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-hk-emerald/10 text-hk-emerald'
                      }`}>{event.type.replace(/_/g, ' ')}</span>
                      <span className="text-hk-muted">{event.appId}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-hk-surface border border-hk-border rounded-xl p-4">
              <h3 className="text-white font-medium text-sm mb-1">Milestone 2 Condition</h3>
              <p className="text-hk-muted text-xs mb-3">Run at least 3 simulations with different gravity settings</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-hk-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-hk-blue rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((simulationCount / 3) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-hk-muted font-mono">{Math.min(simulationCount, 3)}/3</span>
              </div>
              {simulationCount >= 3 && (
                <button
                  onClick={() => completeMilestone('milestone-2')}
                  className="mt-3 w-full py-2 rounded-lg bg-hk-emerald text-black text-xs font-semibold hover:bg-hk-emerald/90 transition-colors"
                >
                  Mark Milestone 2 Complete ✓
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tutor' && (
          <div className="max-w-2xl h-full flex flex-col">
            <div className="flex-1 space-y-3 mb-4 max-h-[400px] overflow-y-auto">
              {tutorHistory.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${ msg.role === 'user' ? 'flex-row-reverse' : '' }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'tutor' ? 'bg-hk-blue' : 'bg-hk-emerald'
                  }`}>
                    {msg.role === 'tutor' ? <Brain size={12} className="text-white" /> : <span className="text-black text-xs font-bold">H</span>}
                  </div>
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-xs ${
                    msg.role === 'tutor'
                      ? 'bg-hk-surface border border-hk-border text-white'
                      : 'bg-hk-blue text-white'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-hk-muted mb-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-2">
              ⚠ Demo mode — responses are deterministic examples. No live AI connection.
            </div>

            <div className="flex gap-2 mb-3 flex-wrap">
              {['Explain this', 'Give me a hint', 'Ask me a question', 'Interpret results'].map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setTutorInput(q); }}
                  className="text-xs px-2 py-1 rounded-lg bg-hk-surface border border-hk-border text-hk-muted hover:text-white hover:border-hk-border/80 transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={tutorInput}
                onChange={e => setTutorInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendTutorMessage()}
                placeholder="Ask the tutor..."
                className="flex-1 bg-hk-surface border border-hk-border rounded-xl px-4 py-2 text-sm text-white placeholder-hk-muted outline-none focus:border-hk-blue transition-colors"
              />
              <button
                onClick={sendTutorMessage}
                className="px-4 py-2 rounded-xl bg-hk-blue text-white hover:bg-hk-blue/90 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{label: string; value: number; suffix?: string; icon: React.ReactNode; color: string}> = ({label, value, suffix, icon}) => (
  <div className="bg-hk-surface border border-hk-border rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">{icon}<span className="text-hk-muted text-xs">{label}</span></div>
    <p className="text-2xl font-bold text-white font-mono">{value}<span className="text-hk-muted text-sm">{suffix}</span></p>
  </div>
);
