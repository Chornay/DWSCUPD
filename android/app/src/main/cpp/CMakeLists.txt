
cmake_minimum_required(VERSION 3.10.2)
project(MyApp)

# ✅ Linker flags to support 16KB page size
set(CMAKE_SHARED_LINKER_FLAGS
    "${CMAKE_SHARED_LINKER_FLAGS} -Wl,-z,common-page-size=16384 -Wl,-z,max-page-size=16384"
)
