import React, { useState, useEffect } from 'react';
import { Folder, FileText, ArrowLeft, RefreshCw, Trash2, Plus } from 'lucide-react';
import type { FileItem } from '../../types/hkos';

export const FileManagerApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'file' | 'folder'>('file');

  const loadDirectory = async (sub = currentPath) => {
    if (window.hkos?.fsList) {
      const list = await window.hkos.fsList(sub);
      setItems(list);
      setSelectedFile(null);
      setFileContent(null);
    }
  };

  const navigateTo = (folder: string) => {
    const next = currentPath ? `${currentPath}/${folder}` : folder;
    setCurrentPath(next);
    loadDirectory(next);
  };

  const navigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    const parent = parts.join('/');
    setCurrentPath(parent);
    loadDirectory(parent);
  };

  const previewFile = async (name: string) => {
    const full = currentPath ? `${currentPath}/${name}` : name;
    setSelectedFile(full);
    if (window.hkos?.fsRead) {
      const res = await window.hkos.fsRead(full);
      setFileContent(res.content ?? `[Cannot preview binary or empty file]`);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const full = currentPath ? `${currentPath}/${newName.trim()}` : newName.trim();
    if (newType === 'folder') {
      await window.hkos?.fsMkdir(full);
    } else {
      await window.hkos?.fsWrite(full, '');
    }
    setNewName('');
    setIsCreating(false);
    loadDirectory();
  };

  const handleDelete = async (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const full = currentPath ? `${currentPath}/${name}` : name;
    if (window.confirm(`Delete ${name} from disk?`)) {
      await window.hkos?.fsDelete(full);
      loadDirectory();
    }
  };

  useEffect(() => {
    loadDirectory('');
  }, []);

  return (
    <div className="h-full flex flex-col bg-hk-bg text-white font-sans">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-hk-border bg-hk-surface">
        <div className="flex items-center gap-2">
          <button
            onClick={navigateUp}
            disabled={!currentPath}
            className="p-1 rounded hover:bg-white/5 disabled:opacity-30 text-hk-muted hover:text-white"
          >
            <ArrowLeft size={14} />
          </button>
          <span className="text-xs font-mono text-hk-blue font-medium">Documents/HK OS/{currentPath}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadDirectory()} className="p-1 text-hk-muted hover:text-white">
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => { setNewType('folder'); setIsCreating(true); }}
            className="px-2 py-1 text-xs border border-hk-border rounded text-hk-muted hover:text-white flex items-center gap-1"
          >
            <Plus size={11} /> New Folder
          </button>
          <button
            onClick={() => { setNewType('file'); setIsCreating(true); }}
            className="px-2.5 py-1 text-xs bg-hk-blue text-white rounded font-medium flex items-center gap-1"
          >
            <Plus size={11} /> New File
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="p-3 border-b border-hk-border bg-hk-surface flex items-center gap-2 animate-fadeIn">
          <span className="text-xs text-hk-muted">Create {newType}:</span>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder={newType === 'folder' ? 'folder_name' : 'filename.txt'}
            autoFocus
            className="px-2 py-1 bg-hk-bg border border-hk-border rounded text-xs text-white outline-none focus:border-hk-blue"
          />
          <button onClick={handleCreate} className="px-3 py-1 bg-hk-emerald text-black text-xs font-bold rounded">Create</button>
          <button onClick={() => setIsCreating(false)} className="px-2 py-1 text-xs text-hk-muted">Cancel</button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* File & Folder Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map(item => (
              <div
                key={item.name}
                onClick={() => item.isDirectory ? navigateTo(item.name) : previewFile(item.name)}
                className={`p-3 rounded-xl border border-hk-border bg-hk-surface/50 hover:border-hk-blue/40 cursor-pointer flex flex-col justify-between group transition-all ${
                  selectedFile?.endsWith(item.name) ? 'border-hk-blue bg-hk-blue/10' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  {item.isDirectory ? (
                    <Folder size={28} className="text-yellow-400 fill-yellow-400/20" />
                  ) : (
                    <FileText size={28} className="text-hk-emerald" />
                  )}
                  <button
                    onClick={(e) => handleDelete(item.name, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-hk-red text-hk-muted p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-medium text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-hk-muted">
                    {item.isDirectory ? 'Directory' : `${(item.size / 1024).toFixed(1)} KB`}
                  </p>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-full py-12 text-center text-hk-muted text-xs">
                This directory is empty on disk.
              </div>
            )}
          </div>
        </div>

        {/* File Content Preview Panel */}
        {selectedFile && (
          <div className="w-80 border-l border-hk-border bg-hk-surface/30 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-hk-border mb-3">
              <span className="text-xs font-semibold text-white truncate">{selectedFile.split('/').pop()}</span>
              <button onClick={() => setSelectedFile(null)} className="text-xs text-hk-muted hover:text-white">✕</button>
            </div>
            <pre className="flex-1 font-mono text-xs text-hk-muted overflow-auto whitespace-pre-wrap leading-relaxed p-2 bg-hk-bg rounded border border-hk-border">
              {fileContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
