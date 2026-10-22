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
    <div className="h-full flex flex-col bg-[#000000] text-[#ddffdc] font-['Inter']">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#485346] bg-[#181818]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={navigateUp}
            disabled={!currentPath}
            className="p-1 rounded-lg border border-[#485346] bg-[#212525] disabled:opacity-30 text-[#8cab87] hover:text-[#ddffdc] transition-all"
            title="Go up"
          >
            <ArrowLeft size={13} />
          </button>
          <span className="text-xs font-mono text-[#7fee64] font-medium">
            Documents/HK OS{currentPath ? `/${currentPath}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadDirectory()} className="p-1 text-[#8cab87] hover:text-[#ddffdc] transition-colors" title="Reload directory">
            <RefreshCw size={13} />
          </button>
          <button
            onClick={() => { setNewType('folder'); setIsCreating(true); }}
            className="px-3 py-1 text-xs border border-[#485346] rounded-lg text-[#8cab87] hover:text-[#ddffdc] hover:border-[#8cab87] transition-all flex items-center gap-1.5"
          >
            <Plus size={11} /> Folder
          </button>
          <button
            onClick={() => { setNewType('file'); setIsCreating(true); }}
            className="px-3 py-1 text-xs bg-[#7fee64] text-[#000000] rounded-full font-semibold hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <Plus size={11} /> File
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="p-3 border-b border-[#485346] bg-[#212525] flex items-center gap-2.5 animate-fadeIn">
          <span className="text-xs text-[#9cbf93] font-mono">Create {newType}:</span>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder={newType === 'folder' ? 'folder_name' : 'filename.txt'}
            autoFocus
            className="px-3 py-1 bg-[#181818] border border-[#485346] rounded-lg text-xs text-[#ddffdc] outline-none focus:border-[#7fee64]"
          />
          <button onClick={handleCreate} className="px-3 py-1 bg-[#7fee64] text-[#000000] text-xs font-semibold rounded-lg hover:brightness-110">
            Create
          </button>
          <button onClick={() => setIsCreating(false)} className="px-2 py-1 text-xs text-[#8cab87]">
            Cancel
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* File & Folder Grid (Modal Workload Card Style) */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {items.map(item => (
              <div
                key={item.name}
                onClick={() => item.isDirectory ? navigateTo(item.name) : previewFile(item.name)}
                className={`p-3.5 rounded-lg border bg-[#1f2a33] hover:border-[#7fee64] hover:bg-[#212525] cursor-pointer flex flex-col justify-between group transition-all duration-200 ${
                  selectedFile?.endsWith(item.name) ? 'border-[#7fee64] bg-[#212525]' : 'border-[#485346]'
                }`}
              >
                <div className="flex items-start justify-between">
                  {item.isDirectory ? (
                    <Folder size={26} className="text-[#fbbf24]" />
                  ) : (
                    <FileText size={26} className="text-[#7fee64]" />
                  )}
                  <button
                    onClick={(e) => handleDelete(item.name, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-[#f87171] text-[#677d64] p-1 transition-opacity"
                    title="Delete item"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-[#ddffdc] truncate font-['Space_Grotesk']">{item.name}</p>
                  <p className="text-[10px] text-[#8cab87] font-mono mt-0.5">
                    {item.isDirectory ? 'directory' : `${(item.size / 1024).toFixed(1)} KB`}
                  </p>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-full py-16 text-center text-[#677d64] text-xs font-mono">
                [empty directory on host disk]
              </div>
            )}
          </div>
        </div>

        {/* File Content Preview Panel */}
        {selectedFile && (
          <div className="w-80 border-l border-[#485346] bg-[#181818] p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#485346] mb-3">
              <span className="text-xs font-medium text-[#ddffdc] truncate font-mono">{selectedFile.split('/').pop()}</span>
              <button onClick={() => setSelectedFile(null)} className="text-xs text-[#8cab87] hover:text-[#ddffdc]">✕</button>
            </div>
            <pre className="flex-1 font-mono text-xs text-[#ddffdc] overflow-auto whitespace-pre-wrap leading-relaxed p-3 bg-[#000000] rounded-lg border border-[#485346]">
              {fileContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
