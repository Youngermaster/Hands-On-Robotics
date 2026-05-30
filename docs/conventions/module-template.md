# Module Template

Every module in `modules/NN-name/` follows the same layout. This page is
the spec; CI greps for the headings listed below in each module README.

## Folder layout

```text
modules/NN-name/
├── README.md            # tutorial (required) — sections defined below
├── bom.md               # bill of materials (required if hardware needed)
├── wiring/              # SVG diagrams, one per board family
├── platforms/
│   ├── arduino-uno/     # only present if this module supports the board
│   │   ├── README.md
│   │   ├── src/
│   │   ├── platformio.ini   # OR pyproject.toml extra (SBC variants)
│   │   └── scripts/flash.sh
│   ├── esp32/
│   ├── pico/
│   ├── rpi-zero-w/
│   ├── rpi-4/
│   └── jetson-nano/
├── common/              # module-local shared code (NOT repo-wide common/)
├── tests/               # pytest / GoogleTest / cargo test
└── docs/                # extra diagrams, photos, derivations
```

## Mandatory README sections

A module README MUST contain (in order) the following H2 headings:

1. `## Goal` — one paragraph: what the learner will build/observe.
2. `## Concepts` — bullets: the new ideas this module introduces.
3. `## Prerequisites` — links to earlier modules and doc pages.
4. `## Hardware Matrix` — table mapping board → folder → status.
5. `## Bill of Materials` — link to `bom.md` plus a one-line summary.
6. `## Wiring` — embedded SVG(s) and a one-line description.
7. `## Build & Run` — copy-pasteable commands per platform.
8. `## Expected Behavior` — describe what success looks like.
9. `## Common Pitfalls` — debugging hints.
10. `## Next Module` — link forward.

A pre-commit hook (`scripts/host/check-module-headings.sh`) enforces these.

## Mermaid diagrams

Use at least one of:

- **Block diagram** (`flowchart`) — hardware and software components.
- **State diagram** (`stateDiagram-v2`) — for any module with multi-state behavior (button-controlled LED, BLE connection, motor control).
- **Sequence diagram** — for protocols (BLE handshake, MQTT round-trip).

## Per-platform README

Each `platforms/<board>/README.md` documents:

- Pin assignments (table).
- Board-specific quirks (e.g. ESP32 GPIO 6–11 are flash, do not use).
- Build command, flash command, monitor command.

## Build artifacts

Out-of-source builds, always. The top-level `.gitignore` already excludes
`build/`, `.pio/`, `target/`, etc.
