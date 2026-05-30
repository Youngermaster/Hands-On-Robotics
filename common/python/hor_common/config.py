"""Typed YAML config loader built on pydantic v2.

Usage:
    from pydantic import BaseModel
    from hor_common.config import load_yaml

    class MyConfig(BaseModel):
        pin: int
        debounce_ms: int = 30

    cfg = load_yaml(MyConfig, Path("config.yaml"))
"""

from __future__ import annotations

from pathlib import Path
from typing import TypeVar

import yaml
from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)


class ConfigError(RuntimeError):
    """Raised when a config file is missing, malformed, or fails validation."""


def load_yaml(model: type[T], path: Path) -> T:
    """Load ``path`` and parse it into ``model``.

    Raises ``ConfigError`` on missing files, YAML syntax errors, or
    pydantic validation failures.
    """
    if not path.exists():
        raise ConfigError(f"config file not found: {path}")

    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        raise ConfigError(f"invalid YAML in {path}: {exc}") from exc

    if raw is None:
        raw = {}
    if not isinstance(raw, dict):
        raise ConfigError(f"expected mapping at top of {path}, got {type(raw).__name__}")

    try:
        return model.model_validate(raw)
    except ValidationError as exc:
        raise ConfigError(f"config validation failed for {path}:\n{exc}") from exc
