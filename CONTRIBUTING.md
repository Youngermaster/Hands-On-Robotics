# Contributing to Hands-On-Robotics

Thanks for wanting to add to the curriculum. This document is short and
opinionated — the goal is keeping every module uniform so newcomers always
know where to look.

## Ground rules

1. **One module = one concept.** If you're tempted to mix "I2C OLED" and
   "Wi-Fi MQTT" in the same module, split them.
2. **Hardware variants live inside the module**, never at the top level.
   No top-level `Arduino/` or `ESP32/` folders.
3. **`common/` is earned, not assigned.** Only promote code to `common/`
   once **two or more** modules use it. Premature abstraction is worse
   than a small amount of duplication.
4. **CMakeLists are teaching artifacts.** Every non-trivial `CMakeLists.txt`
   is commented line-by-line. See [`docs/conventions/cmake-style.md`](./docs/conventions/cmake-style.md).
5. **No hardcoded paths.** Use `pathlib`, `std::filesystem`, or environment
   variables — never `"cascades/haarcascade_frontalface.xml"`.
6. **Run the gates locally:** `pre-commit run --all-files` must be green.

## Adding a new module

1. Copy the latest implemented module (currently `modules/01-digital-io/`)
   to `modules/NN-your-topic/`.
2. Update [`docs/curriculum.md`](./docs/curriculum.md) — promote your row
   from "planned" to "implemented" and add a link.
3. Fill in the module README using the
   [module-template](./docs/conventions/module-template.md). All headings
   are mandatory — CI checks for them.
4. For each platform variant, include:
   - A commented `platformio.ini` (MCUs) or `pyproject.toml` extra (SBCs).
   - A `scripts/flash.sh` (MCUs) or `scripts/run.sh` (SBCs).
   - A platform-specific `README.md` describing pins and quirks.
5. Add a wiring SVG per board family in `modules/NN-your-topic/wiring/`.
6. Add at least one test (`pytest` for Python, `GoogleTest` or unity for
   embedded if feasible).

## What belongs in `common/`

**Yes:**
- Structured logging.
- Config loading (YAML/TOML, validated).
- Generic interfaces like `IGpio` with mock + real backends.

**No:**
- `utils.py` grab-bags.
- Code touching a specific peripheral (e.g. `MPU6050` driver — that belongs
  in the sensors module).
- Anything used by exactly one module.
- `#ifdef ESP32` blocks. Backends live in their own files.

## Code style

| Language | Formatter            | Linter            | Type checker     |
| -------- | -------------------- | ----------------- | ---------------- |
| C/C++    | `clang-format`       | `clang-tidy`      | —                |
| Python   | `ruff format`        | `ruff` (+pylint subset) | `mypy`     |
| Rust     | `rustfmt`            | `clippy -D warnings` | —             |
| Shell    | `shfmt`              | `shellcheck`      | —                |
| Markdown | `markdownlint`       | —                 | —                |

All hooked up in [`.pre-commit-config.yaml`](./.pre-commit-config.yaml).

### Python specifics

- Python 3.11+.
- Type hints on all public APIs. `mypy --strict` for `common/`.
- Logging via `hor_common.logging` — never `print()` in library code.
- Hardware imports inside functions or guarded backends so the same module
  can be unit-tested on a laptop without the hardware libs installed.

### C++ specifics

- C++17 minimum, C++20 where the toolchain allows.
- RAII — no raw `new` / `delete`.
- For Arduino-flavour code, group setup/loop at the bottom; pull logic into
  small free functions or classes at the top of the file.

## Commit / PR

- Conventional-ish messages: `feat(m01): add Pico variant`, `fix(common): handle missing chip`, `docs(hw): pinout for Jetson`.
- PRs use the template in [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md).
- CI must be green (lint + builds + tests).

## Salvaging code from other repos

The author maintains `~/GitHub/Youngermaster/Raspberry-Pi-Codes` with older
GPIO and OpenCV examples. **Do not copy verbatim.** Re-implement against
the conventions here: typed, tested, no hardcoded paths, per-example
README, modular.

## License

By contributing, you agree that your contribution is licensed under the MIT
License (see [LICENSE](./LICENSE)).
