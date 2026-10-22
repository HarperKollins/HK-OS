import React, { useState, useEffect, useRef } from 'react';
import { FileText, Save, RefreshCw } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';

const FLASHCARD_SEED = [
  { q: 'What is the formula for projectile range?', a: 'R = v²·sin(2θ)/g' },
  { q: 'At what angle is range maximised?', a: '45° — because sin(2×45°) = sin(90°) = 1' },
  { q: 'How is max height calculated?', a: 'H = v²·sin²(θ)/(2g)' },
  { q: 'What is the flight time formula?', a: 'T = 2v·sin(θ)/g' },
];

const DEFAULT_NOTE = `# Projectile Motion Lab Notes

## Key Equations

- **Range**: R = v²·sin(2θ)/g
- **Max Height**: H = v²·sin²(θ)/(2g)  
- **Flight Time**: T = 2v·sin(θ)/g

## Observations

At 45°, range is maximised because sin(2θ) = sin(90°) = 1.

Complementary angles (e.g. 30° and 60°) give equal ranges because sin(2×30°) = sin(60°) and sin(2×60°) = sin(120°) = sin(60°).

## Moon vs Earth Experiment

Moon gravity = 1.62 m/s², Earth = 9.81 m/s²
Ratio = 9.81/1.62 ≈ 6.06 — projectiles travel ~6× further on the Moon.

## To Do
- [ ] Run simulation at 30°, 45°, 60° and compare ranges
- [ ] Verify the complementary angle rule in Code Lab
- [ ] Complete Module Assessment
`;

export const DocsApp: React.FC = () => {
  const { addEvent } = useActivityStore();
  const [note, setNote] = useState(() => localStorage.getItem('hkos-note') ?? DEFAULT_NOTE);
  const [activeTab, setActiveTab] = useState<'editor' | 'flashcards'>('editor');
  const [syncState, setSyncState] = useState<'idle' | 'saving' | 'saved' | 'unavailable'>('idle');
  const [flashcards] = useState(FLASHCARD_SEED);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [preview, setPreview] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save debounce
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem('hkos-note', note);
    }, 1500);
  }, [note]);

  const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;

  const handleSave = () => {
    setSyncState('saving');
    localStorage.setItem('hkos-note', note);
    addEvent('NOTE_SAVED', 'docs', { wordCount });
    setTimeout(() => {
      setSyncState('saved');
      setTimeout(() => setSyncState('idle'), 2000);
    }, 800);
  };

  const handleSync = () => {
    setSyncState('unavailable');
    setTimeout(() => setSyncState('idle'), 3000);
  };

  const toggleFlip = (i: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-white mt-4 mb-2">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-hk-muted mt-3 mb-1">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-hk-muted">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="text-hk-muted text-sm ml-4 list-disc">$1</li>')
      .replace(/^- \[x\] (.+)$/gm, '<li class="text-hk-emerald text-sm ml-4">✓ $1</li>')
      .replace(/^- \[ \] (.+)$/gm, '<li class="text-hk-muted text-sm ml-4">☐ $1</li>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="h-full flex flex-col bg-hk-bg">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-hk-border bg-hk-surface/50">
        <FileText size={18} className="text-hk-emerald" />
        <h1 className="text-white font-semibold">HK Docs</h1>
        <span className="text-hk-muted text-xs ml-1">Learning notebook</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-hk-muted text-xs">{wordCount} words</span>
          <button
            onClick={handleSync}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              syncState === 'unavailable'
                ? 'border-hk-red/30 text-hk-red'
                : 'border-hk-border text-hk-muted hover:text-white'
            }`}
          >
            <RefreshCw size={11} />
            {syncState === 'unavailable' ? 'Cloud unavailable' : 'Sync'}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-hk-emerald text-black font-semibold hover:bg-hk-emerald/90 transition-colors"
          >
            <Save size={11} />
            {syncState === 'saving' ? 'Saving...' : syncState === 'saved' ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-3 border-b border-hk-border">
        {(['editor', 'flashcards'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'text-white bg-hk-surface border border-b-0 border-hk-border'
                : 'text-hk-muted hover:text-white'
            }`}
          >
            {tab === 'editor' ? '📝 Editor' : '🗂 Flashcards'}
          </button>
        ))}
        {activeTab === 'editor' && (
          <button
            onClick={() => setPreview(v => !v)}
            className={`ml-auto text-xs px-3 py-1.5 rounded-lg mb-1 transition-colors ${
              preview ? 'bg-hk-blue/10 text-hk-blue border border-hk-blue/20' : 'text-hk-muted hover:text-white'
            }`}
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'editor' && (
          !preview ? (
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm leading-7 p-6 outline-none resize-none font-sans placeholder-hk-muted"
              placeholder="Start writing your notes..."
              spellCheck
            />
          ) : (
            <div
              className="flex-1 overflow-y-auto p-6 text-sm leading-7"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(note) }}
            />
          )
        )}

        {activeTab === 'flashcards' && (
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-hk-muted text-sm mb-4">Click a card to reveal the answer. {flashcards.length} cards in this set.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flashcards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => toggleFlip(i)}
                  className="text-left p-5 rounded-xl border border-hk-border bg-hk-surface hover:border-hk-emerald/30 transition-all min-h-[120px] flex flex-col justify-between"
                >
                  <div>
                    <p className="text-hk-muted text-[10px] uppercase tracking-widest mb-2">
                      {flippedCards.has(i) ? 'Answer' : 'Question'}
                    </p>
                    <p className={`text-sm font-medium ${
                      flippedCards.has(i) ? 'text-hk-emerald font-mono' : 'text-white'
                    }`}>
                      {flippedCards.has(i) ? card.a : card.q}
                    </p>
                  </div>
                  <p className="text-hk-muted/50 text-[10px] mt-3">
                    {flippedCards.has(i) ? 'Click to see question' : 'Click to reveal'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
