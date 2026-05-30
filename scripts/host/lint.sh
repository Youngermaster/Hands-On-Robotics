#!/usr/bin/env bash
# scripts/host/lint.sh
# Runs every quality gate locally. Same hooks as CI.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"

require_cmd pre-commit
require_cmd uv

REPO_ROOT="$(git -C "${SCRIPT_DIR}" rev-parse --show-toplevel)"
cd "${REPO_ROOT}"

log_info "pre-commit on all files…"
pre-commit run --all-files

log_info "mypy on hor_common…"
uv run mypy

log_info "pytest on hor_common…"
uv run pytest -q

log_info "all checks passed"
