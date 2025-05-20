"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"
import { Flag, Bomb, Clock, RotateCcw, Smile, Frown, Meh } from "lucide-react"

// Game difficulty settings
type Difficulty = "beginner" | "intermediate" | "expert"

const difficultySettings = {
  beginner: {
    rows: 9,
    cols: 9,
    mines: 10,
  },
  intermediate: {
    rows: 16,
    cols: 16,
    mines: 40,
  },
  expert: {
    rows: 16,
    cols: 30,
    mines: 99,
  },
}

// Cell type
type CellState = {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

// Game state
type GameStatus = "notStarted" | "playing" | "won" | "lost"

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner")
  const [grid, setGrid] = useState<CellState[][]>([])
  const [gameStatus, setGameStatus] = useState<GameStatus>("notStarted")
  const [minesLeft, setMinesLeft] = useState(0)
  const [time, setTime] = useState(0)
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number | null>>({
    beginner: null,
    intermediate: null,
    expert: null,
  })
  const [firstClick, setFirstClick] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const cellSize = useRef(30) // Default cell size

  // Initialize the game
  useEffect(() => {
    // Load best times from localStorage
    const savedTimes = localStorage.getItem("minesweeperBestTimes")
    if (savedTimes) {
      setBestTimes(JSON.parse(savedTimes))
    }

    // Adjust cell size based on difficulty and screen size
    const updateCellSize = () => {
      const settings = difficultySettings[difficulty]
      const maxWidth = Math.min(window.innerWidth - 40, 900) // Max width with some padding
      const calculatedSize = Math.floor(maxWidth / settings.cols)
      cellSize.current = Math.min(Math.max(calculatedSize, 20), 40) // Between 20px and 40px
    }

    updateCellSize()
    window.addEventListener("resize", updateCellSize)

    return () => {
      window.removeEventListener("resize", updateCellSize)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [difficulty])

  // Save best times to localStorage
  useEffect(() => {
    localStorage.setItem("minesweeperBestTimes", JSON.stringify(bestTimes))
  }, [bestTimes])

  // Timer
  useEffect(() => {
    if (gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameStatus])

  // Initialize grid
  const initializeGrid = () => {
    const settings = difficultySettings[difficulty]
    const { rows, cols } = settings

    // Create empty grid
    const newGrid: CellState[][] = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          })),
      )

    setGrid(newGrid)
    setMinesLeft(settings.mines)
    setTime(0)
    setGameStatus("notStarted")
    setFirstClick(true)
  }

  // Place mines after first click
  const placeMines = (firstRow: number, firstCol: number) => {
    const settings = difficultySettings[difficulty]
    const { rows, cols, mines } = settings

    // Create a copy of the grid
    const newGrid = JSON.parse(JSON.stringify(grid)) as CellState[][]

    // Place mines randomly
    let minesPlaced = 0
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows)
      const col = Math.floor(Math.random() * cols)

      // Skip if it's the first clicked cell or its neighbors, or if it already has a mine
      if ((Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1) || newGrid[row][col].isMine) {
        continue
      }

      newGrid[row][col].isMine = true
      minesPlaced++
    }

    // Calculate adjacent mines for each cell
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newGrid[row][col].isMine) {
          let count = 0
          // Check all 8 neighboring cells
          for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
              if (newGrid[r][c].isMine) {
                count++
              }
            }
          }
          newGrid[row][col].adjacentMines = count
        }
      }
    }

    setGrid(newGrid)
    setFirstClick(false)

    // Now reveal the first clicked cell
    revealCell(newGrid, firstRow, firstCol)
    setGrid(newGrid)
  }

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // Ignore clicks if game is over
    if (gameStatus === "won" || gameStatus === "lost") {
      return
    }

    // Get current cell
    const cell = grid[row][col]

    // Ignore clicks on flagged cells or already revealed cells
    if (cell.isFlagged || cell.isRevealed) {
      return
    }

    // Handle first click
    if (gameStatus === "notStarted" || firstClick) {
      placeMines(row, col)
      setGameStatus("playing")
      return
    }

    // Create a copy of the grid
    const newGrid = JSON.parse(JSON.stringify(grid)) as CellState[][]

    // If clicked on a mine, game over
    if (cell.isMine) {
      // Reveal all mines
      for (let r = 0; r < newGrid.length; r++) {
        for (let c = 0; c < newGrid[0].length; c++) {
          if (newGrid[r][c].isMine) {
            newGrid[r][c].isRevealed = true
          }
        }
      }
      newGrid[row][col].isRevealed = true
      setGrid(newGrid)
      setGameStatus("lost")
      return
    }

    // Reveal the clicked cell
    revealCell(newGrid, row, col)

    // Check if player has won
    if (checkWin(newGrid)) {
      // Flag all remaining mines
      for (let r = 0; r < newGrid.length; r++) {
        for (let c = 0; c < newGrid[0].length; c++) {
          if (newGrid[r][c].isMine && !newGrid[r][c].isFlagged) {
            newGrid[r][c].isFlagged = true
          }
        }
      }
      setGrid(newGrid)
      setMinesLeft(0)
      setGameStatus("won")

      // Update best time if needed
      if (!bestTimes[difficulty] || time < bestTimes[difficulty]!) {
        setBestTimes((prev) => ({
          ...prev,
          [difficulty]: time,
        }))
      }

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
      return
    }

    setGrid(newGrid)
  }

  // Reveal cell and its neighbors if it's empty
  const revealCell = (grid: CellState[][], row: number, col: number) => {
    const rows = grid.length
    const cols = grid[0].length

    // Check if out of bounds or already revealed or flagged
    if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col].isRevealed || grid[row][col].isFlagged) {
      return
    }

    // Reveal the cell
    grid[row][col].isRevealed = true

    // If it's an empty cell (no adjacent mines), reveal neighbors
    if (grid[row][col].adjacentMines === 0) {
      // Reveal all 8 neighboring cells
      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
          if (r !== row || c !== col) {
            revealCell(grid, r, c)
          }
        }
      }
    }
  }

  // Handle right-click (flag)
  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault() // Prevent context menu

    // Ignore right-clicks if game is over or not started
    if (gameStatus === "won" || gameStatus === "lost") {
      return
    }

    // Start game on first right-click
    if (gameStatus === "notStarted") {
      setGameStatus("playing")
    }

    // Get current cell
    const cell = grid[row][col]

    // Ignore right-clicks on revealed cells
    if (cell.isRevealed) {
      return
    }

    // Create a copy of the grid
    const newGrid = JSON.parse(JSON.stringify(grid)) as CellState[][]

    // Toggle flag
    newGrid[row][col].isFlagged = !cell.isFlagged

    // Update mines left counter
    setMinesLeft((prev) => (cell.isFlagged ? prev + 1 : prev - 1))

    setGrid(newGrid)
  }

  // Check if player has won
  const checkWin = (grid: CellState[][]) => {
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        // If a non-mine cell is not revealed, player hasn't won yet
        if (!grid[row][col].isMine && !grid[row][col].isRevealed) {
          return false
        }
      }
    }
    return true
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Change difficulty
  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
    setGameStatus("notStarted")
  }

  // Start a new game
  const startNewGame = () => {
    initializeGrid()
  }

  // Get cell color based on adjacent mines
  const getCellColor = (count: number) => {
    switch (count) {
      case 1:
        return "text-blue-500"
      case 2:
        return "text-green-600"
      case 3:
        return "text-red-500"
      case 4:
        return "text-purple-700"
      case 5:
        return "text-orange-700"
      case 6:
        return "text-cyan-600"
      case 7:
        return "text-black"
      case 8:
        return "text-gray-600"
      default:
        return ""
    }
  }

  // Get game face based on status
  const getGameFace = () => {
    switch (gameStatus) {
      case "won":
        return <Smile className="h-6 w-6 text-yellow-500" />
      case "lost":
        return <Frown className="h-6 w-6 text-red-500" />
      default:
        return <Meh className="h-6 w-6 text-yellow-500" />
    }
  }

  // Render the game grid
  const renderGrid = () => {
    if (grid.length === 0) {
      initializeGrid()
      return null
    }

    return (
      <div
        className="grid gap-px bg-gray-300 dark:bg-gray-700 p-1 rounded-md shadow-inner"
        style={{
          gridTemplateRows: `repeat(${grid.length}, ${cellSize.current}px)`,
          gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize.current}px)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "flex items-center justify-center font-bold select-none",
                cell.isRevealed
                  ? cell.isMine
                    ? "bg-red-500"
                    : "bg-gray-200 dark:bg-gray-800"
                  : "bg-gray-400 dark:bg-gray-600 hover:bg-gray-350 dark:hover:bg-gray-550",
                cell.isRevealed && !cell.isMine && getCellColor(cell.adjacentMines),
              )}
              style={{
                width: `${cellSize.current}px`,
                height: `${cellSize.current}px`,
                fontSize: `${Math.max(cellSize.current * 0.5, 14)}px`,
              }}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
              disabled={gameStatus === "won" || gameStatus === "lost"}
            >
              {cell.isRevealed ? (
                cell.isMine ? (
                  <Bomb className="h-4 w-4 text-black" />
                ) : cell.adjacentMines > 0 ? (
                  cell.adjacentMines
                ) : null
              ) : cell.isFlagged ? (
                <Flag className="h-4 w-4 text-red-600" />
              ) : null}
            </button>
          )),
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {gameStatus === "notStarted" && grid.length === 0 ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-background rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">Minesweeper</h2>
          <p className="text-center text-muted-foreground">Clear the minefield without detonating any mines!</p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <h3 className="text-lg font-semibold">Select Difficulty:</h3>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(difficultySettings) as Difficulty[]).map((level) => (
                <Button
                  key={level}
                  variant={difficulty === level ? "default" : "outline"}
                  onClick={() => changeDifficulty(level)}
                  className="w-full"
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>

            <div className="mt-4">
              <Button onClick={startNewGame} className="w-full" size="lg">
                Start Game
              </Button>
            </div>

            {/* Difficulty info */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Difficulty Info:</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Beginner:</span> 9×9 grid, 10 mines
                </p>
                <p>
                  <span className="font-medium">Intermediate:</span> 16×16 grid, 40 mines
                </p>
                <p>
                  <span className="font-medium">Expert:</span> 16×30 grid, 99 mines
                </p>
              </div>
            </div>

            {/* Best times */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Best Times:</h3>
              <div className="space-y-1">
                {Object.entries(bestTimes).map(([level, time]) => (
                  <div key={level} className="flex justify-between">
                    <span>{level.charAt(0).toUpperCase() + level.slice(1)}:</span>
                    <span>{time !== null ? formatTime(time) : "N/A"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to play */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">How to Play:</h3>
              <ul className="space-y-1 text-sm list-disc list-inside">
                <li>Left-click to reveal a cell</li>
                <li>Right-click to flag a potential mine</li>
                <li>Numbers show how many mines are adjacent</li>
                <li>Clear all non-mine cells to win</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {/* Game header */}
          <div className="flex justify-between items-center w-full max-w-2xl mb-4 p-3 bg-background rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-500" />
              <div className="text-xl font-mono font-bold">{minesLeft}</div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={startNewGame}
              title="New Game"
            >
              {getGameFace()}
            </Button>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div className="text-xl font-mono font-bold">{formatTime(time)}</div>
            </div>
          </div>

          {/* Game grid */}
          <div className="mb-6 overflow-auto max-w-full">{renderGrid()}</div>

          {/* Game controls */}
          <div className="flex gap-4 mb-4">
            <Button onClick={startNewGame} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              New Game
            </Button>
            <Button onClick={() => setGrid([])} variant="outline">
              Change Difficulty
            </Button>
          </div>

          {/* Game over message */}
          {gameStatus === "won" && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg text-center">
              <h3 className="text-lg font-bold">You Win!</h3>
              <p>
                Time: {formatTime(time)}
                {bestTimes[difficulty] === time && " (New Best Time!)"}
              </p>
            </div>
          )}

          {gameStatus === "lost" && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg text-center">
              <h3 className="text-lg font-bold">Game Over!</h3>
              <p>Better luck next time.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
