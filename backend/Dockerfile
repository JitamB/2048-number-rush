FROM ubuntu:20.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libboost-all-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Clone Crow
RUN git clone https://github.com/CrowCpp/Crow.git crow

# Copy source files
COPY . .

# Build the project
RUN mkdir -p build && cd build && \
    cmake .. && \
    make -j$(nproc)

# Expose port
EXPOSE 3001

# Run the server
CMD ["./build/game_server"]
