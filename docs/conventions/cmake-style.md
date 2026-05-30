# CMake Style

CMakeLists in this repo are teaching artifacts. They get read by learners,
not just by `cmake`. Three rules:

1. **Comment every non-trivial line.** What does `add_library(... INTERFACE)` mean? Say so inline.
2. **One concept per block.** Group related calls; separate blocks with a blank line and a `# --- Title ---` banner.
3. **No magic.** Spell out languages, standards, and warnings explicitly. Don't rely on global defaults the reader can't see.

## Required preamble

Every `CMakeLists.txt` starts with:

```cmake
# <relative path from repo root> — <one-line purpose>
#
# Read this top-to-bottom. Each `# ---` block is one concept.

cmake_minimum_required(VERSION 3.16)   # 3.16 is the floor we test against.
project(<name> LANGUAGES CXX)          # Explicit LANGUAGES — no surprises.

set(CMAKE_CXX_STANDARD          17)    # C++17 is the project minimum.
set(CMAKE_CXX_STANDARD_REQUIRED ON)    # Fail the build, don't silently downgrade.
set(CMAKE_CXX_EXTENSIONS        OFF)   # Stay portable: no -std=gnu++17.

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)  # Generates compile_commands.json for clang-tidy & IDEs.
```

## Adding warnings

Per target, not globally. Globally polluting flags via `add_compile_options`
breaks subprojects.

```cmake
# --- Warnings ---------------------------------------------------------------
# Treat warnings as failures so they get fixed, not ignored.
if(MSVC)
  target_compile_options(${PROJECT_NAME} PRIVATE /W4 /WX)
else()
  target_compile_options(${PROJECT_NAME} PRIVATE
    -Wall -Wextra -Wpedantic -Werror
    -Wshadow -Wconversion -Wsign-conversion
  )
endif()
```

## Header-only libraries

Use `INTERFACE` targets so consumers pick up include paths and compile
options automatically.

```cmake
# `INTERFACE` = no sources; just propagates settings to anything that
# links against this target.
add_library(hor_log INTERFACE)
target_include_directories(hor_log INTERFACE
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
)
target_compile_features(hor_log INTERFACE cxx_std_17)
```

## Embedded (Pico, etc.)

Pico SDK is invoked through `pico_sdk_init()`. Always import the SDK
*before* calling `project()` so toolchain detection works:

```cmake
include(${PICO_SDK_PATH}/external/pico_sdk_import.cmake)
project(blink C CXX ASM)
pico_sdk_init()                          # Sets up cross-compile + libs.
add_executable(blink src/main.cpp)
target_link_libraries(blink pico_stdlib) # USB stdio, default LED, etc.
pico_add_extra_outputs(blink)            # Generates .uf2 alongside .elf.
```

## What not to do

- Don't use file-globs (`file(GLOB ...)`) — they break incremental builds.
- Don't set `CMAKE_BUILD_TYPE` inside the CMakeLists; let users pass `-DCMAKE_BUILD_TYPE=Release` via presets.
- Don't `include_directories(...)` globally — use `target_include_directories(... PUBLIC|PRIVATE|INTERFACE ...)`.
- Don't `add_definitions(-DSOMETHING)` — use `target_compile_definitions`.
