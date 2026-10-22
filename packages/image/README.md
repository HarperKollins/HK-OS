# HK OS Ubuntu Image

This directory contains the `live-build` configuration for the bootable HK OS Ubuntu image.

## Building

The ISO **must** build on a native Linux environment. GitHub Actions handles this automatically.

**Trigger a build:** Push a `v*` tag or use Actions → Build Ubuntu ISO → Run workflow.

## Testing in VMware

1. VMware Workstation/Player → New VM → Use ISO image
2. Select the downloaded `.iso`
3. RAM: 4 GB | Storage: 20 GB | Network: NAT
4. Boot → select Try or Install HK OS

## What is pre-installed

| App | License | Purpose |
|-----|---------|--------|
| Ubuntu 24.04 GNOME | GPL/LGPL | Base OS + desktop |
| LibreOffice | MPL 2.0 | Docs, slides, spreadsheets |
| VSCodium | MIT | Code editor (no telemetry) |
| JupyterLab | BSD | Notebooks + Python |
| Firefox | MPL 2.0 | Browser → hkai.site |
