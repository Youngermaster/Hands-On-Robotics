#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ ! -f "${HERE}/src/secrets.h" ]]; then
  echo "error: ${HERE}/src/secrets.h not found. Copy from secrets.h.example and fill in." >&2
  exit 1
fi
cd "${HERE}"
pio run --target upload
exec pio device monitor
