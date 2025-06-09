#pragma once
#include <vector>
#include <random>
#include <ctime>
#include <algorithm>

class Game2048 {
private:
    std::vector<std::vector<int>> board;
    int score;
    bool gameOver;
    bool gameWon;
    std::mt19937 rng;

    struct Position {
        int row;
        int col;
    };

    struct Tile {
        int id;
        int value;
        int row;
        int col;
        bool isNew;
        bool isMerged;
    };

public:
    Game2048() : score(0), gameOver(false), gameWon(false) {
        // Initialize random number generator
        rng.seed(static_cast<unsigned int>(std::time(nullptr)));
        
        // Initialize board
        board = std::vector<std::vector<int>>(4, std::vector<int>(4, 0));
        
        // Add initial tiles
        addRandomTile();
        addRandomTile();
    }

    // Get current game state
    std::vector<Tile> getTiles() const {
        std::vector<Tile> tiles;
        int id = 1;
        
        for (int row = 0; row < 4; row++) {
            for (int col = 0; col < 4; col++) {
                if (board[row][col] != 0) {
                    tiles.push_back({
                        id++,
                        board[row][col],
                        row,
                        col,
                        false,
                        false
                    });
                }
            }
        }
        
        return tiles;
    }

    // Add a random tile (2 or 4) to an empty cell
    void addRandomTile() {
        std::vector<Position> emptyCells;
        
        for (int row = 0; row < 4; row++) {
            for (int col = 0; col < 4; col++) {
                if (board[row][col] == 0) {
                    emptyCells.push_back({row, col});
                }
            }
        }
        
        if (!emptyCells.empty()) {
            std::uniform_int_distribution<int> cellDist(0, emptyCells.size() - 1);
            int index = cellDist(rng);
            Position pos = emptyCells[index];
            
            // 90% chance for 2, 10% chance for 4
            std::uniform_real_distribution<double> valueDist(0.0, 1.0);
            board[pos.row][pos.col] = valueDist(rng) < 0.9 ? 2 : 4;
        }
    }

    // Move tiles in specified direction
    bool move(const std::string& direction) {
        if (gameOver) return false;
        
        // Save current board state to check if anything moved
        auto oldBoard = board;
        
        if (direction == "left") {
            moveLeft();
        } else if (direction == "right") {
            moveRight();
        } else if (direction == "up") {
            moveUp();
        } else if (direction == "down") {
            moveDown();
        }
        
        // Check if board changed
        bool moved = (oldBoard != board);
        
        if (moved) {
            addRandomTile();
            checkGameOver();
        }
        
        return moved;
    }

    // Check if game is over
    void checkGameOver() {
        // Check if board is full
        bool isFull = true;
        for (int row = 0; row < 4; row++) {
            for (int col = 0; col < 4; col++) {
                if (board[row][col] == 0) {
                    isFull = false;
                    break;
                }
            }
            if (!isFull) break;
        }
        
        if (!isFull) return;
        
        // Check for possible merges
        for (int row = 0; row < 4; row++) {
            for (int col = 0; col < 4; col++) {
                int current = board[row][col];
                
                // Check adjacent cells
                const int dr[] = {0, 0, 1, -1};
                const int dc[] = {1, -1, 0, 0};
                
                for (int i = 0; i < 4; i++) {
                    int newRow = row + dr[i];
                    int newCol = col + dc[i];
                    
                    if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                        if (board[newRow][newCol] == current) {
                            return; // Found possible merge
                        }
                    }
                }
            }
        }
        
        gameOver = true;
    }

    // Reset game
    void reset() {
        board = std::vector<std::vector<int>>(4, std::vector<int>(4, 0));
        score = 0;
        gameOver = false;
        gameWon = false;
        
        addRandomTile();
        addRandomTile();
    }

    // Getters
    int getScore() const { return score; }
    bool isGameOver() const { return gameOver; }
    bool isGameWon() const { return gameWon; }

private:
    // Move and merge tiles to the left
    void moveLeft() {
        for (int row = 0; row < 4; row++) {
            std::vector<int> line;
            
            // Extract non-zero elements
            for (int col = 0; col < 4; col++) {
                if (board[row][col] != 0) {
                    line.push_back(board[row][col]);
                }
            }
            
            // Merge adjacent equal values
            for (size_t i = 0; i < line.size() - 1; i++) {
                if (line[i] == line[i + 1]) {
                    line[i] *= 2;
                    score += line[i];
                    line.erase(line.begin() + i + 1);
                    
                    if (line[i] == 2048 && !gameWon) {
                        gameWon = true;
                    }
                }
            }
            
            // Fill with zeros
            while (line.size() < 4) {
                line.push_back(0);
            }
            
            // Update board
            for (int col = 0; col < 4; col++) {
                board[row][col] = line[col];
            }
        }
    }

    // Move and merge tiles to the right
    void moveRight() {
        for (int row = 0; row < 4; row++) {
            std::vector<int> line;
            
            // Extract non-zero elements
            for (int col = 0; col < 4; col++) {
                if (board[row][col] != 0) {
                    line.push_back(board[row][col]);
                }
            }
            
            // Merge adjacent equal values
            for (int i = line.size() - 1; i > 0; i--) {
                if (line[i] == line[i - 1]) {
                    line[i] *= 2;
                    score += line[i];
                    line.erase(line.begin() + i - 1);
                    i--;
                    
                    if (line[i] == 2048 && !gameWon) {
                        gameWon = true;
                    }
                }
            }
            
            // Fill with zeros
            while (line.size() < 4) {
                line.insert(line.begin(), 0);
            }
            
            // Update board
            for (int col = 0; col < 4; col++) {
                board[row][col] = line[col];
            }
        }
    }

    // Move and merge tiles upward
    void moveUp() {
        for (int col = 0; col < 4; col++) {
            std::vector<int> line;
            
            // Extract non-zero elements
            for (int row = 0; row < 4; row++) {
                if (board[row][col] != 0) {
                    line.push_back(board[row][col]);
                }
            }
            
            // Merge adjacent equal values
            for (size_t i = 0; i < line.size() - 1; i++) {
                if (line[i] == line[i + 1]) {
                    line[i] *= 2;
                    score += line[i];
                    line.erase(line.begin() + i + 1);
                    
                    if (line[i] == 2048 && !gameWon) {
                        gameWon = true;
                    }
                }
            }
            
            // Fill with zeros
            while (line.size() < 4) {
                line.push_back(0);
            }
            
            // Update board
            for (int row = 0; row < 4; row++) {
                board[row][col] = line[row];
            }
        }
    }

    // Move and merge tiles downward
    void moveDown() {
        for (int col = 0; col < 4; col++) {
            std::vector<int> line;
            
            // Extract non-zero elements
            for (int row = 0; row < 4; row++) {
                if (board[row][col] != 0) {
                    line.push_back(board[row][col]);
                }
            }
            
            // Merge adjacent equal values
            for (int i = line.size() - 1; i > 0; i--) {
                if (line[i] == line[i - 1]) {
                    line[i] *= 2;
                    score += line[i];
                    line.erase(line.begin() + i - 1);
                    i--;
                    
                    if (line[i] == 2048 && !gameWon) {
                        gameWon = true;
                    }
                }
            }
            
            // Fill with zeros
            while (line.size() < 4) {
                line.insert(line.begin(), 0);
            }
            
            // Update board
            for (int row = 0; row < 4; row++) {
                board[row][col] = line[row];
            }
        }
    }
};
