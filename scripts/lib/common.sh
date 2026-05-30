#!/usr/bin/env bash
# scripts/lib/common.sh
# Shared shell helpers. Sourced by every other script. Never executed directly.
#
# Usage:
#   #!/usr/bin/env bash
#   set -euo pipefail
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
#   source "${SCRIPT_DIR}/../lib/common.sh"
#
# Provides:
#   log_info / log_warn / log_err   — colorized logging to stderr
#   require_cmd <name>              — fail fast if a command is missing
#   detect_os                       — echoes "macos" | "linux" | "unknown"
#   detect_arch                     — echoes "x86_64" | "arm64" | etc.
#   confirm "prompt"                — y/N prompt; returns 0 on yes

# Colors (only when stderr is a TTY).
if [[ -t 2 ]]; then
  _C_RED=$'\033[31m'
  _C_YEL=$'\033[33m'
  _C_GRN=$'\033[32m'
  _C_DIM=$'\033[2m'
  _C_RST=$'\033[0m'
else
  _C_RED="" _C_YEL="" _C_GRN="" _C_DIM="" _C_RST=""
fi

log_info() { printf '%s[info]%s %s\n' "${_C_GRN}" "${_C_RST}" "$*" >&2; }
log_warn() { printf '%s[warn]%s %s\n' "${_C_YEL}" "${_C_RST}" "$*" >&2; }
log_err() { printf '%s[err ]%s %s\n' "${_C_RED}" "${_C_RST}" "$*" >&2; }
log_dim() { printf '%s%s%s\n' "${_C_DIM}" "$*" "${_C_RST}" >&2; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_err "required command not found: $1"
    return 1
  fi
}

detect_os() {
  case "$(uname -s)" in
    Darwin) echo "macos" ;;
    Linux) echo "linux" ;;
    *) echo "unknown" ;;
  esac
}

detect_arch() {
  case "$(uname -m)" in
    x86_64 | amd64) echo "x86_64" ;;
    arm64 | aarch64) echo "arm64" ;;
    armv7l) echo "armv7" ;;
    armv6l) echo "armv6" ;;
    *) echo "$(uname -m)" ;;
  esac
}

confirm() {
  local prompt="${1:-Continue?} [y/N] "
  local reply
  read -r -p "${prompt}" reply
  [[ "${reply}" =~ ^[Yy]$ ]]
}
