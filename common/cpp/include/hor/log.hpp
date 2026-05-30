// hor/log.hpp — minimal, dependency-free logger for Hands-On-Robotics C++.
//
// Three log macros: HOR_LOG_INFO, HOR_LOG_WARN, HOR_LOG_ERR. Each takes a
// printf-style format. Output goes to std::cerr with a colorized level tag
// when stderr is a TTY. No background thread, no allocator gymnastics — fits
// on a Pi Zero W just as comfortably as on a workstation.
//
// Embedded targets (Arduino/ESP32/Pico) usually use their own `Serial.print`
// or `printf` redirection — they don't include this header.

#pragma once

#include <array>
#include <cstdarg>
#include <cstdint>
#include <cstdio>
#include <ctime>
#include <unistd.h>

namespace hor {
namespace log {

inline bool is_tty() noexcept {
    static const bool tty = (::isatty(fileno(stderr)) != 0);
    return tty;
}

enum class Level : std::uint8_t { kInfo, kWarn, kErr };

inline const char* color_for(Level lvl) noexcept {
    if (!is_tty()) {
        return "";
    }
    switch (lvl) {
        case Level::kInfo: return "\033[32m";
        case Level::kWarn: return "\033[33m";
        case Level::kErr:  return "\033[31m";
    }
    return "";
}

inline const char* tag_for(Level lvl) noexcept {
    switch (lvl) {
        case Level::kInfo: return "INFO ";
        case Level::kWarn: return "WARN ";
        case Level::kErr:  return "ERROR";
    }
    return "?    ";
}

inline void vlog(Level lvl, const char* fmt, std::va_list args) noexcept {
    std::array<char, 16> ts{};
    std::time_t now = std::time(nullptr);
    std::tm tm_buf{};
#if defined(_WIN32)
    localtime_s(&tm_buf, &now);
#else
    localtime_r(&now, &tm_buf);
#endif
    std::strftime(ts.data(), ts.size(), "%H:%M:%S", &tm_buf);
    const char* reset = is_tty() ? "\033[0m" : "";
    std::fprintf(stderr, "%s %s%s%s ", ts.data(), color_for(lvl), tag_for(lvl), reset);
    std::vfprintf(stderr, fmt, args);
    std::fputc('\n', stderr);
}

// NOLINTBEGIN(cppcoreguidelines-pro-type-vararg,cert-dcl50-cpp,cppcoreguidelines-init-variables)
inline void info(const char* fmt, ...) noexcept {
    std::va_list ap;
    va_start(ap, fmt);
    vlog(Level::kInfo, fmt, ap);
    va_end(ap);
}
inline void warn(const char* fmt, ...) noexcept {
    std::va_list ap;
    va_start(ap, fmt);
    vlog(Level::kWarn, fmt, ap);
    va_end(ap);
}
inline void err(const char* fmt, ...) noexcept {
    std::va_list ap;
    va_start(ap, fmt);
    vlog(Level::kErr, fmt, ap);
    va_end(ap);
}
// NOLINTEND(cppcoreguidelines-pro-type-vararg,cert-dcl50-cpp,cppcoreguidelines-init-variables)

}  // namespace log
}  // namespace hor

#define HOR_LOG_INFO(fmt, ...) ::hor::log::info(fmt, ##__VA_ARGS__)
#define HOR_LOG_WARN(fmt, ...) ::hor::log::warn(fmt, ##__VA_ARGS__)
#define HOR_LOG_ERR(fmt, ...)  ::hor::log::err(fmt, ##__VA_ARGS__)
