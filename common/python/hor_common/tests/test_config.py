"""Tests for hor_common.config."""

from __future__ import annotations

from pathlib import Path

import pytest
from pydantic import BaseModel

from hor_common.config import ConfigError, load_yaml


class _Cfg(BaseModel):
    pin: int
    debounce_ms: int = 30


def test_load_valid_yaml(tmp_path: Path) -> None:
    f = tmp_path / "c.yaml"
    f.write_text("pin: 17\ndebounce_ms: 50\n")
    cfg = load_yaml(_Cfg, f)
    assert cfg.pin == 17
    assert cfg.debounce_ms == 50


def test_default_value_applied(tmp_path: Path) -> None:
    f = tmp_path / "c.yaml"
    f.write_text("pin: 4\n")
    cfg = load_yaml(_Cfg, f)
    assert cfg.debounce_ms == 30


def test_missing_file_raises(tmp_path: Path) -> None:
    with pytest.raises(ConfigError, match="not found"):
        load_yaml(_Cfg, tmp_path / "missing.yaml")


def test_invalid_yaml_raises(tmp_path: Path) -> None:
    f = tmp_path / "c.yaml"
    f.write_text("pin: : :\n")
    with pytest.raises(ConfigError, match="invalid YAML"):
        load_yaml(_Cfg, f)


def test_validation_error_raises(tmp_path: Path) -> None:
    f = tmp_path / "c.yaml"
    f.write_text('pin: "not-an-int"\n')
    with pytest.raises(ConfigError, match="validation failed"):
        load_yaml(_Cfg, f)


def test_non_mapping_raises(tmp_path: Path) -> None:
    f = tmp_path / "c.yaml"
    f.write_text("- 1\n- 2\n")
    with pytest.raises(ConfigError, match="expected mapping"):
        load_yaml(_Cfg, f)
