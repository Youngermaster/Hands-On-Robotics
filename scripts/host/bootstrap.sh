#!/usr/bin/env bash
# scripts/host/bootstrap.sh
# One-shot installer for the dev-machine toolchain (macOS + Linux).
#
# Installs (skipping anything already present):
#   - uv         (Python package manager)
#   - pre-commit (via uv tool install)
#   - pipx       (only on Linux; macOS already has it via Homebrew if needed)
#   - PlatformIO (via pipx, used for Arduino / ESP32 / Pico builds)
#   - arduino-cli (for direct flashing fallback)
#   - cmake      (header-check + clang-tidy)
#   - clang-format / clang-tidy (via Homebrew on macOS, apt on Debian-likes)
#
# On Raspberry Pi / Jetson, run scripts/platform/* instead.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"

OS="$(detect_os)"
ARCH="$(detect_arch)"

log_info "OS=${OS} ARCH=${ARCH}"

install_with_brew_or_apt() {
  local pkg="$1"
  case "${OS}" in
    macos)
      require_cmd brew || {
        log_err "Homebrew not installed. https://brew.sh"
        return 1
      }
      brew list --formula "${pkg}" >/dev/null 2>&1 || brew install "${pkg}"
      ;;
    linux)
      sudo apt-get update -y
      sudo apt-get install -y "${pkg}"
      ;;
    *)
      log_err "unsupported OS for package install: ${OS}"
      return 1
      ;;
  esac
}

# ---------------------------------------------------------------------------
# uv
# ---------------------------------------------------------------------------
if command -v uv >/dev/null 2>&1; then
  log_info "uv already installed: $(uv --version)"
else
  log_info "installing uv…"
  curl -LsSf https://astral.sh/uv/install.sh | sh
  # uv installs into ~/.cargo/bin or ~/.local/bin depending on OS.
  export PATH="${HOME}/.local/bin:${HOME}/.cargo/bin:${PATH}"
fi

# ---------------------------------------------------------------------------
# pipx (Linux). macOS users typically have it via brew.
# ---------------------------------------------------------------------------
if ! command -v pipx >/dev/null 2>&1; then
  case "${OS}" in
    macos) install_with_brew_or_apt pipx ;;
    linux)
      install_with_brew_or_apt pipx
      pipx ensurepath || true
      ;;
  esac
fi

# ---------------------------------------------------------------------------
# pre-commit
# ---------------------------------------------------------------------------
if command -v pre-commit >/dev/null 2>&1; then
  log_info "pre-commit already installed: $(pre-commit --version)"
else
  log_info "installing pre-commit via uv tool…"
  uv tool install pre-commit
fi

# ---------------------------------------------------------------------------
# PlatformIO
# ---------------------------------------------------------------------------
if command -v pio >/dev/null 2>&1; then
  log_info "PlatformIO already installed: $(pio --version)"
else
  log_info "installing PlatformIO via pipx…"
  pipx install platformio
fi

# ---------------------------------------------------------------------------
# arduino-cli (fallback for boards PIO can't reach)
# ---------------------------------------------------------------------------
if ! command -v arduino-cli >/dev/null 2>&1; then
  case "${OS}" in
    macos) install_with_brew_or_apt arduino-cli ;;
    linux)
      log_info "installing arduino-cli via official installer…"
      curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh |
        BINDIR="${HOME}/.local/bin" sh
      ;;
  esac
fi

# ---------------------------------------------------------------------------
# C/C++ toolchain bits
# ---------------------------------------------------------------------------
for pkg in cmake clang-format clang-tidy shellcheck shfmt; do
  if ! command -v "${pkg}" >/dev/null 2>&1; then
    log_info "installing ${pkg}…"
    install_with_brew_or_apt "${pkg}" || log_warn "skipped ${pkg} (install manually if needed)"
  fi
done

# ---------------------------------------------------------------------------
# Repo hooks + dependencies
# ---------------------------------------------------------------------------
REPO_ROOT="$(git -C "${SCRIPT_DIR}" rev-parse --show-toplevel)"
cd "${REPO_ROOT}"

log_info "installing pre-commit hooks…"
pre-commit install --install-hooks || log_warn "pre-commit install failed (network?)"

log_info "syncing Python workspace via uv…"
uv sync --extra dev || log_warn "uv sync failed (network?)"

log_info "bootstrap complete. try:  pre-commit run --all-files"
