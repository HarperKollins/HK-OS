import React, { useState } from 'react';
import { ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';
import type { AppManifest } from '../../types/hkos';

export const WebAppContainer: React.FC<{ app: AppManifest }> = ({ app }) => {
  const isElectron = Boolean(window.hkos?.isElectron);
  const [key, setKey] = useState(0);

  const handleOpenExternal = () => {
    if (app.url && window.hkos?.openExternal) {
      window.hkos.openExternal(app.url);
    }
  };

  return (
    <div className="h-full flex flex-col bg-hk-bg overflow-hidden">
      {/* Web App Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-hk-border bg-hk-surface/80 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="text-white font-medium">{app.name}</span>
          <span className="text-[11px] font-mono text-hk-muted truncate">{app.url}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Google Sign-in helper pill */}
          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] hover:bg-yellow-500/20"
            title="Open in your default system browser if Google OAuth is blocked"
          >
            <ShieldAlert size={10} /> Google Sign-in Fix
          </button>
          <button
            onClick={() => setKey(k => k + 1)}
            className="p-1 text-hk-muted hover:text-white rounded hover:bg-white/5"
            title="Reload webview"
          >
            <RefreshCw size={11} />
          </button>
          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1 p-1 text-hk-blue hover:text-white rounded"
            title="Open in system browser"
          >
            <ExternalLink size={11} />
          </button>
        </div>
      </div>

      {/* Web Container Body */}
      <div className="flex-1 relative bg-hk-bg overflow-hidden">
        {isElectron ? (
          // In Electron, use native webview with persistent partition for login sessions!
          // @ts-ignore
          <webview
            key={key}
            src={app.url}
            partition={app.partition || `persist:${app.id}`}
            className="w-full h-full border-0"
            allowpopups
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          // In standard browser fallback, use iframe or link
          <iframe
            key={key}
            src={app.url}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title={app.name}
          />
        )}
      </div>
    </div>
  );
};
