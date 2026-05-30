# common/cpp — Header-only C++ utilities

Three headers:

| Header                                  | Purpose                                       |
| --------------------------------------- | --------------------------------------------- |
| [`include/hor/log.hpp`](./include/hor/log.hpp)     | Minimal logger; macros `HOR_LOG_INFO/WARN/ERR`. |
| [`include/hor/result.hpp`](./include/hor/result.hpp) | Tiny `Result<T, E>` for non-throwing code paths. |
| [`include/hor/igpio.hpp`](./include/hor/igpio.hpp)  | Pure-virtual GPIO interface, mirrors Python's. |

## Use from a module

In a module's `CMakeLists.txt`:

```cmake
# Pull in the header-only library.
add_subdirectory(../../common/cpp common_cpp_build)
target_link_libraries(my_target PRIVATE hor::common)
```

Then in code:

```cpp
#include "hor/log.hpp"
#include "hor/result.hpp"

hor::Result<int, const char*> parse(const std::string& s) {
    try { return std::stoi(s); }
    catch (...) { return hor::err("not an int"); }
}

int main() {
    auto r = parse("42");
    if (r) HOR_LOG_INFO("parsed: %d", r.value());
    else   HOR_LOG_ERR("oops: %s", r.error());
}
```

## Not included

- A real `std::expected` — wait for C++23 or pull in tl::expected if needed.
- Threading utilities — modules use std::thread / std::jthread directly.
- Serial / I2C abstractions — those land in module-local headers once the
  patterns settle.
