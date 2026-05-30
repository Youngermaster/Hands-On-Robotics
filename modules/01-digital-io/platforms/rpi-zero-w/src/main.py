"""Module 01 — Raspberry Pi Zero W.

Press a button on GPIO 27 → toggle an LED on GPIO 17.

Polling-based with a software debouncer (the `lgpio` library does support
edge callbacks, but polling at 200 Hz keeps the code identical to the
Jetson variant and easier to test).
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

from hor_common.gpio import Pull, open_gpio
from hor_common.logging import get_logger

# Pull in the module-local debouncer without packaging it.
_MODULE_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_MODULE_ROOT))
from common.debounce import FallingEdgeDebouncer  # noqa: E402

LED_PIN = 17
BTN_PIN = 27
DEBOUNCE_S = 0.03
POLL_S = 0.005  # 200 Hz

log = get_logger("m01.rpi-zero-w")


def main() -> None:
    deb = FallingEdgeDebouncer(debounce_s=DEBOUNCE_S)
    led_on = False
    with open_gpio("auto") as gpio:
        gpio.setup_output(LED_PIN, initial=False)
        gpio.setup_input(BTN_PIN, pull=Pull.UP)
        log.info("ready (button=GPIO%d, led=GPIO%d)", BTN_PIN, LED_PIN)

        try:
            while True:
                if deb.update(raw=gpio.read(BTN_PIN), now_s=time.monotonic()):
                    led_on = not led_on
                    gpio.write(LED_PIN, led_on)
                    log.info("toggle -> %s", "on" if led_on else "off")
                time.sleep(POLL_S)
        except KeyboardInterrupt:
            log.info("bye")
        finally:
            gpio.write(LED_PIN, False)


if __name__ == "__main__":
    main()
