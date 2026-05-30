# Module 01 — Raspberry Pi 4 (2 GB)

The Pi 4 runs the same code as the Zero W — identical 40-pin pinout,
identical `lgpio` backend, identical logic.

Run from the Zero W folder:

```bash
uv sync --extra m01-rpi-4
uv run python modules/01-digital-io/platforms/rpi-zero-w/src/main.py
```

See [`../rpi-zero-w/`](../rpi-zero-w/) for everything else.

## When you'd ship a Pi-4-specific variant

When the module wants:

- Multi-threaded GPIO reads (Zero W is single-core).
- More than ~50 GPIO interrupts/s (Zero W struggles).
- Concurrent OpenCV / ML inference (Zero W is too slow).

Module 01 doesn't.
