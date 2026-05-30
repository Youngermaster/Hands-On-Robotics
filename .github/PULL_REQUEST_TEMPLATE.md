## Summary

<!-- 1-3 sentences describing what this PR does and why. -->

## Checklist

- [ ] If adding a new module, the README follows [`docs/conventions/module-template.md`](../docs/conventions/module-template.md) (all required H2 headings present).
- [ ] Per-platform `README.md` updated for each `platforms/<board>/` folder I touched.
- [ ] BoM / wiring SVGs updated if hardware changed.
- [ ] Tests added or updated (`uv run pytest`).
- [ ] CMakeLists, if changed, follow [`docs/conventions/cmake-style.md`](../docs/conventions/cmake-style.md).
- [ ] `pre-commit run --all-files` is green locally.
- [ ] If promoting code to `common/`, it is used by 2+ modules.

## Test plan

- [ ] `./scripts/host/lint.sh` passes.
- [ ] `uv run pytest` passes.
- [ ] If touching MCU code: `pio run -d modules/<NN>-<name>/platforms/<board>` builds.
- [ ] If touching Python module code: ran it on the actual SBC (specify which).
- [ ] If touching the Expo app: ran `pnpm start` and exercised the screen on a device/sim.
