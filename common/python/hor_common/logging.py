"""Structured, colorized logging for Hands-On-Robotics scripts.

Usage:
    from hor_common.logging import get_logger
    log = get_logger(__name__)
    log.info("hello")

The first call sets up a root handler; subsequent calls are cheap. Honors
the ``HOR_LOG_LEVEL`` env var (default ``INFO``).
"""

from __future__ import annotations

import logging
import os
import sys
from typing import Final

_DEFAULT_FORMAT: Final = "%(asctime)s %(levelname)-5s %(name)s: %(message)s"
_DATE_FORMAT: Final = "%H:%M:%S"

_LEVEL_COLORS: Final[dict[str, str]] = {
    "DEBUG": "\033[36m",
    "INFO": "\033[32m",
    "WARNING": "\033[33m",
    "ERROR": "\033[31m",
    "CRITICAL": "\033[35m",
}
_RESET: Final = "\033[0m"

_SENTINEL_HANDLER_NAME: Final = "hor_common.root"


class _ColorFormatter(logging.Formatter):
    """Wraps the level name in ANSI color codes when stderr is a TTY."""

    def __init__(self, fmt: str, datefmt: str, *, use_color: bool) -> None:
        super().__init__(fmt=fmt, datefmt=datefmt)
        self._use_color = use_color

    def format(self, record: logging.LogRecord) -> str:
        if self._use_color:
            color = _LEVEL_COLORS.get(record.levelname, "")
            record.levelname = f"{color}{record.levelname}{_RESET}"
        return super().format(record)


def _is_configured() -> bool:
    """True once our sentinel handler is installed on the root logger."""
    return any(
        getattr(h, "name", None) == _SENTINEL_HANDLER_NAME for h in logging.getLogger().handlers
    )


def _configure_root() -> None:
    if _is_configured():
        return

    level_name = os.environ.get("HOR_LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)

    handler = logging.StreamHandler(stream=sys.stderr)
    handler.set_name(_SENTINEL_HANDLER_NAME)
    handler.setFormatter(
        _ColorFormatter(
            fmt=_DEFAULT_FORMAT,
            datefmt=_DATE_FORMAT,
            use_color=sys.stderr.isatty(),
        )
    )

    root = logging.getLogger()
    # Replace any existing handlers — keeps repeated process starts clean.
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)


def get_logger(name: str) -> logging.Logger:
    """Return a configured logger for ``name`` (typically ``__name__``)."""
    _configure_root()
    return logging.getLogger(name)


def reset_for_tests() -> None:
    """Test-only hook: tears down our handler so the next call reinstalls it."""
    logging.getLogger().handlers.clear()
