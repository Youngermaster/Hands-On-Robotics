#!/usr/bin/env bash
# scripts/platform/rpi-setup.sh
# Run THIS on the Raspberry Pi (Zero W / 4), not on your laptop.
#
# Enables I2C/SPI/SSH, installs uv, lgpio, ffmpeg, libcamera tools.
# Idempotent — safe to re-run.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"

if [[ "$(detect_os)" != "linux" ]]; then
  log_err "this script must run on the Raspberry Pi (Linux)."
  exit 1
fi

if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
  log_warn "this doesn't look like a Raspberry Pi — continuing anyway"
fi

log_info "updating apt…"
sudo apt-get update -y
sudo apt-get upgrade -y

log_info "installing system packages…"
sudo apt-get install -y \
  build-essential cmake git curl \
  python3-dev python3-venv \
  ffmpeg libcamera-apps \
  i2c-tools \
  pkg-config

log_info "enabling I2C, SPI, and camera interfaces…"
sudo raspi-config nonint do_i2c 0 || log_warn "raspi-config: I2C toggle skipped"
sudo raspi-config nonint do_spi 0 || log_warn "raspi-config: SPI toggle skipped"
sudo raspi-config nonint do_camera 0 || log_warn "raspi-config: camera toggle skipped (newer OS may not need this)"

if ! command -v uv >/dev/null 2>&1; then
  log_info "installing uv…"
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="${HOME}/.local/bin:${PATH}"
fi

log_info "syncing Python workspace via uv (with RPi extras)…"
REPO_ROOT="$(git -C "${SCRIPT_DIR}" rev-parse --show-toplevel)"
cd "${REPO_ROOT}"

# Detect Zero W vs 4 by RAM (Zero W: 512 MB, 4: 2/4/8 GB).
mem_kb="$(awk '/MemTotal/ {print $2}' /proc/meminfo)"
if [[ "${mem_kb}" -lt 700000 ]]; then
  EXTRA="m01-rpi-zero-w"
else
  EXTRA="m01-rpi-4"
fi
log_info "detected Pi class — installing extra: ${EXTRA}"
uv sync --extra "${EXTRA}"

log_info "rpi-setup complete. you may need to reboot for I2C/SPI to be active."
