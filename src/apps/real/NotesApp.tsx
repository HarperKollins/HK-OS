import React, { useState, useEffect } from 'react';
import { FileText, Save, Plus, Trash2, Folder, RefreshCw } from 'lucide-react';
import type { FileItem } from '../../types/hkos';

export const NotesApp: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadFiles = async () => {
    if (window.hkos?.fsList) {
      const list = await window.hkos.fsList('Notes');
      const mdFiles = list.filter(f => !f.isDirectory && f.name.endsWith('.md'));
      setFiles(mdFiles);
      if (mdFiles.length > 0 && !activeFile) {
        loadFile(mdFiles[0].name);
      }
    }
  };

  const loadFile = async (name: string) => {
    setActiveFile(name);
    setStatus('Loading...');
    if (window.hkos?.fsRead) {
      const res = await window.hkos.fsRead(`Notes/${name}`);
      if (res.success && res.content !== undefined) {
        setContent(res.content);
        setStatus('');
      } else {
        setStatus(`Error: ${res.error}`);
      }
    }
  };

  const saveFile = async () => {
    if (!activeFile) return;
    setStatus('Saving...');
    if (window.hkos?.fsWrite) {
      const res = await window.hkos.fsWrite(`Notes/${activeFile}`, content);
      if (res.success) {
        setStatus('Saved to disk ✓');
        setTimeout(() => setStatus(''), 2000);
        loadFiles();
      } else {
        setStatus(`Save error: ${res.error}`);
      }
    }
  };

  const createFile = async () => {
    if (!newFileName.trim()) return;
    let name = newFileName.trim();
    if (!name.endsWith('.md')) name += '.md';
    if (window.hkos?.fsWrite) {
      const initial = `# ${name.replace('.md', '')}\n\nStart writing notes here...\n`;
      await window.hkos.fsWrite(`Notes/${name}`, initial);
      setNewFileName('');
      setIsCreating(false);
      await loadFiles();
      loadFile(name);
    }
  };

  const deleteFile = async (name: string) => {
    if (window.hkos?.fsDelete) {
      await window.hkos.fsDelete(`Notes/${name}`);
      if (activeFile === name) {
        setActiveFile(null);
        setContent('');
      }
      loadFiles();
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="h-full flex flex-col bg-[#000000] text-[#ddffdc] font-['Inter']">
      {/* App Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#485346] bg-[#181818]">
        <div className="flex items-center gap-2.5">
          <FileText size={15} className="text-[#7fee64]" />
          <span className="text-xs font-semibold text-[#ddffdc] font-['Space_Grotesk']">Markdown Notebook</span>
          <span className="text-[11px] font-mono text-[#8cab87]">Documents/HK OS/Notes</span>
        </div>
        <div className="flex items-center gap-2.5">
          {status && <span className="text-xs text-[#7fee64] font-mono">{status}</span>}
          <span className="text-xs text-[#8cab87] mr-1">{wordCount} words</span>
          <button
            onClick={() => setPreview(!preview)}
            className={`px-3 py-1 text-xs rounded-lg border transition-all ${
              preview
                ? 'bg-[#7fee64]/10 border-[#7fee64] text-[#7fee64]'
                : 'border-[#485346] bg-[#212525] text-[#8cab87] hover:text-[#ddffdc] hover:border-[#8cab87]'
            }`}
          >
            {preview ? 'Source Code' : 'Preview'}
          </button>
          <button
            onClick={saveFile}
            disabled={!activeFile}
            className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-full bg-[#7fee64] text-[#000000] hover:brightness-110 transition-all disabled:opacity-40"
          >
            <Save size={12} /> Save
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Sidebar */}
        <div className="w-56 border-r border-[#485346] bg-[#181818] flex flex-col shrink-0">
          <div className="p-2.5 border-b border-[#485346] flex items-center justify-between">
            <span className="text-xs font-medium text-[#9cbf93] flex items-center gap-1.5 uppercase tracking-[0.05em] text-[10px]">
              <Folder size={11} className="text-[#7fee64]" /> Notes Files
            </span>
            <div className="flex items-center gap-1">
              <button onClick={loadFiles} className="p-1 hover:text-[#ddffdc] text-[#8cab87]" title="Refresh">
                <RefreshCw size={11} />
              </button>
              <button onClick={() => setIsCreating(true)} className="p-1 hover:text-[#7fee64] text-[#8cab87]" title="New note">
                <Plus size={13} />
              </button>
            </div>
          </div>

          {isCreating && (
            <div className="p-2.5 border-b border-[#485346] bg-[#212525]">
              <input
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createFile()}
                placeholder="note_name.md"
                autoFocus
                className="w-full px-2 py-1 bg-[#181818] border border-[#485346] rounded text-xs text-[#ddffdc] outline-none focus:border-[#7fee64]"
              />
              <div className="flex justify-end gap-1.5 mt-2">
                <button onClick={() => setIsCreating(false)} className="text-[11px] text-[#8cab87] px-2 py-0.5">Cancel</button>
                <button onClick={createFile} className="text-[11px] bg-[#7fee64] px-2.5 py-0.5 rounded text-[#000000] font-semibold">Create</button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {files.map(f => (
              <div
                key={f.name}
                onClick={() => loadFile(f.name)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                  activeFile === f.name
                    ? 'bg-[#212525] border border-[#7fee64] text-[#ddffdc]'
                    : 'text-[#8cab87] hover:bg-[#212525] hover:text-[#ddffdc]'
                }`}
              >
                <span className="truncate">{f.name}</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${f.name}?`)) deleteFile(f.name);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-[#f87171] text-[#677d64] p-0.5"
                  title="Delete file"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
            {files.length === 0 && (
              <p className="text-xs text-[#677d64] p-3 italic">No notes found. Click + to create one.</p>
            )}
          </div>
        </div>

        {/* Editor or Markdown Preview */}
        <div className="flex-1 flex flex-col bg-[#000000] overflow-hidden">
          {activeFile ? (
            preview ? (
              <div className="flex-1 p-6 overflow-y-auto prose prose-invert max-w-3xl text-sm leading-relaxed text-[#ddffdc]">
                {content.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-[#ddffdc] mb-3 pb-1 border-b border-[#485346] font-['Space_Grotesk']">{line.slice(2)}</h1>;
                  if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-[#ddffdc] mt-4 mb-2 font-['Space_Grotesk']">{line.slice(3)}</h2>;
                  if (line.startsWith('- ')) return <li key={i} className="text-[#8cab87] ml-4">{line.slice(2)}</li>;
                  if (!line.trim()) return <div key={i} className="h-3" />;
                  return <p key={i} className="text-[#8cab87] mb-2">{line}</p>;
                })}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Type your notes here..."
                className="flex-1 w-full bg-[#000000] p-6 text-sm text-[#ddffdc] font-mono leading-relaxed outline-none resize-none caret-[#7fee64]"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              />
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#677d64]">
              <FileText size={32} className="mb-2 opacity-40 text-[#7fee64]" />
              <p className="text-xs">Select or create a note file to begin editing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
