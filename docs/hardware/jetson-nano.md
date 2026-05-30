# NVIDIA Jetson Nano (4 GB)

ARMv8 quad-core + 128-core Maxwell GPU. The "ML brain" of the curriculum
— used from module 10 (vision) onward.

## At a glance

| Spec         | Value                                                  |
| ------------ | ------------------------------------------------------ |
| CPU          | Quad-core Cortex-A57 @ 1.43 GHz                        |
| GPU          | 128-core Maxwell, ~472 GFLOPS FP16                     |
| RAM          | 4 GB LPDDR4 (shared CPU/GPU)                           |
| Storage      | microSD (recommend 64 GB+ for JetPack)                 |
| GPIO         | 40-pin header (Pi-style, but BCM numbering differs)    |
| Wireless     | none onboard — bring USB Wi-Fi/Bluetooth or M.2 module |

## OS install (JetPack)

1. Download **JetPack 4.6.x** (last release for Nano) from
   https://developer.nvidia.com/jetpack-sdk-46.
2. Flash to microSD with
   [balenaEtcher](https://www.balena.io/etcher/) or `dd`.
3. First boot: complete the Ubuntu first-run wizard on an attached monitor.
4. Then:

```bash
./scripts/platform/jetson-setup.sh   # installs uv, opencv-python, jetson-stats
```

## Why Jetson and not Pi 4?

- **CUDA-accelerated OpenCV / PyTorch / TensorRT.**
- **Better camera bandwidth** for higher-resolution / higher-FPS pipelines.
- **Hardware video encoders/decoders** for streaming.

Trade-offs:

- **Larger, hotter, hungrier** — needs active cooling and 5 V / 4 A.
- **JetPack 4 is stuck on Ubuntu 18.04 + Python 3.6 by default**.
  This repo runs newer Python via `uv` (which installs its own Python
  toolchain), then uses `system-site-packages` to reach the CUDA libs.

## GPIO from Python

Use [`Jetson.GPIO`](https://github.com/NVIDIA/jetson-gpio). API is mostly
compatible with `RPi.GPIO`. Note: **pin numbers differ from the Pi** —
always reference the Jetson Nano pinout, not the Pi pinout.

```python
import Jetson.GPIO as GPIO

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)
GPIO.output(18, GPIO.HIGH)
```

`hor_common.gpio.JetsonGpio` (added in module 01) wraps this.

## Quirks

- **No on-board Wi-Fi.** Use a USB Wi-Fi dongle or the M.2 E-key slot.
- **Heat:** active cooling (PWM fan) recommended for sustained ML loads.
- **Power mode:** by default the Nano boots in 10 W mode. Switch to MAXN
  for ML-heavy modules: `sudo nvpmodel -m 0 && sudo jetson_clocks`.
- **JetPack 4 is EOL** — NVIDIA has moved on to Orin. We pin to JetPack
  4.6.x because that's what runs on the Nano hardware.

## Modules that target this board

- [00 getting-started](../../modules/00-getting-started/platforms/jetson-nano/)
- [01 digital-io](../../modules/01-digital-io/platforms/jetson-nano/)
- Planned: 09 sensors-and-fusion, 10 computer-vision, 11 lidar-and-slam, 12 ros2-integration, 13 autonomous-driving
