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
    <div className="h-full flex flex-col bg-hk-bg text-white font-sans">
      {/* App Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-hk-border bg-hk-surface">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-hk-emerald" />
          <span className="text-sm font-semibold">Real Notes</span>
          <span className="text-xs text-hk-muted">Documents/HK OS/Notes</span>
        </div>
        <div className="flex items-center gap-2">
          {status && <span className="text-xs text-hk-emerald font-mono">{status}</span>}
          <span className="text-xs text-hk-muted mr-2">{wordCount} words</span>
          <button
            onClick={() => setPreview(!preview)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${
              preview ? 'bg-hk-blue/20 border-hk-blue text-hk-blue' : 'border-hk-border text-hk-muted hover:text-white'
            }`}
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={saveFile}
            disabled={!activeFile}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-hk-emerald text-black hover:bg-hk-emerald/90 transition-colors disabled:opacity-40"
          >
            <Save size={12} /> Save to Disk
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Sidebar */}
        <div className="w-56 border-r border-hk-border bg-hk-surface/40 flex flex-col shrink-0">
          <div className="p-2 border-b border-hk-border flex items-center justify-between">
            <span className="text-xs font-semibold text-hk-muted flex items-center gap-1">
              <Folder size={12} /> Notes on Disk
            </span>
            <div className="flex items-center gap-1">
              <button onClick={loadFiles} className="p-1 hover:text-white text-hk-muted">
                <RefreshCw size={12} />
              </button>
              <button onClick={() => setIsCreating(true)} className="p-1 hover:text-hk-emerald text-hk-muted">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {isCreating && (
            <div className="p-2 border-b border-hk-border bg-hk-bg">
              <input
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createFile()}
                placeholder="note_name.md"
                autoFocus
                className="w-full px-2 py-1 bg-hk-surface border border-hk-border rounded text-xs text-white outline-none focus:border-hk-blue"
              />
              <div className="flex justify-end gap-1 mt-1">
                <button onClick={() => setIsCreating(false)} className="text-[10px] text-hk-muted px-1.5 py-0.5">Cancel</button>
                <button onClick={createFile} className="text-[10px] bg-hk-blue px-2 py-0.5 rounded text-white font-medium">Create</button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {files.map(f => (
              <div
                key={f.name}
                onClick={() => loadFile(f.name)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer text-xs group transition-colors ${
                  activeFile === f.name ? 'bg-hk-blue/20 text-white font-medium' : 'text-hk-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="truncate flex-1">{f.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteFile(f.name); }}
                  className="opacity-0 group-hover:opacity-100 hover:text-hk-red transition-opacity p-0.5"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
            {files.length === 0 && (
              <p className="text-hk-muted text-xs p-3 text-center">No notes yet. Click + to create one.</p>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-hk-bg overflow-hidden">
          {activeFile ? (
            !preview ? (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="flex-1 p-6 bg-transparent text-white font-mono text-sm leading-6 resize-none outline-none"
                placeholder="Type your markdown notes..."
                spellCheck={false}
              />
            ) : (
              <div className="flex-1 p-6 overflow-y-auto prose prose-invert max-w-none text-sm leading-6">
                <div dangerouslySetInnerHTML={{
                  __html: content
                    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-white mb-3">$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-base font-semibold text-hk-blue mt-4 mb-2">$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold text-white mt-3 mb-1">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-hk-muted">$1</li>')
                    .replace(/\n/gim, '<br />')
                }} />
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-hk-muted text-sm">
              Select or create a note on the left
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
