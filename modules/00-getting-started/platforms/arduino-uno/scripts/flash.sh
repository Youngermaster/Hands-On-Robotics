#!/usr/bin/env bash
# Compile + upload + open the serial monitor.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
pio run --target upload
exec pio device monitor
