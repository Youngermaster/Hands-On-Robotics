#!/usr/bin/env bash
# Compiles to .uf2 and flashes via the Pico bootloader.
# First time: hold BOOTSEL while plugging the Pico in.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
pio run --target upload
exec pio device monitor
