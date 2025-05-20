"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react"

// Define tile colors based on value
const tileColors: Record<number, string> = {
  2: "bg-amber-100 dark:bg-amber-900 text-gray-800 dark:text-gray-100",
  4: "bg-amber-200 dark:bg-amber-800 text-gray-800 dark:text-gray-100",
  8: "bg-orange-300 dark:bg-orange-700 text-white",
  16: "bg-orange-400 dark:bg-orange-600 text-white",
  32: "bg-red-400 dark:bg-red-600 text-white",
  64: "bg-red-500 dark:bg-red-500 text-white",
  128: "bg-yellow-300 dark:bg-yellow-600 text-white",
  256: "bg-yellow-400 dark:bg-yellow-500 text-white",
  512: "bg-green-400 dark:bg-green-600 text-white",
  1024: "bg-blue-400 dark:bg-blue-600 text-white",
  2048: "bg-purple-500 dark:bg-purple-500 text-white",
  4096: "bg-pink-500 dark:bg-pink-500 text-white",
  8192: "bg-indigo-500 dark:bg-indigo-500 text-white",
}

// Define tile font sizes based on value
const tileFontSizes: Record<number, string> = {
  2: "text-4xl",
  4: "text-4xl",
  8: "text-4xl",
  16: "text-4xl",
  32: "text-4xl",
  64: "text-4xl",
  128: "text-3xl",
  256: "text-3xl",
  512: "text-3xl",
  1024: "text-2xl",
  2048: "text-2xl",
  4096: "text-2xl",
  8192: "text-2xl",
}

// Define game board type
type Board = (number | null)[][]
type Position = { row: number; col: number }
type TileData = Position & { value: number; id: string }

// Create a new game board
const createBoard = (): Board => {
  return Array(4)
    .fill(null)
    .map(() => Array(4).fill(null))
}

// Add a random tile to the board (2 or 4)
const addRandomTile = (board: Board): { newBoard: Board; newTile: TileData | null } => {
  const emptyCells: Position[] = []

  // Find all empty cells
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === null) {
        emptyCells.push({ row, col })
      }
    }
  }

  // If no empty cells, return original board
  if (emptyCells.length === 0) {
    return { newBoard: board, newTile: null }
  }

  // Choose a random empty cell
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  const value = Math.random() < 0.9 ? 2 : 4 // 90% chance of 2, 10% chance of 4

  // Create a new board with the random tile
  const newBoard = board.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      if (rowIndex === randomCell.row && colIndex === randomCell.col) {
        return value
      }
      return cell
    }),
  )

  return {
    newBoard,
    newTile: {
      row: randomCell.row,
      col: randomCell.col,
      value,
      id: `${randomCell.row}-${randomCell.col}-${Date.now()}`,
    },
  }
}

// Check if the game is over
const isGameOver = (board: Board): boolean => {
  // Check for empty cells
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === null) {
        return false
      }
    }
  }

  // Check for possible merges horizontally
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === board[row][col + 1]) {
        return false
      }
    }
  }

  // Check for possible merges vertically
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 3; row++) {
      if (board[row][col] === board[row + 1][col]) {
        return false
      }
    }
  }

  // No moves left
  return true
}

// Check if the player has won (reached 2048)
const hasWon = (board: Board): boolean => {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === 2048) {
        return true
      }
    }
  }
  return false
}

// Main game component
export default function Game2048() {
  const [board, setBoard] = useState<Board>(createBoard())
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [keepPlaying, setKeepPlaying] = useState(false)
  const [tiles, setTiles] = useState<TileData[]>([])
  const [mergedTiles, setMergedTiles] = useState<string[]>([])
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  // Initialize the game
  useEffect(() => {
    startNewGame()

    // Load best score from localStorage
    const savedBestScore = localStorage.getItem("2048BestScore")
    if (savedBestScore) {
      setBestScore(Number.parseInt(savedBestScore))
    }

    // Add keyboard event listener
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Save best score to localStorage
  useEffect(() => {
    localStorage.setItem("2048BestScore", bestScore.toString())
  }, [bestScore])

  // Check for game over
  useEffect(() => {
    if (isGameOver(board)) {
      setGameOver(true)
    }
  }, [board])

  // Check for win
  useEffect(() => {
    if (!won && !keepPlaying && hasWon(board)) {
      setWon(true)
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [board, won, keepPlaying])

  // Start a new game
  const startNewGame = () => {
    const emptyBoard = createBoard()

    // Add two random tiles
    const { newBoard: boardWithOneTile, newTile: firstTile } = addRandomTile(emptyBoard)
    const { newBoard: initialBoard, newTile: secondTile } = addRandomTile(boardWithOneTile)

    setBoard(initialBoard)
    setScore(0)
    setGameOver(false)
    setWon(false)
    setKeepPlaying(false)
    setMergedTiles([])

    // Set initial tiles
    const initialTiles: TileData[] = []
    if (firstTile) initialTiles.push(firstTile)
    if (secondTile) initialTiles.push(secondTile)
    setTiles(initialTiles)
  }

  // Continue playing after winning
  const continueGame = () => {
    setKeepPlaying(true)
  }

  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameOver || (won && !keepPlaying)) return

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault()
        move("up")
        break
      case "ArrowDown":
        e.preventDefault()
        move("down")
        break
      case "ArrowLeft":
        e.preventDefault()
        move("left")
        break
      case "ArrowRight":
        e.preventDefault()
        move("right")
        break
    }
  }

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 50) {
        move("right")
      } else if (deltaX < -50) {
        move("left")
      }
    } else {
      // Vertical swipe
      if (deltaY > 50) {
        move("down")
      } else if (deltaY < -50) {
        move("up")
      }
    }

    setTouchStart(null)
  }

  // Move tiles in a direction
  const move = (direction: "up" | "down" | "left" | "right") => {
    if (gameOver || (won && !keepPlaying)) return

    // Clone the current board
    const newBoard = board.map((row) => [...row])
    let moved = false
    let scoreIncrease = 0
    const newMergedTiles: string[] = []

    // Process the board based on direction
    if (direction === "left") {
      for (let row = 0; row < 4; row++) {
        const result = processTilesInLine(newBoard[row], row, true)
        newBoard[row] = result.line
        moved = moved || result.moved
        scoreIncrease += result.score
        newMergedTiles.push(...result.mergedIds)
      }
    } else if (direction === "right") {
      for (let row = 0; row < 4; row++) {
        const rowReversed = [...newBoard[row]].reverse()
        const result = processTilesInLine(rowReversed, row, false)
        newBoard[row] = result.line.reverse()
        moved = moved || result.moved
        scoreIncrease += result.score
        newMergedTiles.push(...result.mergedIds)
      }
    } else if (direction === "up") {
      for (let col = 0; col < 4; col++) {
        const column = [newBoard[0][col], newBoard[1][col], newBoard[2][col], newBoard[3][col]]
        const result = processTilesInLine(column, col, true)
        for (let row = 0; row < 4; row++) {
          newBoard[row][col] = result.line[row]
        }
        moved = moved || result.moved
        scoreIncrease += result.score
        newMergedTiles.push(...result.mergedIds)
      }
    } else if (direction === "down") {
      for (let col = 0; col < 4; col++) {
        const column = [newBoard[0][col], newBoard[1][col], newBoard[2][col], newBoard[3][col]]
        const result = processTilesInLine(column.reverse(), col, false)
        const newColumn = result.line.reverse()
        for (let row = 0; row < 4; row++) {
          newBoard[row][col] = newColumn[row]
        }
        moved = moved || result.moved
        scoreIncrease += result.score
        newMergedTiles.push(...result.mergedIds)
      }
    }

    // If no tiles moved, do nothing
    if (!moved) return

    // Update score
    const newScore = score + scoreIncrease
    setScore(newScore)
    if (newScore > bestScore) {
      setBestScore(newScore)
    }

    // Add a new random tile
    const { newBoard: boardWithNewTile, newTile } = addRandomTile(newBoard)

    // Update the board
    setBoard(boardWithNewTile)

    // Update tiles for animation
    updateTilesFromBoard(boardWithNewTile, newTile, newMergedTiles)
  }

  // Process a line of tiles (row or column)
  const processTilesInLine = (
    line: (number | null)[],
    lineIndex: number,
    isLeftOrUp: boolean,
  ): { line: (number | null)[]; moved: boolean; score: number; mergedIds: string[] } => {
    const newLine = Array(4).fill(null)
    let moved = false
    let score = 0
    let position = isLeftOrUp ? 0 : 3
    const mergedIds: string[] = []

    // First, move all non-null tiles to the front
    const nonNullTiles = line.filter((tile) => tile !== null) as number[]

    // Then, merge adjacent tiles with the same value
    for (let i = 0; i < nonNullTiles.length; i++) {
      if (i < nonNullTiles.length - 1 && nonNullTiles[i] === nonNullTiles[i + 1]) {
        // Merge tiles
        const mergedValue = nonNullTiles[i]! * 2
        newLine[position] = mergedValue
        score += mergedValue

        // Create merged tile ID
        const row = isLeftOrUp ? lineIndex : 3 - lineIndex
        const col = isLeftOrUp ? position : 3 - position
        mergedIds.push(`${row}-${col}-merged`)

        position = isLeftOrUp ? position + 1 : position - 1
        i++ // Skip the next tile since we merged it
      } else {
        // Just move the tile
        newLine[position] = nonNullTiles[i]
        position = isLeftOrUp ? position + 1 : position - 1
      }
    }

    // Check if the board changed
    for (let i = 0; i < 4; i++) {
      if (line[i] !== newLine[i]) {
        moved = true
        break
      }
    }

    return { line: newLine, moved, score, mergedIds }
  }

  // Update tiles array from board for animation
  const updateTilesFromBoard = (newBoard: Board, newTile: TileData | null, mergedTileIds: string[]) => {
    const newTiles: TileData[] = []

    // Add existing tiles from the board
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const value = newBoard[row][col]
        if (value !== null) {
          // Check if this is a merged tile
          const isMerged = mergedTileIds.includes(`${row}-${col}-merged`)

          newTiles.push({
            row,
            col,
            value,
            id: isMerged ? `${row}-${col}-merged` : `${row}-${col}`,
          })
        }
      }
    }

    // Add the new tile if it exists
    if (newTile) {
      newTiles.push(newTile)
    }

    setTiles(newTiles)
    setMergedTiles(mergedTileIds)
  }

  // Render a tile
  const renderTile = (tile: TileData) => {
    const isMerged = mergedTiles.includes(tile.id)

    return (
      <motion.div
        key={tile.id}
        className={cn(
          "absolute flex items-center justify-center rounded-md font-bold shadow-md",
          tileColors[tile.value] || "bg-gray-300",
          tileFontSizes[tile.value] || "text-2xl",
        )}
        initial={{ scale: tile.id.includes("merged") ? 0.8 : 0.5, opacity: 0.5 }}
        animate={{
          scale: isMerged ? [1, 1.1, 1] : 1,
          opacity: 1,
          left: `${tile.col * 25}%`,
          top: `${tile.row * 25}%`,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.2,
        }}
        style={{
          width: "23%",
          height: "23%",
          left: `${tile.col * 25}%`,
          top: `${tile.row * 25}%`,
        }}
      >
        {tile.value}
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md">
        {/* Game header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold">2048</h2>
            <p className="text-muted-foreground">Join the tiles, get to 2048!</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={startNewGame} className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              New Game
            </Button>
          </div>
        </div>

        {/* Score board */}
        <div className="flex justify-between mb-4">
          <div className="bg-muted p-3 rounded-md text-center w-28">
            <div className="text-xs uppercase text-muted-foreground font-semibold">Score</div>
            <div className="text-2xl font-bold">{score}</div>
          </div>
          <div className="bg-muted p-3 rounded-md text-center w-28">
            <div className="text-xs uppercase text-muted-foreground font-semibold">Best</div>
            <div className="text-2xl font-bold">{bestScore}</div>
          </div>
        </div>

        {/* Game board */}
        <div
          className="relative bg-muted rounded-md p-2 aspect-square mb-4 touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grid background */}
          <div className="absolute inset-2 grid grid-cols-4 grid-rows-4 gap-2">
            {Array(16)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="bg-background/50 rounded-md"></div>
              ))}
          </div>

          {/* Tiles */}
          <AnimatePresence>{tiles.map(renderTile)}</AnimatePresence>

          {/* Game over overlay */}
          {(gameOver || (won && !keepPlaying)) && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
              <div className="text-center p-4">
                <h3 className="text-2xl font-bold mb-2">{won ? "You Win!" : "Game Over!"}</h3>
                <p className="mb-4">{won ? "You reached 2048!" : `Your score: ${score}`}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={startNewGame}>New Game</Button>
                  {won && !keepPlaying && (
                    <Button variant="outline" onClick={continueGame}>
                      Keep Playing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game controls */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div></div>
          <Button
            variant="outline"
            className="aspect-square flex items-center justify-center"
            onClick={() => move("up")}
            disabled={gameOver || (won && !keepPlaying)}
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
          <div></div>
          <Button
            variant="outline"
            className="aspect-square flex items-center justify-center"
            onClick={() => move("left")}
            disabled={gameOver || (won && !keepPlaying)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            className="aspect-square flex items-center justify-center"
            onClick={() => move("down")}
            disabled={gameOver || (won && !keepPlaying)}
          >
            <ArrowDown className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            className="aspect-square flex items-center justify-center"
            onClick={() => move("right")}
            disabled={gameOver || (won && !keepPlaying)}
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Game instructions */}
        <div className="bg-muted p-4 rounded-md text-sm">
          <h3 className="font-semibold mb-2">How to Play:</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Use arrow keys or swipe to move tiles</li>
            <li>Tiles with the same number merge into one when they touch</li>
            <li>Add them up to reach 2048!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
