"""Tests for hor_common.gpio (mock backend + factory)."""

from __future__ import annotations

import pytest

from hor_common.gpio import MockGpio, Pull, open_gpio


def test_mock_output_round_trip() -> None:
    g = MockGpio()
    g.setup_output(17, initial=True)
    assert g.writes == [(17, True)]
    g.write(17, False)
    assert g.writes == [(17, True), (17, False)]


def test_mock_input_pull() -> None:
    g = MockGpio()
    g.setup_input(4, pull=Pull.UP)
    assert g.pins[4].pull is Pull.UP
    assert g.read(4) is False
    g.set_input(4, True)
    assert g.read(4) is True


def test_mock_rejects_unconfigured_pin() -> None:
    g = MockGpio()
    with pytest.raises(RuntimeError, match="not configured"):
        g.write(13, True)


def test_mock_rejects_wrong_direction() -> None:
    g = MockGpio()
    g.setup_output(5)
    with pytest.raises(RuntimeError, match="output, not input"):
        g.read(5)


def test_mock_context_manager_closes() -> None:
    with MockGpio() as g:
        g.setup_output(1)
        assert not g.closed
    assert g.closed


def test_open_gpio_auto_falls_back_to_mock() -> None:
    # On a dev machine without lgpio / Jetson.GPIO, auto resolves to MockGpio.
    g = open_gpio("auto")
    assert isinstance(g, MockGpio)


def test_open_gpio_explicit_mock() -> None:
    assert isinstance(open_gpio("mock"), MockGpio)


def test_open_gpio_unknown_backend() -> None:
    with pytest.raises(ValueError, match="unknown backend"):
        open_gpio("nope")
