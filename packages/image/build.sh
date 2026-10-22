#!/usr/bin/env bash
set -euo pipefail

echo "╔══════════════════════════════════════╗"
echo "║  HK OS Image Builder v0.1            ║"
echo "║  Ubuntu 24.04 LTS (Noble Numbat)     ║"
echo "╚══════════════════════════════════════╝"

export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
export BUILD_COMMIT=${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo 'local')}
export SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH:-$(date -u +%s)}

sed -i "s/__BUILD_DATE__/${BUILD_DATE}/g" config/includes.chroot/etc/hkos/version.json
sed -i "s/__BUILD_COMMIT__/${BUILD_COMMIT}/g" config/includes.chroot/etc/hkos/version.json

echo "[*] Build date: ${BUILD_DATE}"
echo "[*] Commit:     ${BUILD_COMMIT}"

echo "[*] Cleaning previous build..."
sudo lb clean --purge 2>/dev/null || true

echo "[*] Configuring live-build..."
sudo lb config

echo "[*] Building ISO (takes 20-40 min)..."
sudo lb build

ISO_NAME="hk-os-v0.1-$(date +%Y%m%d)-amd64.iso"
if ls *.iso 1>/dev/null 2>&1; then
  mv *.iso "${ISO_NAME}"
  echo "[OK] ISO built: ${ISO_NAME}"
  sha256sum "${ISO_NAME}" > "${ISO_NAME}.sha256"
else
  echo "[FAIL] Build failed - no ISO produced."
  exit 1
fi
