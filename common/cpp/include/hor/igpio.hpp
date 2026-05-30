// hor/igpio.hpp — pure-virtual GPIO interface. C++ analog of the Python
// `hor_common.gpio.Gpio` protocol.
//
// Module-specific Pi / Jetson C++ code derives from this and supplies a
// concrete backend (typically wrapping `lgpio` or `libgpiod`). A mock
// backend lives in `tests/mock_gpio.hpp` of each module that needs one.

#pragma once

#include <cstdint>

namespace hor {

enum class Pull : std::uint8_t { kNone, kUp, kDown };

class IGpio {
   public:
    IGpio() = default;
    virtual ~IGpio() = default;

    IGpio(const IGpio&) = delete;
    IGpio& operator=(const IGpio&) = delete;
    IGpio(IGpio&&) = delete;
    IGpio& operator=(IGpio&&) = delete;

    virtual void setup_output(int pin, bool initial) = 0;
    virtual void setup_input(int pin, Pull pull) = 0;
    virtual void write(int pin, bool value) = 0;
    virtual bool read(int pin) = 0;
};

}  // namespace hor
