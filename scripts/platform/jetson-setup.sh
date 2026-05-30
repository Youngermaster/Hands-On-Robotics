#!/usr/bin/env bash
# scripts/platform/jetson-setup.sh
# Run THIS on the Jetson Nano (NOT on your laptop).
# Expects JetPack 4.6.x already flashed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"

if [[ "$(detect_os)" != "linux" ]]; then
  log_err "this script must run on the Jetson Nano (Linux)."
  exit 1
fi

if ! command -v nvpmodel >/dev/null 2>&1; then
  log_warn "nvpmodel not found — is this really a Jetson with JetPack installed?"
fi

log_info "updating apt…"
sudo apt-get update -y

log_info "installing system packages…"
sudo apt-get install -y \
  build-essential cmake git curl pkg-config \
  python3-dev python3-pip python3-venv \
  python3-opencv \
  i2c-tools libi2c-dev

if ! command -v uv >/dev/null 2>&1; then
  log_info "installing uv…"
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="${HOME}/.local/bin:${PATH}"
fi

if ! command -v jtop >/dev/null 2>&1; then
  log_info "installing jetson-stats (jtop)…"
  sudo -H pip3 install jetson-stats
fi

log_info "syncing Python workspace via uv (with Jetson extras)…"
REPO_ROOT="$(git -C "${SCRIPT_DIR}" rev-parse --show-toplevel)"
cd "${REPO_ROOT}"
uv sync --extra m01-jetson-nano

log_info "switching to MAXN performance mode (recommended for ML modules)…"
sudo nvpmodel -m 0 || log_warn "nvpmodel failed (already set?)"
sudo jetson_clocks || log_warn "jetson_clocks failed"

log_info "jetson-setup complete."
