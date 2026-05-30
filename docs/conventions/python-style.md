# Python Style

The Python tooling is **uv** + **ruff** + **mypy**. All three run in
pre-commit and CI.

## Versions & layout

- Python **3.11+** everywhere. We use `match` statements and `Self`.
- All Python code lives either in `common/python/hor_common/` (the shared
  package) or `modules/NN-*/platforms/<board>/src/` (per-module scripts).
- No per-module virtualenvs. Run `uv sync --extra mNN-<platform>` to install
  the dependency group for a given module.

## Type hints

- **Required** on every public function and method.
- `from __future__ import annotations` at the top of every file (lets you
  use Python 3.12-flavor syntax on 3.11 and forward-refs without quoting).
- `mypy --strict` for `common/`; modules use the default mypy config.

```python
from __future__ import annotations

from typing import Protocol


class Pin(Protocol):
    def write(self, value: bool) -> None: ...
    def read(self) -> bool: ...
```

## Logging

```python
from hor_common.logging import get_logger

log = get_logger(__name__)
log.info("blinking led on pin %d", pin)
```

No `print()` in library code. CLIs may use `print()` for user output but
should still log internal state.

## Hardware imports

Hardware libs (`lgpio`, `Jetson.GPIO`, `RPi.GPIO`) must NOT be imported at
module top-level in shared code, because that breaks running tests on a
laptop. Two patterns:

1. **Backend split** (in `common/`): a generic interface in one file, each
   backend in its own file, conditional import in a factory.
2. **Local import** (in module scripts): import inside `main()`.

```python
def main() -> None:
    import lgpio  # only loaded when running on the Pi
    chip = lgpio.gpiochip_open(0)
    ...
```

## Tests

- `pytest`, no other framework.
- Tests for `hor_common` go in `common/python/hor_common/tests/`.
- Mock hardware via `hor_common.gpio.MockGpio` — never `unittest.mock` on
  the hardware-backend module itself.

## Ruff configuration

Lives in the root `pyproject.toml`. Key choices:

- `line-length = 100` — matches C++/Rust.
- `select = ["E","F","W","I","B","UP","SIM","RUF","C4","TID","PL"]`.
- `PLR2004` (magic numbers) is ignored — pin numbers ARE magic numbers.

## Docstrings

One-line docstrings only, unless the function does something genuinely
non-obvious. Don't restate the type hints in prose.
