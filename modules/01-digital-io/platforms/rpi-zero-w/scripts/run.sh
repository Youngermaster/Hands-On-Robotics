#!/usr/bin/env bash
set -euo pipefail
REPO="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
cd "${REPO}"
exec uv run python modules/01-digital-io/platforms/rpi-zero-w/src/main.py
