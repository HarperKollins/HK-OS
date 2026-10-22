import React, { useState } from 'react';
import { PlayCircle, Play } from 'lucide-react';

const MEDIA_ITEMS = [
  { id: '1', type: 'video', title: 'Projectile Motion — Lecture 3', subject: 'Physics', duration: '28:14', thumbnail: '🎬', description: 'Professor explains projectile motion from first principles, with worked examples.' },
  { id: '2', type: 'slides', title: 'Kinematics & Vectors — Slides', subject: 'Physics', duration: '45 slides', thumbnail: '📊', description: 'Full slide deck from the Kinematics module with diagrams and equations.' },
  { id: '3', type: 'video', title: 'Python for Physics — Tutorial 1', subject: 'Computing', duration: '22:05', thumbnail: '🎬', description: 'Introduction to using Python for solving physics problems.' },
  { id: '4', type: 'textbook', title: 'Classical Mechanics — Chapter 3', subject: 'Physics', duration: '32 pages', thumbnail: '📖', description: 'Chapter 3: Kinematics in two dimensions, projectile motion, circular motion.' },
];

export const MediaApp: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<typeof MEDIA_ITEMS[0] | null>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="h-full flex flex-col bg-hk-bg">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-hk-border bg-hk-surface/50">
        <PlayCircle size={18} className="text-pink-400" />
        <h1 className="text-white font-semibold">Learning Media</h1>
        <span className="text-hk-muted text-xs ml-1">Lectures, slides, and textbooks</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          {MEDIA_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setSelectedItem(item); setPlaying(false); }}
              className="text-left p-4 rounded-xl border border-hk-border bg-hk-surface hover:border-hk-border/80 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-hk-bg border border-hk-border flex items-center justify-center text-2xl shrink-0">{item.thumbnail}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium text-sm">{item.title}</h3>
                  </div>
                  <p className="text-hk-muted text-xs mt-0.5">{item.subject} · {item.duration}</p>
                  <p className="text-hk-muted text-xs mt-1.5 line-clamp-2">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-hk-bg/95 flex items-center justify-center p-8" onClick={() => setSelectedItem(null)}>
          <div className="bg-hk-surface border border-hk-border rounded-2xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="text-5xl text-center mb-4">{selectedItem.thumbnail}</div>
            <h2 className="text-white font-bold text-lg text-center mb-1">{selectedItem.title}</h2>
            <p className="text-hk-muted text-sm text-center mb-4">{selectedItem.subject} · {selectedItem.duration}</p>
            <p className="text-hk-muted text-sm mb-6">{selectedItem.description}</p>
            {!playing ? (
              <button
                onClick={() => setPlaying(true)}
                className="w-full py-3 rounded-xl bg-pink-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-pink-500/90 transition-colors"
              >
                <Play size={16} fill="white" /> Open {selectedItem.type === 'video' ? 'Video' : selectedItem.type === 'slides' ? 'Slides' : 'Textbook'}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-hk-muted text-xs mb-3">Media playback requires the full HK OS or media service integration.</p>
                <div className="p-4 rounded-xl bg-hk-bg border border-hk-border text-hk-muted text-sm">Content viewer · Integration pending</div>
              </div>
            )}
            <button onClick={() => setSelectedItem(null)} className="w-full mt-3 text-hk-muted text-xs hover:text-white transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
