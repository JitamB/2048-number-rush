cmake_minimum_required(VERSION 3.10)
project(Game2048Backend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add Crow include directory (assuming it's in a subdirectory)
include_directories(${CMAKE_SOURCE_DIR}/crow/include)

# Add source files
add_executable(game_server server.cpp)

# Link necessary libraries
target_link_libraries(game_server pthread)

# Install target
install(TARGETS game_server DESTINATION bin)
