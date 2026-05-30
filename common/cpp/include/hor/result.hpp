// hor/result.hpp — small Result<T, E> for code paths where exceptions
// are unwanted (embedded, RT loops, ROS2 callbacks).
//
// Not a full std::expected reimplementation. Just enough surface to write
// straight-line error-handling code without bringing in a dependency.

#pragma once

#include <cassert>
#include <type_traits>
#include <utility>
#include <variant>

namespace hor {

template <typename E>
struct Err {
    E value;
};

template <typename E>
Err<std::decay_t<E>> err(E&& e) {
    return Err<std::decay_t<E>>{std::forward<E>(e)};
}

template <typename T, typename E>
class Result {
   public:
    // Implicit construction from success or error keeps call sites tidy.
    Result(T value) : storage_(std::in_place_index<0>, std::move(value)) {}
    Result(Err<E> e) : storage_(std::in_place_index<1>, std::move(e.value)) {}

    bool ok() const noexcept { return storage_.index() == 0; }
    explicit operator bool() const noexcept { return ok(); }

    T& value() & { return std::get<0>(storage_); }
    const T& value() const& { return std::get<0>(storage_); }
    T&& value() && { return std::move(std::get<0>(storage_)); }

    E& error() & { return std::get<1>(storage_); }
    const E& error() const& { return std::get<1>(storage_); }

    template <typename U>
    T value_or(U&& fallback) const& {
        return ok() ? value() : static_cast<T>(std::forward<U>(fallback));
    }

   private:
    std::variant<T, E> storage_;
};

}  // namespace hor
