# common/cpp/CMakeLists.txt — header-only utilities for Hands-On-Robotics.
#
# Read this top-to-bottom. Each `# ---` block is one concept.
# Conventions live in docs/conventions/cmake-style.md.

cmake_minimum_required(VERSION 3.16)   # 3.16 is the project floor.
project(hor_common_cpp LANGUAGES CXX)  # Explicit LANGUAGES — no surprises.

set(CMAKE_CXX_STANDARD          17)    # Header-only code targets C++17.
set(CMAKE_CXX_STANDARD_REQUIRED ON)    # Fail the build instead of silently downgrading.
set(CMAKE_CXX_EXTENSIONS        OFF)   # Stay portable: no -std=gnu++17 sneaking in.

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)  # compile_commands.json for clang-tidy & IDEs.

# --- The library --------------------------------------------------------------
# `INTERFACE` means: no .cpp sources to compile here.  CMake just
# propagates include paths and compile features to any target that does
# `target_link_libraries(my_target PRIVATE hor::common)`.
add_library(hor_common INTERFACE)
add_library(hor::common ALIAS hor_common)  # Friendlier alias for consumers.

target_include_directories(hor_common INTERFACE
  # During the build, use this source directory.
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  # After install, use the system include path.
  $<INSTALL_INTERFACE:include>
)

target_compile_features(hor_common INTERFACE cxx_std_17)

# --- Header sanity check (compiles each header in isolation) -----------------
# This catches "header forgot an include" bugs.  Disabled in cross-compile
# (some target toolchains can't compile host-only headers).
option(HOR_COMMON_BUILD_SANITY "Compile each public header in isolation" ON)
if(HOR_COMMON_BUILD_SANITY AND NOT CMAKE_CROSSCOMPILING)
  file(GLOB_RECURSE _hor_headers
    RELATIVE ${CMAKE_CURRENT_SOURCE_DIR}/include
    CONFIGURE_DEPENDS
    include/hor/*.hpp)
  foreach(_hdr IN LISTS _hor_headers)
    string(REGEX REPLACE "[/.-]" "_" _name "${_hdr}")
    set(_src "${CMAKE_CURRENT_BINARY_DIR}/sanity_${_name}.cpp")
    file(WRITE "${_src}" "#include \"${_hdr}\"\nint main(){return 0;}\n")
    add_executable(sanity_${_name} "${_src}")
    target_link_libraries(sanity_${_name} PRIVATE hor::common)
  endforeach()
endif()
