"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RotateCcw, Trophy, X } from "lucide-react"

type Tile = {
  id: number
  value: number
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
}

type Direction = "up" | "down" | "left" | "right"

export default function Game2048() {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [showWinModal, setShowWinModal] = useState(false)
  const [nextId, setNextId] = useState(1)

  // Initialize game
  const initGame = useCallback(() => {
    const newTiles: Tile[] = []
    let id = 1

    // Add two initial tiles
    for (let i = 0; i < 2; i++) {
      const emptyCells = []
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (!newTiles.find((tile) => tile.row === row && tile.col === col)) {
            emptyCells.push({ row, col })
          }
        }
      }

      if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        newTiles.push({
          id: id++,
          value: Math.random() < 0.9 ? 2 : 4,
          row: randomCell.row,
          col: randomCell.col,
          isNew: true,
        })
      }
    }

    setTiles(newTiles)
    setScore(0)
    setGameOver(false)
    setGameWon(false)
    setShowWinModal(false)
    setNextId(id)
  }, [])

  // Add new tile after move
  const addNewTile = useCallback(
    (currentTiles: Tile[]) => {
      const emptyCells = []
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (!currentTiles.find((tile) => tile.row === row && tile.col === col)) {
            emptyCells.push({ row, col })
          }
        }
      }

      if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        return [
          ...currentTiles,
          {
            id: nextId,
            value: Math.random() < 0.9 ? 2 : 4,
            row: randomCell.row,
            col: randomCell.col,
            isNew: true,
          },
        ]
      }

      return currentTiles
    },
    [nextId],
  )

  // Move tiles in specified direction
  const moveTiles = useCallback(
    (direction: Direction) => {
      if (gameOver) return

      let moved = false
      let newScore = score
      const newTiles = tiles.map((tile) => ({ ...tile, isNew: false, isMerged: false }))

      // Create 4x4 grid
      const grid: (Tile | null)[][] = Array(4)
        .fill(null)
        .map(() => Array(4).fill(null))
      newTiles.forEach((tile) => {
        grid[tile.row][tile.col] = tile
      })

      const moveAndMerge = (arr: (Tile | null)[]) => {
        // Remove nulls and move tiles
        const filtered = arr.filter((tile) => tile !== null) as Tile[]
        const result: (Tile | null)[] = []

        for (let i = 0; i < filtered.length; i++) {
          if (
            i < filtered.length - 1 &&
            filtered[i].value === filtered[i + 1].value &&
            !filtered[i].isMerged &&
            !filtered[i + 1].isMerged
          ) {
            // Merge tiles
            const mergedTile = {
              ...filtered[i],
              value: filtered[i].value * 2,
              isMerged: true,
            }
            result.push(mergedTile)
            newScore += mergedTile.value

            if (mergedTile.value === 2048 && !gameWon) {
              setGameWon(true)
              setShowWinModal(true)
            }

            i++ // Skip next tile as it's merged
          } else {
            result.push(filtered[i])
          }
        }

        // Fill remaining with nulls
        while (result.length < 4) {
          result.push(null)
        }

        return result
      }

      // Apply movement based on direction
      if (direction === "left") {
        for (let row = 0; row < 4; row++) {
          const originalRow = [...grid[row]]
          const newRow = moveAndMerge(grid[row])
          grid[row] = newRow

          // Check if row changed
          for (let col = 0; col < 4; col++) {
            if ((originalRow[col]?.id || null) !== (newRow[col]?.id || null)) {
              moved = true
            }
            if (newRow[col]) {
              newRow[col]!.row = row
              newRow[col]!.col = col
            }
          }
        }
      } else if (direction === "right") {
        for (let row = 0; row < 4; row++) {
          const originalRow = [...grid[row]]
          const reversed = [...grid[row]].reverse()
          const newRow = moveAndMerge(reversed).reverse()
          grid[row] = newRow

          // Check if row changed
          for (let col = 0; col < 4; col++) {
            if ((originalRow[col]?.id || null) !== (newRow[col]?.id || null)) {
              moved = true
            }
            if (newRow[col]) {
              newRow[col]!.row = row
              newRow[col]!.col = col
            }
          }
        }
      } else if (direction === "up") {
        for (let col = 0; col < 4; col++) {
          const column = [grid[0][col], grid[1][col], grid[2][col], grid[3][col]]
          const originalColumn = [...column]
          const newColumn = moveAndMerge(column)

          // Check if column changed
          for (let row = 0; row < 4; row++) {
            if ((originalColumn[row]?.id || null) !== (newColumn[row]?.id || null)) {
              moved = true
            }
            grid[row][col] = newColumn[row]
            if (newColumn[row]) {
              newColumn[row]!.row = row
              newColumn[row]!.col = col
            }
          }
        }
      } else if (direction === "down") {
        for (let col = 0; col < 4; col++) {
          const column = [grid[0][col], grid[1][col], grid[2][col], grid[3][col]]
          const originalColumn = [...column]
          const reversed = [...column].reverse()
          const newColumn = moveAndMerge(reversed).reverse()

          // Check if column changed
          for (let row = 0; row < 4; row++) {
            if ((originalColumn[row]?.id || null) !== (newColumn[row]?.id || null)) {
              moved = true
            }
            grid[row][col] = newColumn[row]
            if (newColumn[row]) {
              newColumn[row]!.row = row
              newColumn[row]!.col = col
            }
          }
        }
      }

      if (moved) {
        // Convert grid back to tiles array
        const updatedTiles = grid.flat().filter((tile) => tile !== null) as Tile[]
        const tilesWithNew = addNewTile(updatedTiles)

        setTiles(tilesWithNew)
        setScore(newScore)
        setNextId((prev) => prev + 1)

        // Clear isNew flag after animation
        setTimeout(() => {
          setTiles((prevTiles) => prevTiles.map((tile) => ({ ...tile, isNew: false })))
        }, 200)

        // Check for game over
        setTimeout(() => {
          checkGameOver(tilesWithNew)
        }, 150)
      }
    },
    [tiles, score, gameOver, gameWon, addNewTile, nextId],
  )

  // Check if game is over
  const checkGameOver = useCallback((currentTiles: Tile[]) => {
    // Check if board is full
    if (currentTiles.length < 16) return

    // Check for possible moves
    const grid: (number | null)[][] = Array(4)
      .fill(null)
      .map(() => Array(4).fill(null))
    currentTiles.forEach((tile) => {
      grid[tile.row][tile.col] = tile.value
    })

    // Check for possible merges
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const current = grid[row][col]
        if (current === null) return

        // Check adjacent cells
        const directions = [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ]

        for (const [dr, dc] of directions) {
          const newRow = row + dr
          const newCol = col + dc

          if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
            if (grid[newRow][newCol] === current) {
              return // Found possible merge
            }
          }
        }
      }
    }

    setGameOver(true)
  }, [])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        moveTiles("up")
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        moveTiles("down")
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        moveTiles("left")
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        moveTiles("right")
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [moveTiles])

  // Initialize game on mount
  useEffect(() => {
    initGame()
  }, [initGame])

  // Update best score
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score)
      localStorage.setItem("2048-best-score", score.toString())
    }
  }, [score, bestScore])

  // Load best score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("2048-best-score")
    if (saved) {
      setBestScore(Number.parseInt(saved))
    }
  }, [])

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: "bg-slate-100 text-slate-800 border-2 border-slate-300",
      4: "bg-orange-200 text-orange-900 border-2 border-orange-300",
      8: "bg-orange-400 text-white border-2 border-orange-500",
      16: "bg-red-400 text-white border-2 border-red-500",
      32: "bg-red-600 text-white border-2 border-red-700",
      64: "bg-pink-500 text-white border-2 border-pink-600",
      128: "bg-yellow-400 text-yellow-900 border-2 border-yellow-500",
      256: "bg-yellow-600 text-white border-2 border-yellow-700",
      512: "bg-green-500 text-white border-2 border-green-600",
      1024: "bg-cyan-500 text-white border-2 border-cyan-600",
      2048: "bg-purple-600 text-white border-2 border-purple-700 shadow-lg shadow-purple-300",
    }
    return colors[value] || "bg-indigo-800 text-white border-2 border-indigo-900"
  }

  const getTileSize = (value: number) => {
    if (value >= 1000) return "text-xl font-bold"
    if (value >= 100) return "text-2xl font-bold"
    return "text-3xl font-bold"
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">2048</h1>
          <p className="text-slate-600 text-sm">Join numbers to reach 2048!</p>
        </div>

        {/* Score */}
        <div className="flex justify-between mb-4">
          <Card className="px-4 py-2 bg-slate-100 border-slate-300">
            <div className="text-xs text-slate-600 font-medium">SCORE</div>
            <div className="text-xl font-bold text-slate-900">{score}</div>
          </Card>
          <Card className="px-4 py-2 bg-slate-100 border-slate-300">
            <div className="text-xs text-slate-600 font-medium">BEST</div>
            <div className="text-xl font-bold text-slate-900">{bestScore}</div>
          </Card>
        </div>

        {/* New Game Button */}
        <div className="flex justify-center mb-4">
          <Button onClick={initGame} className="bg-blue-600 hover:bg-blue-700 text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>

        {/* Game Board */}
        <Card className="p-4 bg-slate-300 border-slate-400">
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Background cells */}
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-400 rounded-lg" />
            ))}

            {/* Tiles */}
            {tiles.map((tile) => (
              <div
                key={tile.id}
                className={`
                  absolute aspect-square rounded-lg flex items-center justify-center
                  transition-all duration-150 ease-in-out
                  ${getTileColor(tile.value)}
                  ${getTileSize(tile.value)}
                  ${tile.isNew ? "animate-in zoom-in-50 duration-200" : ""}
                  ${tile.isMerged ? "scale-110" : "scale-100"}
                `}
                style={{
                  left: `${tile.col * 25}%`,
                  top: `${tile.row * 25}%`,
                  width: "calc(25% - 0.125rem)",
                  height: "calc(25% - 0.125rem)",
                }}
              >
                {tile.value}
              </div>
            ))}
          </div>
        </Card>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-slate-600">
          <p>Use arrow keys to move tiles</p>
          <p>When two tiles with the same number touch, they merge!</p>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 m-4 text-center max-w-sm">
              <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Game Over!</h2>
              <p className="text-slate-600 mb-4">Final Score: {score}</p>
              <Button onClick={initGame} className="bg-blue-600 hover:bg-blue-700 text-white">
                Try Again
              </Button>
            </Card>
          </div>
        )}

        {/* Win Modal */}
        {showWinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 m-4 text-center max-w-sm">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">You Win!</h2>
              <p className="text-slate-600 mb-4">You reached 2048!</p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => setShowWinModal(false)}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Keep Playing
                </Button>
                <Button onClick={initGame} className="bg-blue-600 hover:bg-blue-700 text-white">
                  New Game
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
