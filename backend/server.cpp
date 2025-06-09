#include "game_logic.hpp"
#include "crow.h"
#include <unordered_map>
#include <string>
#include <mutex>

int main() {
    crow::SimpleApp app;
    
    // Store game sessions
    std::unordered_map<std::string, Game2048> games;
    std::mutex gamesMutex;
    
    // Create a new game session
    CROW_ROUTE(app, "/api/game/new")
    .methods("POST"_method)
    ([&]() {
        std::lock_guard<std::mutex> lock(gamesMutex);
        
        // Generate a unique session ID
        std::string sessionId = std::to_string(std::time(nullptr)) + std::to_string(rand());
        
        // Create a new game
        games[sessionId] = Game2048();
        
        // Get initial state
        auto tiles = games[sessionId].getTiles();
        int score = games[sessionId].getScore();
        
        // Prepare response
        crow::json::wvalue response;
        response["sessionId"] = sessionId;
        response["score"] = score;
        response["gameOver"] = false;
        response["gameWon"] = false;
        
        // Add tiles to response
        crow::json::wvalue::list tilesList;
        for (const auto& tile : tiles) {
            crow::json::wvalue tileObj;
            tileObj["id"] = tile.id;
            tileObj["value"] = tile.value;
            tileObj["row"] = tile.row;
            tileObj["col"] = tile.col;
            tileObj["isNew"] = tile.isNew;
            tileObj["isMerged"] = tile.isMerged;
            tilesList.push_back(std::move(tileObj));
        }
        response["tiles"] = std::move(tilesList);
        
        return response;
    });
    
    // Make a move
    CROW_ROUTE(app, "/api/game/move")
    .methods("POST"_method)
    ([&](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) {
            return crow::response(400, "Invalid JSON");
        }
        
        std::string sessionId = body["sessionId"].s();
        std::string direction = body["direction"].s();
        
        std::lock_guard<std::mutex> lock(gamesMutex);
        
        // Check if session exists
        if (games.find(sessionId) == games.end()) {
            return crow::response(404, "Game session not found");
        }
        
        // Make the move
        bool moved = games[sessionId].move(direction);
        
        // Get updated state
        auto tiles = games[sessionId].getTiles();
        int score = games[sessionId].getScore();
        bool gameOver = games[sessionId].isGameOver();
        bool gameWon = games[sessionId].isGameWon();
        
        // Prepare response
        crow::json::wvalue response;
        response["moved"] = moved;
        response["score"] = score;
        response["gameOver"] = gameOver;
        response["gameWon"] = gameWon;
        
        // Add tiles to response
        crow::json::wvalue::list tilesList;
        for (const auto& tile : tiles) {
            crow::json::wvalue tileObj;
            tileObj["id"] = tile.id;
            tileObj["value"] = tile.value;
            tileObj["row"] = tile.row;
            tileObj["col"] = tile.col;
            tileObj["isNew"] = tile.isNew;
            tileObj["isMerged"] = tile.isMerged;
            tilesList.push_back(std::move(tileObj));
        }
        response["tiles"] = std::move(tilesList);
        
        return crow::response(response);
    });
    
    // Reset game
    CROW_ROUTE(app, "/api/game/reset")
    .methods("POST"_method)
    ([&](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) {
            return crow::response(400, "Invalid JSON");
        }
        
        std::string sessionId = body["sessionId"].s();
        
        std::lock_guard<std::mutex> lock(gamesMutex);
        
        // Check if session exists
        if (games.find(sessionId) == games.end()) {
            return crow::response(404, "Game session not found");
        }
        
        // Reset the game
        games[sessionId].reset();
        
        // Get initial state
        auto tiles = games[sessionId].getTiles();
        int score = games[sessionId].getScore();
        
        // Prepare response
        crow::json::wvalue response;
        response["score"] = score;
        response["gameOver"] = false;
        response["gameWon"] = false;
        
        // Add tiles to response
        crow::json::wvalue::list tilesList;
        for (const auto& tile : tiles) {
            crow::json::wvalue tileObj;
            tileObj["id"] = tile.id;
            tileObj["value"] = tile.value;
            tileObj["row"] = tile.row;
            tileObj["col"] = tile.col;
            tileObj["isNew"] = tile.isNew;
            tileObj["isMerged"] = tile.isMerged;
            tilesList.push_back(std::move(tileObj));
        }
        response["tiles"] = std::move(tilesList);
        
        return crow::response(response);
    });
    
    // Run the server
    app.port(3001).multithreaded().run();
    
    return 0;
}
