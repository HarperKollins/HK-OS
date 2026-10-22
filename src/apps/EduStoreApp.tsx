import React, { useState } from 'react';
import { Store, Star, Download, CheckCircle, Search } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';

type InstallState = 'available' | 'installing' | 'installed';

interface Module {
  id: string;
  name: string;
  category: string;
  description: string;
  developer: string;
  version: string;
  size: string;
  rating: number;
  reviews: number;
  installState: InstallState;
  installProgress: number;
  icon: string;
}

const INITIAL_MODULES: Module[] = [
  {
    id: 'logic-circuits',
    name: 'Interactive Logic Circuit Builder',
    category: 'Engineering',
    description: 'Build and simulate digital logic circuits with AND, OR, NOT, NAND, NOR, XOR gates. Includes truth table generation and signal tracing.',
    developer: 'HK Labs',
    version: '2.1.0',
    size: '18 MB',
    rating: 4.8,
    reviews: 1240,
    installState: 'available',
    installProgress: 0,
    icon: '⚡',
  },
  {
    id: 'chem-visualizer',
    name: '3D Organic Chemistry Visualizer',
    category: 'Chemistry',
    description: 'Explore molecular structures in 3D. Visualise organic compounds, reaction mechanisms, and molecular orbital theory with interactive models.',
    developer: 'SciViz Team',
    version: '1.4.2',
    size: '45 MB',
    rating: 4.6,
    reviews: 890,
    installState: 'available',
    installProgress: 0,
    icon: '🧪',
  },
  {
    id: 'africa-atlas',
    name: 'African History Interactive Atlas',
    category: 'History',
    description: 'An interactive historical atlas covering African civilisations, trade routes, colonial history, and independence movements from 3000 BCE to present.',
    developer: 'AfroEdu Collective',
    version: '3.0.1',
    size: '120 MB',
    rating: 4.9,
    reviews: 2100,
    installState: 'available',
    installProgress: 0,
    icon: '🗺️',
  },
  {
    id: 'offline-library',
    name: 'Offline Reference Library',
    category: 'Reference',
    description: 'A curated offline reference library including physics formulae, mathematics tables, chemical data, historical facts, and geographic data. Works without internet.',
    developer: 'HK Labs',
    version: '1.2.0',
    size: '280 MB',
    rating: 4.7,
    reviews: 3400,
    installState: 'available',
    installProgress: 0,
    icon: '📚',
  },
  {
    id: 'anatomy-explorer',
    name: 'Medical Anatomy Explorer',
    category: 'Medicine',
    description: 'Explore the human body in detailed 3D. Navigate organ systems, study anatomical structures, and learn physiological functions with clinical annotations.',
    developer: 'MedLearn Studio',
    version: '4.1.0',
    size: '380 MB',
    rating: 4.8,
    reviews: 1650,
    installState: 'available',
    installProgress: 0,
    icon: '🫀',
  },
];

const CATEGORIES = ['All', 'Engineering', 'Chemistry', 'History', 'Reference', 'Medicine'];

export const EduStoreApp: React.FC = () => {
  const { addEvent } = useActivityStore();
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const filteredModules = modules.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                       m.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || m.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleInstall = (id: string) => {
    // Start install
    setModules(prev => prev.map(m => m.id === id ? { ...m, installState: 'installing', installProgress: 0 } : m));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setModules(prev => prev.map(m => m.id === id ? { ...m, installState: 'installed', installProgress: 100 } : m));
        addEvent('MODULE_INSTALLED', 'store', { moduleId: id });
        if (selectedModule?.id === id) {
          setSelectedModule(prev => prev ? { ...prev, installState: 'installed', installProgress: 100 } : null);
        }
      } else {
        setModules(prev => prev.map(m => m.id === id ? { ...m, installProgress: Math.round(progress) } : m));
      }
    }, 200);
  };

  const getModule = (id: string) => modules.find(m => m.id === id);

  return (
    <div className="h-full flex flex-col bg-hk-bg">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-hk-border bg-hk-surface/50">
        <Store size={18} className="text-yellow-400" />
        <h1 className="text-white font-semibold">Edu-Store</h1>
        <span className="text-hk-muted text-xs ml-1">Educational application marketplace</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 shrink-0 border-r border-hk-border bg-hk-surface/20 p-4 flex flex-col gap-2">
          {/* Search */}
          <div className="relative mb-2">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-hk-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-8 pr-3 py-2 bg-hk-bg border border-hk-border rounded-lg text-xs text-white placeholder-hk-muted outline-none focus:border-hk-blue transition-colors"
            />
          </div>
          <p className="text-hk-muted text-[10px] uppercase tracking-widest px-1">Categories</p>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                selectedCategory === cat
                  ? 'bg-hk-blue/10 text-hk-blue border border-hk-blue/20'
                  : 'text-hk-muted hover:text-white hover:bg-hk-bg'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Module grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredModules.map(module => {
              const liveModule = getModule(module.id)!;
              return (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(liveModule)}
                  className="text-left p-4 rounded-xl border border-hk-border bg-hk-surface hover:border-hk-border/80 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-hk-bg border border-hk-border flex items-center justify-center text-xl shrink-0">
                      {module.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-white font-medium text-sm leading-tight truncate">{module.name}</h3>
                        {liveModule.installState === 'installed' && (
                          <CheckCircle size={14} className="text-hk-emerald shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-hk-muted">{module.category}</span>
                        <span className="text-hk-border">·</span>
                        <span className="text-xs text-hk-muted">{module.size}</span>
                        <span className="text-hk-border">·</span>
                        <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                          <Star size={9} fill="currentColor" /> {module.rating}
                        </span>
                      </div>
                      <p className="text-hk-muted text-xs mt-1.5 line-clamp-2">{module.description}</p>
                      {liveModule.installState === 'installing' && (
                        <div className="mt-2">
                          <div className="h-1 bg-hk-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-hk-blue rounded-full transition-all duration-200"
                              style={{ width: `${liveModule.installProgress}%` }}
                            />
                          </div>
                          <p className="text-hk-muted text-[10px] mt-0.5">Installing... {liveModule.installProgress}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Module detail panel */}
        {selectedModule && (() => {
          const live = getModule(selectedModule.id)!;
          return (
            <div className="w-72 border-l border-hk-border bg-hk-surface/30 p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-hk-bg border border-hk-border flex items-center justify-center text-3xl mx-auto mb-3">
                  {selectedModule.icon}
                </div>
                <h3 className="text-white font-semibold text-sm leading-snug">{selectedModule.name}</h3>
                <p className="text-hk-muted text-xs mt-1">{selectedModule.developer} · v{selectedModule.version}</p>
              </div>
              <div className="flex justify-between text-xs">
                <div className="text-center"><p className="text-white font-bold">{selectedModule.size}</p><p className="text-hk-muted">Size</p></div>
                <div className="text-center"><p className="text-yellow-400 font-bold flex items-center gap-0.5"><Star size={11} fill="currentColor" />{selectedModule.rating}</p><p className="text-hk-muted">Rating</p></div>
                <div className="text-center"><p className="text-white font-bold">{selectedModule.reviews.toLocaleString()}</p><p className="text-hk-muted">Reviews</p></div>
              </div>
              <p className="text-hk-muted text-xs leading-relaxed">{selectedModule.description}</p>
              {live.installState === 'available' && (
                <button
                  onClick={() => handleInstall(selectedModule.id)}
                  className="w-full py-2.5 rounded-xl bg-hk-blue text-white text-sm font-semibold hover:bg-hk-blue/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Install
                </button>
              )}
              {live.installState === 'installing' && (
                <div>
                  <div className="h-2 bg-hk-border rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-hk-blue rounded-full transition-all duration-200" style={{ width: `${live.installProgress}%` }} />
                  </div>
                  <p className="text-hk-muted text-xs text-center">Installing {live.installProgress}%</p>
                </div>
              )}
              {live.installState === 'installed' && (
                <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-hk-emerald/30 text-hk-emerald text-sm font-semibold">
                  <CheckCircle size={14} /> Installed
                </div>
              )}
              <button onClick={() => setSelectedModule(null)} className="text-hk-muted text-xs hover:text-white transition-colors">Close</button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
