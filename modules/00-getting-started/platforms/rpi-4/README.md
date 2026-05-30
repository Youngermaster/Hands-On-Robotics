# Module 00 — Raspberry Pi 4 (2 GB)

The Pi 4 runs the same code path as the Zero W — `hor_common.gpio` picks
the `lgpio` backend on both, the BCM pinout is identical, and the script
is identical.

To avoid duplication, this folder doesn't re-ship the script. Run from the
Zero W folder:

```bash
uv run python modules/00-getting-started/platforms/rpi-zero-w/src/main.py
```

Or the wrapper:

```bash
./modules/00-getting-started/platforms/rpi-zero-w/scripts/run.sh
```

See [`../rpi-zero-w/`](../rpi-zero-w/) for everything.

## When to deviate from Zero W

You'd only ship a Pi-4-specific variant when the module needs more CPU,
USB-3 bandwidth, or a Pi-4-only peripheral (CSI camera at high FPS,
LiDAR over USB 3, ROS2). Module 00 doesn't.
