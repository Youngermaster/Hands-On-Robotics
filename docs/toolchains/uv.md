# uv (Python workspace)

`uv` (https://docs.astral.sh/uv/) is the Python package manager for this
repo. It's a Rust-native replacement for pip + virtualenv + pip-tools:
fast, lockfile-based, and monorepo-aware.

## Why uv and not poetry / plain pip?

- **Speed** — orders of magnitude faster on cold installs.
- **Workspaces** — first-class support for sub-packages (`common/python`).
- **Lockfile** (`uv.lock`) for reproducible builds.
- **No global Python pollution** — uv manages Pythons too.

## Install

`scripts/host/bootstrap.sh` does it for you. Manually:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Verify:

```bash
uv --version
```

## Layout

```text
pyproject.toml                       # root: project + tool config + extras
common/python/
└── pyproject.toml                   # workspace member: hor_common
modules/NN-*/platforms/rpi-*/src/    # plain scripts, deps via root extras
```

The root declares `[tool.uv.workspace] members = ["common/python"]` so
`uv sync` picks up `hor_common` as an editable install.

## Common commands

```bash
# From the repo root:
uv sync                              # install workspace + base deps
uv sync --extra m01-rpi-zero-w       # add deps for module 01 on the Pi Zero W
uv sync --extra dev                  # add pytest + mypy + ruff (already in dev)

uv run pytest                        # run tests in the project venv
uv run python modules/01-digital-io/platforms/rpi-zero-w/src/main.py

uv lock                              # update uv.lock after editing deps
uv add lgpio --optional m01-rpi-4    # add a dep to a specific extra group
```

## Per-module extras

Each module that needs Python deps declares an `optional-dependency` group
keyed by `mNN-<platform>`:

```toml
[project.optional-dependencies]
m01-rpi-zero-w  = ["lgpio>=0.2.2.0"]
m01-rpi-4       = ["lgpio>=0.2.2.0"]
m01-jetson-nano = ["Jetson.GPIO>=2.1.4"]
```

Install per-board on the SBC itself:

```bash
# On the Raspberry Pi Zero W:
uv sync --extra m01-rpi-zero-w
```

## CI

`.github/workflows/build.yml` runs `uv sync --extra dev && uv run pytest`.
Locked deps via `uv.lock` (committed) guarantee reproducible installs.
