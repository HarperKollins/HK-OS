# HK OS — The Learning Operating System
**Powered by HK AI (hkai.site)**

[![HK OS — Build Desktop App](https://github.com/HarperKollins/HK-OS/actions/workflows/build-desktop.yml/badge.svg)](https://github.com/HarperKollins/HK-OS/actions/workflows/build-desktop.yml)
[![HK OS — Build Ubuntu ISO](https://github.com/HarperKollins/HK-OS/actions/workflows/build-iso.yml/badge.svg)](https://github.com/HarperKollins/HK-OS/actions/workflows/build-iso.yml)

HK OS is a computing environment dedicated to learning. Rather than placing educational tools inside disconnected browser tabs or conventional web portals, HK OS establishes an integrated operating ecosystem where learners study, experiment, code, write, and demonstrate mastery in one cohesive workspace.

---

## 1. Architecture: Two Deliverables

HK OS is engineered with two distinct build targets sharing unified design tokens, shell architecture, and learning event models:

```
HK OS Project
├── TARGET A: Desktop Application (Windows)
│   ├── Framework: Electron 35 + React 19 + TypeScript + Tailwind CSS
│   ├── Distribution: NSIS Installer (.exe) & Portable Executable
│   └── Purpose: Instant deployment on standard Windows workstations
│
└── TARGET B: Full Operating System Image (Ubuntu 24.04 LTS)
    ├── Base: Ubuntu 24.04 LTS (Noble Numbat)
    ├── Build Tooling: live-build (automated in GitHub Actions CI)
    ├── Desktop Shell: GNOME Desktop + HK OS Custom Environment
    ├── Pre-installed: LibreOffice (MPL 2.0), VSCodium (MIT), JupyterLab (BSD)
    └── Target: Bootable Hybrid ISO for VMware, VirtualBox, or USB flash
```

---

## 2. Integrated Applications & Capabilities

| Application | Role & Implementation | License / Integration |
|---|---|---|
| **HK AI** | Core learning companion and roadmap navigator. Connects directly to [hkai.site](https://hkai.site) | Real product integration |
| **HK Simulation** | Interactive 2D projectile motion laboratory using HTML5 Canvas with real kinematic equations ($R = \frac{v^2\sin(2\theta)}{g}$, $H = \frac{v^2\sin^2\theta}{2g}$, $T = \frac{2v\sin\theta}{g}$) | Custom engine |
| **HK Code Lab** | Code editor with syntax styling, line numbers, and deterministic execution console | Custom + VSCodium integration |
| **HK Docs** | Academic notebook with Markdown preview, word counters, and flashcard recall mode | Custom (Desktop) / LibreOffice Writer (OS) |
| **Digital Schools** | Institutional learning environments (e.g. Hallbridge University, Meridian School, Nova Academy) | Multi-tenant campus model |
| **Learning Media** | Lectures, interactive slide decks, and textbooks directly mapped to roadmap milestones | Educational media player |
| **Edu-Store** | Application registry for installing educational simulation and STEM extensions | Package registry |
| **Exam & Focus Modes** | Timed assessments with security telemetry and distraction-reduced learning workspaces | UI-level & Session policies |

---

## 3. Real HK AI Integration

HK AI already exists at **https://hkai.site** as a full-featured AI learning companion with authentication and course generation. 

- HK OS integrates the live product rather than fabricating a duplicate or mock AI.
- In the desktop application, HK AI is accessible directly through internal views and context-bridged links.
- The OS shell monitors learning context and updates system indicators accordingly.

---

## 4. Building & Running Locally

### Prerequisites
- Node.js 20+
- npm 10+

### Development Server (Web Shell)
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### Electron Desktop Application
```bash
# Run in Electron
npm run electron:dev

# Package Windows Installer & Portable EXE
npm run electron:dist
```
Output binaries will be generated in `dist-electron/`.

---

## 5. Ubuntu-Based Operating System Image (Target B)

The bootable Ubuntu image is defined in `packages/image/`:
- `packages/image/auto/config` — `live-build` configurations
- `packages/image/config/package-lists/hkos.list.chroot` — package dependencies (GNOME, Python, Node.js, LibreOffice)
- `packages/image/config/hooks/live/0100-hkos-setup.hook.chroot` — automated setup for VSCodium and JupyterLab
- `packages/image/build.sh` — deterministic, reproducible build script

### Building the ISO
Because generating a bootable Linux image requires loop devices, squashfs compression, and chroot environments, image builds are executed in **GitHub Actions on `ubuntu-24.04` runners**:
1. Push a release tag: `git tag v0.1.0 && git push origin v0.1.0`
2. Or trigger manually via **Actions → HK OS — Build Ubuntu ISO → Run workflow**.
3. Download the resulting `.iso` artifact and `SHA256SUMS.txt`.

### Testing in VMware Workstation / Player
1. Create a new Virtual Machine.
2. Select **Installer disc image file (iso)** and browse to the generated `hk-os-v0.1-*.iso`.
3. Guest operating system: **Linux** → **Ubuntu 64-bit**.
4. Memory: **4 GB minimum** (8 GB recommended). Disk: **20 GB**.
5. Power on the VM and select **Try or Install HK OS**.

---

## 6. Repository Structure

```
├── .github/
│   └── workflows/
│       ├── build-desktop.yml    # Windows installer CI
│       └── build-iso.yml        # Ubuntu 24.04 ISO CI
├── electron/
│   ├── main.cjs                 # Main process (window, IPC)
│   └── preload.cjs              # Secure contextBridge
├── packages/
│   └── image/                   # Ubuntu live-build ISO files
├── src/
│   ├── apps/                    # Core educational applications
│   ├── shell/                   # OS Shell (TopBar, Dock, Desktop, Boot)
│   ├── store/                   # Zustand global state (system, learning, activity)
│   └── types/                   # Strict TypeScript contracts
├── electron-builder.yml         # Windows & Linux desktop packaging config
├── tailwind.config.js           # HK OS design tokens
└── vite.config.ts               # Vite bundler configuration
```

---

## 7. Authors & License

- **Architect & Maintainer:** Harper Kollins (<somtochukwucollins8@gmail.com>)
- **Ecosystem:** [HK AI](https://hkai.site)
- **License:** Proprietary shell with MPL 2.0, MIT, and BSD licensed open-source dependencies.
