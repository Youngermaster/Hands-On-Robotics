"""Hardware-abstracted GPIO with mock and real backends.

The point of this module is **testability**: every module that touches
GPIO depends on the ``Gpio`` protocol, not a specific hardware library.
Tests run on macOS using ``MockGpio``; real Pi / Jetson code picks the
matching backend at runtime via ``open_gpio()``.

Backends:
  - ``MockGpio``    — always available; records every call for assertions.
  - ``LgpioGpio``   — Raspberry Pi (Zero W / 4), via the ``lgpio`` library.
  - ``JetsonGpio``  — Jetson Nano, via ``Jetson.GPIO``.

Importing real backends is *lazy* — they're only loaded when ``open_gpio``
is asked for them, so a laptop without ``lgpio`` installed can still run
the test suite.
"""

from __future__ import annotations

import contextlib
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Protocol, Self, runtime_checkable


class Direction(StrEnum):
    """GPIO pin direction."""

    INPUT = "input"
    OUTPUT = "output"


class Pull(StrEnum):
    """Internal pull-resistor configuration for inputs."""

    NONE = "none"
    UP = "up"
    DOWN = "down"


class Edge(StrEnum):
    """Interrupt edge selector."""

    RISING = "rising"
    FALLING = "falling"
    BOTH = "both"


@runtime_checkable
class Gpio(Protocol):
    """Minimal GPIO interface every backend implements."""

    def setup_output(self, pin: int, *, initial: bool = False) -> None: ...
    def setup_input(self, pin: int, *, pull: Pull = Pull.NONE) -> None: ...
    def write(self, pin: int, value: bool) -> None: ...
    def read(self, pin: int) -> bool: ...
    def close(self) -> None: ...

    def __enter__(self) -> Self: ...
    def __exit__(self, *_: object) -> None: ...


# ---------------------------------------------------------------------------
# Mock backend (always available)
# ---------------------------------------------------------------------------


@dataclass
class _PinState:
    direction: Direction
    pull: Pull = Pull.NONE
    value: bool = False


@dataclass
class MockGpio:
    """In-memory GPIO. Records calls so tests can assert what happened."""

    pins: dict[int, _PinState] = field(default_factory=dict)
    writes: list[tuple[int, bool]] = field(default_factory=list)
    closed: bool = False

    def setup_output(self, pin: int, *, initial: bool = False) -> None:
        self.pins[pin] = _PinState(direction=Direction.OUTPUT, value=initial)
        self.writes.append((pin, initial))

    def setup_input(self, pin: int, *, pull: Pull = Pull.NONE) -> None:
        self.pins[pin] = _PinState(direction=Direction.INPUT, pull=pull)

    def write(self, pin: int, value: bool) -> None:
        state = self._require(pin, Direction.OUTPUT)
        state.value = value
        self.writes.append((pin, value))

    def read(self, pin: int) -> bool:
        state = self._require(pin, Direction.INPUT)
        return state.value

    def set_input(self, pin: int, value: bool) -> None:
        """Test helper: simulate an external signal on an input pin."""
        state = self._require(pin, Direction.INPUT)
        state.value = value

    def close(self) -> None:
        self.closed = True

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def _require(self, pin: int, direction: Direction) -> _PinState:
        if pin not in self.pins:
            raise RuntimeError(f"pin {pin} not configured")
        state = self.pins[pin]
        if state.direction is not direction:
            raise RuntimeError(f"pin {pin} is {state.direction.value}, not {direction.value}")
        return state


# ---------------------------------------------------------------------------
# Real backends (lazy-imported)
# ---------------------------------------------------------------------------


class LgpioGpio:
    """Raspberry Pi backend using the ``lgpio`` library."""

    def __init__(self, chip_id: int = 0) -> None:
        import lgpio  # noqa: PLC0415 — intentionally lazy

        self._lgpio = lgpio
        self._handle = lgpio.gpiochip_open(chip_id)
        self._claimed: set[int] = set()

    def setup_output(self, pin: int, *, initial: bool = False) -> None:
        self._lgpio.gpio_claim_output(self._handle, pin, int(initial))
        self._claimed.add(pin)

    def setup_input(self, pin: int, *, pull: Pull = Pull.NONE) -> None:
        flags = {
            Pull.NONE: 0,
            Pull.UP: self._lgpio.SET_PULL_UP,
            Pull.DOWN: self._lgpio.SET_PULL_DOWN,
        }[pull]
        self._lgpio.gpio_claim_input(self._handle, pin, flags)
        self._claimed.add(pin)

    def write(self, pin: int, value: bool) -> None:
        self._lgpio.gpio_write(self._handle, pin, int(value))

    def read(self, pin: int) -> bool:
        return bool(self._lgpio.gpio_read(self._handle, pin))

    def close(self) -> None:
        for pin in list(self._claimed):
            with contextlib.suppress(Exception):
                self._lgpio.gpio_free(self._handle, pin)
        self._lgpio.gpiochip_close(self._handle)
        self._claimed.clear()

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()


class JetsonGpio:
    """Jetson Nano backend using ``Jetson.GPIO``."""

    def __init__(self) -> None:
        import Jetson.GPIO as gpio  # noqa: PLC0415 — intentionally lazy

        self._gpio = gpio
        self._gpio.setmode(gpio.BCM)
        self._gpio.setwarnings(False)
        self._claimed: set[int] = set()

    def setup_output(self, pin: int, *, initial: bool = False) -> None:
        level = self._gpio.HIGH if initial else self._gpio.LOW
        self._gpio.setup(pin, self._gpio.OUT, initial=level)
        self._claimed.add(pin)

    def setup_input(self, pin: int, *, pull: Pull = Pull.NONE) -> None:
        pull_map = {
            Pull.NONE: self._gpio.PUD_OFF,
            Pull.UP: self._gpio.PUD_UP,
            Pull.DOWN: self._gpio.PUD_DOWN,
        }
        self._gpio.setup(pin, self._gpio.IN, pull_up_down=pull_map[pull])
        self._claimed.add(pin)

    def write(self, pin: int, value: bool) -> None:
        self._gpio.output(pin, self._gpio.HIGH if value else self._gpio.LOW)

    def read(self, pin: int) -> bool:
        return bool(self._gpio.input(pin))

    def close(self) -> None:
        for pin in list(self._claimed):
            with contextlib.suppress(Exception):
                self._gpio.cleanup(pin)
        self._claimed.clear()

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------


def open_gpio(backend: str = "auto") -> Gpio:
    """Return a GPIO instance.

    ``backend`` is one of ``"auto"``, ``"mock"``, ``"lgpio"``, ``"jetson"``.
    ``"auto"`` picks the first importable real backend; falls back to mock.
    """
    if backend == "mock":
        return MockGpio()
    if backend == "lgpio":
        return LgpioGpio()
    if backend == "jetson":
        return JetsonGpio()
    if backend != "auto":
        raise ValueError(f"unknown backend: {backend}")

    # Auto: try real backends in order, fall back to mock.
    for ctor in (LgpioGpio, JetsonGpio):
        try:
            return ctor()
        except (ImportError, ModuleNotFoundError, OSError):
            continue
    return MockGpio()
