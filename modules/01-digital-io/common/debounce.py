"""Tiny edge-detecting debouncer used by the SBC variants of Module 01.

The pattern: poll a noisy boolean input at some rate; only accept the
*falling* edge (pressed-down) once the signal has been stable for
``debounce_s`` seconds.

This is the only "logic" in the module that's worth unit-testing — the
hardware-touching code is so thin (set up a pin, write to it) that
testing it doesn't catch real bugs.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class FallingEdgeDebouncer:
    """Yields one ``True`` per stable HIGH → LOW transition.

    ``debounce_s`` is the minimum time the signal must remain stable in
    its new state before that state is accepted.

    Usage:
        deb = FallingEdgeDebouncer(debounce_s=0.03)
        while True:
            now = time.monotonic()
            raw = gpio.read(BTN_PIN)
            if deb.update(raw, now):
                toggle_led()
            time.sleep(0.005)
    """

    debounce_s: float
    _last_raw: bool = True  # assume idle-HIGH (pull-up); first read won't fire
    _last_change_s: float = 0.0
    _stable_state: bool = True

    def update(self, raw: bool, now_s: float) -> bool:
        """Feed the latest raw reading; returns True on a debounced falling edge."""
        if raw != self._last_raw:
            self._last_raw = raw
            self._last_change_s = now_s
            return False

        # Signal has been stable in `raw` since `_last_change_s`. If it
        # stayed long enough AND it represents a change vs the previous
        # accepted stable state, emit an edge.
        if (now_s - self._last_change_s) >= self.debounce_s and raw != self._stable_state:
            self._stable_state = raw
            return raw is False  # falling edge only

        return False
