# 2048 Game with C++ Backend

This project implements the classic 2048 game with a React frontend and a C++ backend.

## Project Structure

- `backend/`: C++ backend code
  - `game_logic.hpp`: Game logic implementation
  - `server.cpp`: Crow web server with API endpoints
  - `CMakeLists.txt`: Build configuration
  - `Dockerfile`: Docker configuration for the backend
- `app/`: React frontend code
  - `page.tsx`: Main game component

## Setup Instructions

### Backend Setup

#### Option 1: Using Docker

1. Build the Docker image:
   \`\`\`bash
   cd backend
   docker build -t game2048-backend .
   \`\`\`

2. Run the container:
   \`\`\`bash
   docker run -p 3001:3001 game2048-backend
   \`\`\`

#### Option 2: Manual Setup

1. Install dependencies:
   \`\`\`bash
   # Ubuntu/Debian
   sudo apt-get install build-essential cmake libboost-all-dev
   
   # macOS
   brew install cmake boost
   
   # Windows (using vcpkg)
   vcpkg install boost
   \`\`\`

2. Clone Crow:
   \`\`\`bash
   git clone https://github.com/CrowCpp/Crow.git backend/crow
   \`\`\`

3. Build the project:
   \`\`\`bash
   cd backend
   mkdir build && cd build
   cmake ..
   make
   \`\`\`

4. Run the server:
   \`\`\`bash
   ./game_server
   \`\`\`

### Frontend Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. The C++ backend implements the game logic and exposes it via a REST API.
2. The React frontend communicates with the backend to initialize the game, make moves, and reset the game.
3. If the backend is unavailable, the frontend falls back to client-side logic.

## API Endpoints

- `POST /api/game/new`: Create a new game session
- `POST /api/game/move`: Make a move (requires sessionId and direction)
- `POST /api/game/reset`: Reset the game (requires sessionId)
