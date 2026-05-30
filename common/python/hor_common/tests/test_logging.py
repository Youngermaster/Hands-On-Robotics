"""Tests for hor_common.logging."""

from __future__ import annotations

import logging

import pytest

from hor_common.logging import get_logger, reset_for_tests


@pytest.fixture(autouse=True)
def _reset() -> None:
    reset_for_tests()


def test_get_logger_returns_logger() -> None:
    log = get_logger("hor.test")
    assert isinstance(log, logging.Logger)
    assert log.name == "hor.test"


def test_root_handler_installed_once() -> None:
    get_logger("a")
    get_logger("b")
    get_logger("c")
    root = logging.getLogger()
    assert len(root.handlers) == 1


def test_level_respects_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("HOR_LOG_LEVEL", "DEBUG")
    reset_for_tests()
    get_logger("x")
    assert logging.getLogger().level == logging.DEBUG
