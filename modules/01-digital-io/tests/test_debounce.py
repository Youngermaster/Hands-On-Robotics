"""Tests for the module-local FallingEdgeDebouncer."""

from __future__ import annotations

import sys
from pathlib import Path

# Add the module-local common folder to sys.path so tests can import it
# without us having to ship a pyproject for every module.
_MODULE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_MODULE_ROOT))

from common.debounce import FallingEdgeDebouncer  # noqa: E402


def test_press_after_debounce_period_fires_once() -> None:
    deb = FallingEdgeDebouncer(debounce_s=0.03)
    # raw=True is idle (button not pressed). Switch to pressed (LOW) and
    # hold long enough.
    assert deb.update(raw=False, now_s=0.000) is False  # signal just changed
    assert deb.update(raw=False, now_s=0.020) is False  # too soon
    assert deb.update(raw=False, now_s=0.040) is True  # stable for >30 ms → fire
    assert deb.update(raw=False, now_s=0.060) is False  # already accepted; no repeat


def test_bounce_inside_debounce_window_is_filtered() -> None:
    deb = FallingEdgeDebouncer(debounce_s=0.03)
    deb.update(raw=False, now_s=0.000)
    # Bounce back up after 5 ms — must NOT fire.
    deb.update(raw=True, now_s=0.005)
    deb.update(raw=False, now_s=0.010)
    deb.update(raw=True, now_s=0.012)
    deb.update(raw=False, now_s=0.015)
    # Now stable LOW from 0.015 — needs +30 ms.
    assert deb.update(raw=False, now_s=0.044) is False
    assert deb.update(raw=False, now_s=0.046) is True


def test_release_does_not_fire() -> None:
    deb = FallingEdgeDebouncer(debounce_s=0.03)
    # Press
    deb.update(raw=False, now_s=0.000)
    assert deb.update(raw=False, now_s=0.040) is True
    # Release — rising edge, must not fire
    deb.update(raw=True, now_s=0.100)
    assert deb.update(raw=True, now_s=0.150) is False


def test_two_distinct_presses_fire_twice() -> None:
    deb = FallingEdgeDebouncer(debounce_s=0.03)
    deb.update(raw=False, now_s=0.000)
    assert deb.update(raw=False, now_s=0.040) is True
    # Release
    deb.update(raw=True, now_s=0.080)
    deb.update(raw=True, now_s=0.115)
    # Second press
    deb.update(raw=False, now_s=0.200)
    assert deb.update(raw=False, now_s=0.240) is True
