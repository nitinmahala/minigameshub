"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Box, Sphere } from "@react-three/drei"

// Player type
type Player = "X" | "O" | null
type BoardState = Player[][][]

// Create a 3D board (4x4x4)
const createEmptyBoard = (): BoardState => {
  return Array(4)
    .fill(null)
    .map(() =>
      Array(4)
        .fill(null)
        .map(() => Array(4).fill(null)),
    )
}

// Check for win in 3D
const checkWinner = (board: BoardState): { winner: Player; line: [number, number, number][] } | null => {
  const lines: [number, number, number][][] = []

  // Check rows in each direction
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      // X direction
      lines.push([
        [i, j, 0],
        [i, j, 1],
        [i, j, 2],
        [i, j, 3],
      ])
      // Y direction
      lines.push([
        [i, 0, j],
        [i, 1, j],
        [i, 2, j],
        [i, 3, j],
      ])
      // Z direction
      lines.push([
        [0, i, j],
        [1, i, j],
        [2, i, j],
        [3, i, j],
      ])
    }
  }

  // Check diagonals in each plane
  for (let i = 0; i < 4; i++) {
    // XY plane diagonals
    lines.push([
      [i, 0, 0],
      [i, 1, 1],
      [i, 2, 2],
      [i, 3, 3],
    ])
    lines.push([
      [i, 0, 3],
      [i, 1, 2],
      [i, 2, 1],
      [i, 3, 0],
    ])

    // XZ plane diagonals
    lines.push([
      [0, i, 0],
      [1, i, 1],
      [2, i, 2],
      [3, i, 3],
    ])
    lines.push([
      [0, i, 3],
      [1, i, 2],
      [2, i, 1],
      [3, i, 0],
    ])

    // YZ plane diagonals
    lines.push([
      [0, 0, i],
      [1, 1, i],
      [2, 2, i],
      [3, 3, i],
    ])
    lines.push([
      [0, 3, i],
      [1, 2, i],
      [2, 1, i],
      [3, 0, i],
    ])
  }

  // Check main diagonals through the cube
  lines.push([
    [0, 0, 0],
    [1, 1, 1],
    [2, 2, 2],
    [3, 3, 3],
  ])
  lines.push([
    [0, 0, 3],
    [1, 1, 2],
    [2, 2, 1],
    [3, 3, 0],
  ])
  lines.push([
    [0, 3, 0],
    [1, 2, 1],
    [2, 1, 2],
    [3, 0, 3],
  ])
  lines.push([
    [0, 3, 3],
    [1, 2, 2],
    [2, 1, 1],
    [3, 0, 0],
  ])

  // Check each line for a winner
  for (const line of lines) {
    const [a, b, c, d] = line
    const [ax, ay, az] = a
    const [bx, by, bz] = b
    const [cx, cy, cz] = c
    const [dx, dy, dz] = d

    if (
      board[ax][ay][az] &&
      board[ax][ay][az] === board[bx][by][bz] &&
      board[ax][ay][az] === board[cx][cy][cz] &&
      board[ax][ay][az] === board[dx][dy][dz]
    ) {
      return { winner: board[ax][ay][az], line }
    }
  }

  return null
}

// Check if board is full
const isBoardFull = (board: BoardState): boolean => {
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      for (let z = 0; z < 4; z++) {
        if (board[x][y][z] === null) {
          return false
        }
      }
    }
  }
  return true
}

// 3D Game Board Component
const GameBoard = ({
  board,
  handleCellClick,
  winningLine,
  currentPlayer,
}: {
  board: BoardState
  handleCellClick: (x: number, y: number, z: number) => void
  winningLine: [number, number, number][] | null
  currentPlayer: Player
}) => {
  const { camera } = useThree()
  const controlsRef = useRef<any>()

  // Set initial camera position
  useEffect(() => {
    camera.position.set(8, 8, 8)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Auto-rotate the camera slightly
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })

  return (
    <>
      <OrbitControls ref={controlsRef} enableZoom={true} enablePan={true} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={0.5} />

      {/* Grid lines */}
      <gridHelper args={[8, 4]} position={[0, -2, 0]} />

      {/* Game board frame */}
      <Box
        args={[8, 8, 8]}
        position={[0, 0, 0]}
        material-color="transparent"
        material-transparent={true}
        material-opacity={0.1}
      />

      {/* Cells */}
      {board.map((plane, x) =>
        plane.map((row, y) =>
          row.map((cell, z) => {
            const isWinningCell = winningLine?.some(([wx, wy, wz]) => wx === x && wy === y && wz === z)

            // Calculate position in 3D space
            // Convert from 0-3 index to -3 to 3 coordinates with 2 unit spacing
            const posX = (x - 1.5) * 2
            const posY = (y - 1.5) * 2
            const posZ = (z - 1.5) * 2

            return (
              <group key={`${x}-${y}-${z}`} position={[posX, posY, posZ]}>
                {/* Cell marker */}
                <Box
                  args={[1.8, 1.8, 1.8]}
                  onClick={() => handleCellClick(x, y, z)}
                  material-color={isWinningCell ? "#4ade80" : "transparent"}
                  material-transparent={true}
                  material-opacity={isWinningCell ? 0.3 : 0.1}
                >
                  <meshStandardMaterial
                    color={cell ? (cell === "X" ? "#3b82f6" : "#ef4444") : "#888888"}
                    transparent
                    opacity={cell ? 0.2 : 0.05}
                  />
                </Box>

                {/* Player marker */}
                {cell === "X" && (
                  <group>
                    <Box args={[0.3, 1.2, 0.3]} rotation={[0, 0, Math.PI / 4]} material-color="#3b82f6" />
                    <Box args={[0.3, 1.2, 0.3]} rotation={[0, 0, -Math.PI / 4]} material-color="#3b82f6" />
                  </group>
                )}

                {cell === "O" && (
                  <Sphere
                    args={[0.7, 16, 16]}
                    material-color="#ef4444"
                    material-transparent={true}
                    material-opacity={0.8}
                  />
                )}

                {/* Hover effect for empty cells */}
                {!cell && (
                  <Box
                    args={[1.8, 1.8, 1.8]}
                    onClick={() => handleCellClick(x, y, z)}
                    onPointerOver={(e) => {
                      document.body.style.cursor = "pointer"
                      e.stopPropagation()
                    }}
                    onPointerOut={() => {
                      document.body.style.cursor = "auto"
                    }}
                    material-transparent={true}
                    material-opacity={0.01}
                  />
                )}

                {/* Coordinates text (for debugging) */}
                {/* <Text
                  position={[0, 0, 0]}
                  color="black"
                  fontSize={0.3}
                  anchorX="center"
                  anchorY="middle"
                >
                  {`${x},${y},${z}`}
                </Text> */}
              </group>
            )
          }),
        ),
      )}

      {/* Current player indicator */}
      <group position={[0, 4.5, 0]}>
        <Text position={[0, 0, 0]} color="white" fontSize={0.5} anchorX="center" anchorY="middle">
          {`Player ${currentPlayer}'s Turn`}
        </Text>
      </group>
    </>
  )
}

// Main Game Component
export default function ThreeDTicTacToe() {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X")
  const [winner, setWinner] = useState<Player>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [winningLine, setWinningLine] = useState<[number, number, number][] | null>(null)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const [viewMode, setViewMode] = useState<"3d" | "layers">("3d")
  const [currentLayer, setCurrentLayer] = useState(0)

  // Load scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem("3dTicTacToeScores")
    if (savedScores) {
      setScores(JSON.parse(savedScores))
    }
  }, [])

  // Save scores to localStorage
  useEffect(() => {
    localStorage.setItem("3dTicTacToeScores", JSON.stringify(scores))
  }, [scores])

  // Check for winner or draw
  useEffect(() => {
    const result = checkWinner(board)

    if (result) {
      setWinner(result.winner)
      setWinningLine(result.line)

      // Update scores
      if (result.winner === "X") {
        setScores((prev) => ({ ...prev, X: prev.X + 1 }))
      } else {
        setScores((prev) => ({ ...prev, O: prev.O + 1 }))
      }

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else if (isBoardFull(board)) {
      setIsDraw(true)
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }))
    }
  }, [board])

  // Handle cell click
  const handleCellClick = (x: number, y: number, z: number) => {
    // Return if cell is already filled or game is over
    if (board[x][y][z] || winner || isDraw) return

    // Update board
    const newBoard = [...board]
    newBoard[x][y][z] = currentPlayer
    setBoard(newBoard)

    // Switch player
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X")
  }

  // Reset game
  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer("X")
    setWinner(null)
    setIsDraw(false)
    setWinningLine(null)
  }

  // Reset scores
  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 })
  }

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === "3d" ? "layers" : "3d")
  }

  // Change current layer
  const changeLayer = (layer: number) => {
    setCurrentLayer(layer)
  }

  // Render 2D layer view
  const render2DLayer = () => {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-4 flex gap-2">
          {[0, 1, 2, 3].map((layer) => (
            <Button
              key={layer}
              variant={currentLayer === layer ? "default" : "outline"}
              onClick={() => changeLayer(layer)}
            >
              Layer {layer + 1}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 bg-muted p-4 rounded-lg">
          {board[currentLayer].map((row, y) =>
            row.map((cell, z) => {
              const isWinningCell = winningLine?.some(([wx, wy, wz]) => wx === currentLayer && wy === y && wz === z)

              return (
                <button
                  key={`${y}-${z}`}
                  className={cn(
                    "w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-md",
                    "bg-background border-2 transition-all",
                    isWinningCell ? "border-green-500 bg-green-100 dark:bg-green-900" : "border-border",
                    !cell && !winner && !isDraw && "hover:bg-muted-foreground/10",
                  )}
                  onClick={() => handleCellClick(currentLayer, y, z)}
                  disabled={!!cell || !!winner || isDraw}
                >
                  {cell && <span className={cell === "X" ? "text-blue-500" : "text-red-500"}>{cell}</span>}
                </button>
              )
            }),
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Coordinates: Layer {currentLayer + 1} (X), Rows (Y), Columns (Z)
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-xl font-semibold mb-4 text-center">
        {winner ? `Player ${winner} wins!` : isDraw ? "Game ended in a draw!" : `Player ${currentPlayer}'s turn`}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Game board */}
        <div className="bg-muted rounded-lg p-4 w-full max-w-2xl">
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={toggleViewMode}>
              {viewMode === "3d" ? "Switch to Layers View" : "Switch to 3D View"}
            </Button>
          </div>

          {viewMode === "3d" ? (
            <div className="h-[400px] w-full bg-gradient-to-b from-blue-900/20 to-purple-900/20 rounded-lg overflow-hidden">
              <Canvas>
                <GameBoard
                  board={board}
                  handleCellClick={handleCellClick}
                  winningLine={winningLine}
                  currentPlayer={currentPlayer}
                />
              </Canvas>
            </div>
          ) : (
            render2DLayer()
          )}
        </div>

        {/* Game controls */}
        <div className="flex flex-col items-center gap-6">
          {/* Game info */}
          <div className="bg-background p-4 rounded-lg shadow-sm w-full">
            <h3 className="text-lg font-semibold mb-2 text-center">Game Info</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Objective:</span> Connect 4 of your marks in a row (horizontally,
                vertically, diagonally, or in 3D).
              </p>
              <p className="text-sm">
                <span className="font-medium">Board:</span> 4×4×4 cube (64 positions)
              </p>
              <p className="text-sm">
                <span className="font-medium">Controls:</span> In 3D view, drag to rotate, scroll to zoom
              </p>
            </div>
          </div>

          {/* Current player */}
          <div className="bg-background p-4 rounded-lg shadow-sm w-full">
            <h3 className="text-lg font-semibold mb-2 text-center">Current Turn</h3>
            <div className="flex items-center justify-center gap-2">
              <div className={cn("h-6 w-6 rounded-full", currentPlayer === "X" ? "bg-blue-500" : "bg-red-500")} />
              <span className="text-lg">Player {currentPlayer}</span>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="bg-background p-4 rounded-lg shadow-sm w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Scoreboard</h3>
              <Button onClick={resetScores} variant="ghost" size="sm">
                Reset
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-bold text-xl text-blue-500">X</div>
                <div className="text-2xl">{scores.X}</div>
              </div>
              <div>
                <div className="font-bold text-xl">Draws</div>
                <div className="text-2xl">{scores.draws}</div>
              </div>
              <div>
                <div className="font-bold text-xl text-red-500">O</div>
                <div className="text-2xl">{scores.O}</div>
              </div>
            </div>
          </div>

          {/* Reset button */}
          <Button onClick={resetGame} className="w-full">
            New Game
          </Button>
        </div>
      </div>
    </div>
  )
}
