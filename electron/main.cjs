const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Root path for all HK OS data on the real hard disk
const HKOS_ROOT = path.join(app.getPath('documents'), 'HK OS');
const APPS_DIR = path.join(HKOS_ROOT, 'apps');
const NOTES_DIR = path.join(HKOS_ROOT, 'Notes');
const PROJECTS_DIR = path.join(HKOS_ROOT, 'Projects');

// Initialize real filesystem on host disk
function ensureDirectories() {
  [HKOS_ROOT, APPS_DIR, NOTES_DIR, PROJECTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Default seed apps if apps folder is empty
  const defaultApps = [
    {
      id: 'hk-ai',
      name: 'HK AI',
      icon: 'Brain',
      type: 'web',
      url: 'https://hkai.site',
      partition: 'persist:hkai',
      permissions: ['network', 'storage']
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: 'Youtube',
      type: 'web',
      url: 'https://www.youtube.com',
      partition: 'persist:youtube',
      permissions: ['network', 'storage']
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: 'FileText',
      type: 'local',
      entry: 'notes',
      permissions: ['filesystem']
    },
    {
      id: 'codelab',
      name: 'Code Lab',
      icon: 'Code2',
      type: 'local',
      entry: 'codelab',
      permissions: ['subprocess', 'filesystem']
    },
    {
      id: 'simulation',
      name: 'Simulation',
      icon: 'FlaskConical',
      type: 'local',
      entry: 'simulation',
      permissions: []
    },
    {
      id: 'files',
      name: 'Files',
      icon: 'Folder',
      type: 'local',
      entry: 'files',
      permissions: ['filesystem']
    },
    {
      id: 'store',
      name: 'Edu-Store',
      icon: 'Store',
      type: 'local',
      entry: 'store',
      permissions: ['package-manager', 'filesystem']
    }
  ];

  defaultApps.forEach(defApp => {
    const appDir = path.join(APPS_DIR, defApp.id);
    const manifestPath = path.join(appDir, 'app.json');
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }
    if (!fs.existsSync(manifestPath)) {
      fs.writeFileSync(manifestPath, JSON.stringify(defApp, null, 2), 'utf8');
    }
  });

  // Seed sample notes
  const sampleNote = path.join(NOTES_DIR, 'Kinematics Lab Notes.md');
  if (!fs.existsSync(sampleNote)) {
    fs.writeFileSync(sampleNote, `# Kinematics Lab Notes\n\n## Projectile Motion Equations\n- Range: R = v² * sin(2θ) / g\n- Max Height: H = v² * sin²(θ) / (2g)\n- Flight Time: T = 2v * sin(θ) / g\n\n## Experiments\n- Tested on Earth (g = 9.81 m/s²)\n- Tested on Moon (g = 1.62 m/s²)\n- Tested on Mars (g = 3.72 m/s²)\n`, 'utf8');
  }

  // Seed sample Python script
  const sampleScript = path.join(PROJECTS_DIR, 'trajectory_solver.py');
  if (!fs.existsSync(sampleScript)) {
    fs.writeFileSync(sampleScript, `import math\n\ndef trajectory(v0, theta_deg, g=9.81):\n    rad = math.radians(theta_deg)\n    r = (v0**2 * math.sin(2 * rad)) / g\n    h = (v0**2 * (math.sin(rad)**2)) / (2 * g)\n    t = (2 * v0 * math.sin(rad)) / g\n    return r, h, t\n\nv, theta = 50.0, 45.0\nr, h, t = trajectory(v, theta)\nprint(f"Initial Velocity: {v} m/s")\nprint(f"Launch Angle:     {theta}°")\nprint(f"Horizontal Range: {r:.2f} m")\nprint(f"Maximum Height:   {h:.2f} m")\nprint(f"Flight Time:      {t:.2f} s")\n`, 'utf8');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#090D16',
    title: 'HK OS — The Learning Operating System',
    autoHideMenuBar: true,
    show: false, // will show when ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true
    }
  });

  const indexPath = path.join(__dirname, '../dist/renderer/index.html');
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  }, 1000);

  // Handle OAuth and external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('accounts.google.com') || url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ----------------------------------------------------
// IPC HANDLERS — REAL APPS, REAL FILES, REAL EXECUTION
// ----------------------------------------------------

// 1. Dynamic Apps Scanner
ipcMain.handle('apps:list', async () => {
  ensureDirectories();
  const entries = fs.readdirSync(APPS_DIR, { withFileTypes: true });
  const apps = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const manifestPath = path.join(APPS_DIR, entry.name, 'app.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const raw = fs.readFileSync(manifestPath, 'utf8');
          const data = JSON.parse(raw);
          apps.push(data);
        } catch (err) {
          console.error(`Error loading manifest in ${entry.name}:`, err);
        }
      }
    }
  }

  return apps;
});

// 2. Install Web App Manifest
ipcMain.handle('apps:install-web', async (event, appData) => {
  try {
    const appDir = path.join(APPS_DIR, appData.id);
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }
    const manifestPath = path.join(appDir, 'app.json');
    fs.writeFileSync(manifestPath, JSON.stringify(appData, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 3. Delete App Folder
ipcMain.handle('apps:delete', async (event, appId) => {
  try {
    const appDir = path.join(APPS_DIR, appId);
    if (fs.existsSync(appDir)) {
      fs.rmSync(appDir, { recursive: true, force: true });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 4. Launch Native Executable
ipcMain.handle('apps:launch-native', async (event, executablePath) => {
  try {
    const child = spawn(executablePath, [], { detached: true, stdio: 'ignore' });
    child.unref();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 5. Real Filesystem: List Directory
ipcMain.handle('fs:list', async (event, subPath = '') => {
  try {
    ensureDirectories();
    const targetDir = path.resolve(HKOS_ROOT, subPath);
    // Security check: stay inside HKOS_ROOT
    if (!targetDir.startsWith(HKOS_ROOT)) {
      throw new Error('Access denied: Outside HK OS root');
    }
    if (!fs.existsSync(targetDir)) return [];

    const items = fs.readdirSync(targetDir, { withFileTypes: true });
    return items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      size: item.isDirectory() ? 0 : fs.statSync(path.join(targetDir, item.name)).size,
      updatedAt: fs.statSync(path.join(targetDir, item.name)).mtime.toISOString(),
    }));
  } catch (err) {
    console.error('fs:list error:', err);
    return [];
  }
});

// 6. Real Filesystem: Read File
ipcMain.handle('fs:read', async (event, filePath) => {
  try {
    const fullPath = path.resolve(HKOS_ROOT, filePath);
    if (!fullPath.startsWith(HKOS_ROOT)) throw new Error('Access denied');
    if (!fs.existsSync(fullPath)) return { success: false, error: 'File not found' };
    const content = fs.readFileSync(fullPath, 'utf8');
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 7. Real Filesystem: Write File
ipcMain.handle('fs:write', async (event, { filePath, content }) => {
  try {
    const fullPath = path.resolve(HKOS_ROOT, filePath);
    if (!fullPath.startsWith(HKOS_ROOT)) throw new Error('Access denied');
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    return { success: true, path: fullPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 8. Real Filesystem: Delete File / Folder
ipcMain.handle('fs:delete', async (event, filePath) => {
  try {
    const fullPath = path.resolve(HKOS_ROOT, filePath);
    if (!fullPath.startsWith(HKOS_ROOT)) throw new Error('Access denied');
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 9. Real Filesystem: Create Folder
ipcMain.handle('fs:mkdir', async (event, folderPath) => {
  try {
    const fullPath = path.resolve(HKOS_ROOT, folderPath);
    if (!fullPath.startsWith(HKOS_ROOT)) throw new Error('Access denied');
    fs.mkdirSync(fullPath, { recursive: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 10. Real Code Execution via Subprocess (Python / Node)
ipcMain.handle('exec:run', async (event, { language, code }) => {
  return new Promise(resolve => {
    ensureDirectories();
    const startTime = Date.now();
    const ext = language === 'python' ? 'py' : 'js';
    const tempFile = path.join(PROJECTS_DIR, `_exec_temp.${ext}`);
    fs.writeFileSync(tempFile, code, 'utf8');

    const cmd = language === 'python' ? 'python' : 'node';
    const args = ['-u', tempFile];

    let stdout = '';
    let stderr = '';

    const proc = spawn(cmd, args, { cwd: PROJECTS_DIR, shell: true });

    proc.stdout.on('data', data => { stdout += data.toString(); });
    proc.stderr.on('data', data => { stderr += data.toString(); });

    proc.on('error', err => {
      resolve({
        success: false,
        stdout,
        stderr: `Failed to spawn ${cmd}: ${err.message}`,
        exitCode: -1,
        durationMs: Date.now() - startTime
      });
    });

    proc.on('close', code => {
      resolve({
        success: code === 0,
        stdout,
        stderr,
        exitCode: code,
        durationMs: Date.now() - startTime
      });
    });
  });
});

// 11. Real Winget Installation Engine
ipcMain.handle('winget:install', async (event, { packageId, appName, icon = 'Terminal', executable = '' }) => {
  return new Promise(resolve => {
    const channel = `winget:log:${packageId}`;
    let output = '';

    const proc = spawn('winget', [
      'install',
      '--id', packageId,
      '--exact',
      '--accept-source-agreements',
      '--accept-package-agreements'
    ], { shell: true });

    proc.stdout.on('data', data => {
      const text = data.toString();
      output += text;
      if (mainWindow) {
        mainWindow.webContents.send(channel, { type: 'stdout', text });
      }
    });

    proc.stderr.on('data', data => {
      const text = data.toString();
      output += text;
      if (mainWindow) {
        mainWindow.webContents.send(channel, { type: 'stderr', text });
      }
    });

    proc.on('close', code => {
      if (code === 0) {
        // Automatically register as native app in HK OS apps directory!
        const appDir = path.join(APPS_DIR, packageId.toLowerCase().replace(/[^a-z0-9]/g, '-'));
        if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });
        const manifest = {
          id: packageId.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: appName || packageId,
          icon: icon || 'Terminal',
          type: 'native',
          executable: executable || packageId,
          packageId,
          installedAt: new Date().toISOString()
        };
        fs.writeFileSync(path.join(appDir, 'app.json'), JSON.stringify(manifest, null, 2), 'utf8');

        resolve({ success: true, exitCode: code, output });
      } else {
        resolve({ success: false, exitCode: code, output, error: `winget exited with code ${code}` });
      }
    });

    proc.on('error', err => {
      resolve({ success: false, exitCode: -1, error: err.message, output });
    });
  });
});

// 12. Open External URL (e.g. for Google OAuth)
ipcMain.handle('shell:open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    rootPath: HKOS_ROOT,
    python: true,
    winget: true
  };
});

app.whenReady().then(() => {
  ensureDirectories();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
