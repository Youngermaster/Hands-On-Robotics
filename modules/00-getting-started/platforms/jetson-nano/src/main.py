"""Module 00 — Jetson Nano.

Blinks an LED on GPIO 18 (BCM) and logs a heartbeat once per second.
The Nano has no user-controllable onboard LED, so wire a small LED:

    GPIO 18 → 220 Ω → LED anode, LED cathode → GND
"""

from __future__ import annotations

import time

from hor_common.gpio import open_gpio
from hor_common.logging import get_logger

LED_PIN = 18
HALF_PERIOD_S = 0.5

log = get_logger("m00.jetson-nano")


def main() -> None:
    log.info("hello, hands-on-robotics")
    with open_gpio("auto") as gpio:
        gpio.setup_output(LED_PIN, initial=False)
        try:
            while True:
                gpio.write(LED_PIN, True)
                log.info("tick")
                time.sleep(HALF_PERIOD_S)
                gpio.write(LED_PIN, False)
                time.sleep(HALF_PERIOD_S)
        except KeyboardInterrupt:
            log.info("bye")
        finally:
            gpio.write(LED_PIN, False)


if __name__ == "__main__":
    main()
