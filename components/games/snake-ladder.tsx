"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"

// Define snakes and ladders
const snakesAndLadders = {
  // Ladders: bottom -> top
  2: 38,
  7: 14,
  8: 31,
  15: 26,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  78: 98,
  // Snakes: top -> bottom
  16: 6,
  46: 25,
  49: 11,
  62: 19,
  64: 60,
  74: 53,
  89: 68,
  92: 88,
  95: 75,
  99: 80,
}

// Calculate snake and ladder positions for drawing
const calculatePositions = (cellSize: number, boardSize: number) => {
  const positions: Record<string, { start: { x: number; y: number }; end: { x: number; y: number }; type: string }> = {}

  Object.entries(snakesAndLadders).forEach(([start, end]) => {
    const startNum = Number.parseInt(start)
    const endNum = Number.parseInt(end.toString())

    // Calculate row and column for start position
    const startRow = boardSize - 1 - Math.floor((startNum - 1) / boardSize)
    let startCol = (startNum - 1) % boardSize
    if ((boardSize - 1 - startRow) % 2 === 1) {
      startCol = boardSize - 1 - startCol
    }

    // Calculate row and column for end position
    const endRow = boardSize - 1 - Math.floor((endNum - 1) / boardSize)
    let endCol = (endNum - 1) % boardSize
    if ((boardSize - 1 - endRow) % 2 === 1) {
      endCol = boardSize - 1 - endCol
    }

    positions[startNum] = {
      start: {
        x: startCol * cellSize + cellSize / 2,
        y: startRow * cellSize + cellSize / 2,
      },
      end: {
        x: endCol * cellSize + cellSize / 2,
        y: endRow * cellSize + cellSize / 2,
      },
      type: startNum < endNum ? "ladder" : "snake",
    }
  })

  return positions
}

// Player type
type Player = {
  id: number
  name: string
  position: number
  color: string
  prevPosition: number
}

export default function SnakeLadder() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "Player 1", position: 0, color: "bg-blue-500", prevPosition: 0 },
    { id: 2, name: "Player 2", position: 0, color: "bg-red-500", prevPosition: 0 },
  ])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [diceValue, setDiceValue] = useState(1)
  const [isRolling, setIsRolling] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState("Roll the dice to start!")
  const [boardSize] = useState(10) // 10x10 board
  const [cellSize, setCellSize] = useState(48) // Cell size in pixels
  const [showAnimation, setShowAnimation] = useState<{ type: string; from: number; to: number } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Record<string, any>>({})

  // Update cell size based on board container width
  useEffect(() => {
    const updateCellSize = () => {
      if (boardRef.current) {
        const containerWidth = Math.min(boardRef.current.offsetWidth, 480) // Max width of 480px
        const newCellSize = Math.floor(containerWidth / boardSize)
        setCellSize(newCellSize)
      }
    }

    updateCellSize()
    window.addEventListener("resize", updateCellSize)

    return () => {
      window.removeEventListener("resize", updateCellSize)
    }
  }, [boardSize])

  // Calculate positions for snakes and ladders
  useEffect(() => {
    setPositions(calculatePositions(cellSize, boardSize))
  }, [cellSize, boardSize])

  // Roll the dice
  const rollDice = () => {
    if (isRolling || gameOver) return

    setIsRolling(true)
    setMessage("Rolling...")

    // Simulate dice rolling animation
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1)
    }, 100)

    // Stop rolling after 1 second and move player
    setTimeout(() => {
      clearInterval(rollInterval)
      const finalDiceValue = Math.floor(Math.random() * 6) + 1
      setDiceValue(finalDiceValue)
      movePlayer(finalDiceValue)
      setIsRolling(false)
    }, 1000)
  }

  // Move the player based on dice value
  const movePlayer = (steps: number) => {
    const playersCopy = [...players]
    const player = playersCopy[currentPlayer]
    const oldPosition = player.position
    const newPosition = player.position + steps

    // Check if player won
    if (newPosition === 100) {
      playersCopy[currentPlayer].prevPosition = oldPosition
      playersCopy[currentPlayer].position = 100
      setPlayers(playersCopy)
      setGameOver(true)
      setMessage(`${player.name} wins!`)
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
      return
    }

    // Check if player went beyond 100
    if (newPosition > 100) {
      setMessage(`${player.name} rolled too high! Stay in place.`)
      // Switch to next player
      setCurrentPlayer((currentPlayer + 1) % players.length)
      return
    }

    // Update player position first
    playersCopy[currentPlayer].prevPosition = oldPosition
    playersCopy[currentPlayer].position = newPosition
    setPlayers(playersCopy)

    // Check if player landed on a snake or ladder
    if (snakesAndLadders[newPosition]) {
      const isLadder = snakesAndLadders[newPosition] > newPosition

      // Show animation
      setShowAnimation({
        type: isLadder ? "ladder" : "snake",
        from: newPosition,
        to: snakesAndLadders[newPosition],
      })

      // Play sound
      // if (isLadder) {
      //   ladderSound.play()
      // } else {
      //   snakeSound.play()
      // }

      setTimeout(() => {
        setMessage(
          `${player.name} landed on ${isLadder ? "a ladder" : "a snake"}! ${
            isLadder ? "Climb up" : "Slide down"
          } to ${snakesAndLadders[newPosition]}.`,
        )

        // Update player position after animation
        const finalPlayersCopy = [...playersCopy]
        finalPlayersCopy[currentPlayer].prevPosition = newPosition
        finalPlayersCopy[currentPlayer].position = snakesAndLadders[newPosition]
        setPlayers(finalPlayersCopy)

        // Clear animation after delay
        setTimeout(() => {
          setShowAnimation(null)
          // Switch to next player
          setCurrentPlayer((currentPlayer + 1) % players.length)
        }, 1500)
      }, 500)
    } else {
      setMessage(`${player.name} moved to ${newPosition}.`)
      // Switch to next player
      setTimeout(() => {
        setCurrentPlayer((currentPlayer + 1) % players.length)
      }, 500)
    }
  }

  // Reset the game
  const resetGame = () => {
    setPlayers(
      players.map((player) => ({
        ...player,
        position: 0,
        prevPosition: 0,
      })),
    )
    setCurrentPlayer(0)
    setDiceValue(1)
    setIsRolling(false)
    setGameOver(false)
    setShowAnimation(null)
    setMessage("Roll the dice to start!")
  }

  // Generate the board cells
  const renderBoard = () => {
    const cells = []

    for (let row = boardSize - 1; row >= 0; row--) {
      const rowCells = []
      for (let col = 0; col < boardSize; col++) {
        // Calculate cell number based on snake and ladder board pattern
        // Even rows go left to right, odd rows go right to left
        let cellNumber
        if ((boardSize - 1 - row) % 2 === 0) {
          cellNumber = (boardSize - 1 - row) * boardSize + col + 1
        } else {
          cellNumber = (boardSize - row) * boardSize - col
        }

        // Check if any player is on this cell
        const playersOnCell = players.filter((player) => player.position === cellNumber)

        // Check if cell has a snake or ladder
        const hasSnakeOrLadder = Object.keys(snakesAndLadders).includes(cellNumber.toString())
        const isSnake = hasSnakeOrLadder && snakesAndLadders[cellNumber] < cellNumber
        const isLadder = hasSnakeOrLadder && snakesAndLadders[cellNumber] > cellNumber

        rowCells.push(
          <div
            key={`cell-${row}-${col}`}
            className={cn(
              "border border-border flex items-center justify-center relative",
              cellNumber % 2 === 0 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-amber-100 dark:bg-amber-900/30",
              isSnake && "bg-red-100 dark:bg-red-950/50",
              isLadder && "bg-green-100 dark:bg-green-950/50",
            )}
            style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
          >
            <span className="text-xs md:text-sm font-medium">{cellNumber}</span>

            {/* Start/Finish labels */}
            {cellNumber === 1 && (
              <div className="absolute bottom-0 left-0 bg-green-500 text-white text-xs px-1 rounded-tr-md">START</div>
            )}
            {cellNumber === 100 && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl-md">FINISH</div>
            )}

            {/* Player tokens */}
            {playersOnCell.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {playersOnCell.map((player, idx) => (
                  <motion.div
                    key={player.id}
                    className={cn("rounded-full border-2 border-white shadow-md", player.color)}
                    style={{
                      width: `${cellSize * 0.6}px`,
                      height: `${cellSize * 0.6}px`,
                      marginLeft: idx * 4,
                      marginTop: idx * 4,
                      zIndex: 10,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    title={player.name}
                  />
                ))}
              </div>
            )}
          </div>,
        )
      }
      cells.push(
        <div key={`row-${row}`} className="flex">
          {rowCells}
        </div>,
      )
    }

    return cells
  }

  // Render dice based on current value
  const renderDice = () => {
    const diceIcons = [
      <Dice1 key="dice-1" className="h-12 w-12" />,
      <Dice2 key="dice-2" className="h-12 w-12" />,
      <Dice3 key="dice-3" className="h-12 w-12" />,
      <Dice4 key="dice-4" className="h-12 w-12" />,
      <Dice5 key="dice-5" className="h-12 w-12" />,
      <Dice6 key="dice-6" className="h-12 w-12" />,
    ]
    return (
      <motion.div
        animate={isRolling ? { rotateX: [0, 360, 720, 1080], rotateY: [0, 360, 720, 1080] } : {}}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg"
      >
        {diceIcons[diceValue - 1]}
      </motion.div>
    )
  }

  // Render snakes and ladders on the board
  const renderSnakesAndLadders = () => {
    return Object.entries(positions).map(([startPos, data]) => {
      const { start, end, type } = data

      if (type === "ladder") {
        // Draw ladder
        const angle = Math.atan2(end.y - start.y, end.x - start.x)
        const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        const isHighlighted = showAnimation?.type === "ladder" && showAnimation.from === Number.parseInt(startPos)

        return (
          <div
            key={`ladder-${startPos}`}
            className={cn(
              "absolute origin-left border-l-4 border-r-4 border-dashed",
              isHighlighted ? "border-yellow-500 animate-pulse" : "border-amber-700",
            )}
            style={{
              left: `${start.x}px`,
              top: `${start.y}px`,
              width: `${length}px`,
              height: "12px",
              transform: `rotate(${angle}rad)`,
              zIndex: 5,
            }}
          >
            {/* Ladder rungs */}
            {[...Array(Math.floor(length / 20))].map((_, i) => (
              <div
                key={`rung-${i}`}
                className={cn(
                  "absolute top-1 h-2 border-t-2",
                  isHighlighted ? "border-yellow-500" : "border-amber-700",
                )}
                style={{
                  left: `${i * 20 + 10}px`,
                  width: "16px",
                }}
              />
            ))}
          </div>
        )
      } else {
        // Draw snake
        const isHighlighted = showAnimation?.type === "snake" && showAnimation.from === Number.parseInt(startPos)

        // Create a curved path for the snake
        const midX = (start.x + end.x) / 2 + (Math.random() * 20 - 10)
        const midY = (start.y + end.y) / 2 + (Math.random() * 20 - 10)

        const path = `M ${start.x} ${start.y} Q ${midX} ${midY}, ${end.x} ${end.y}`

        return (
          <svg key={`snake-${startPos}`} className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 5 }}>
            <path
              d={path}
              fill="none"
              className={cn("stroke-[6px] stroke-green-600", isHighlighted && "animate-pulse stroke-green-400")}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Snake head */}
            <circle cx={end.x} cy={end.y} r={6} className={cn("fill-green-700", isHighlighted && "fill-green-500")} />
          </svg>
        )
      }
    })
  }

  // Render animation for snake or ladder movement
  const renderAnimation = () => {
    if (!showAnimation) return null

    const { type, from, to } = showAnimation
    const player = players[currentPlayer]

    if (type === "snake") {
      return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <motion.div
            className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-4xl"
              animate={{
                y: [0, 10, 0, 10, 0],
                rotateZ: [0, 10, -10, 10, 0],
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              🐍
            </motion.div>
          </motion.div>
        </div>
      )
    }

    if (type === "ladder") {
      return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <motion.div
            className="bg-amber-600 rounded-full w-16 h-16 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-4xl"
              animate={{
                y: [0, -20, 0],
                rotateZ: [0, 10, 0],
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              🪜
            </motion.div>
          </motion.div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-xl font-semibold mb-4 text-center">{message}</div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Game board */}
        <div
          ref={boardRef}
          className="relative overflow-hidden p-2 bg-amber-200 dark:bg-amber-950 rounded-lg shadow-lg border-4 border-amber-800"
        >
          <div className="relative">
            {renderBoard()}
            {renderSnakesAndLadders()}
          </div>
        </div>

        {/* Game controls */}
        <div className="flex flex-col items-center gap-6">
          {/* Current player */}
          <div className="bg-background p-4 rounded-lg shadow-sm w-full">
            <h3 className="text-lg font-semibold mb-2 text-center">Current Turn</h3>
            <div className="flex items-center justify-center gap-2">
              <div
                className={cn("h-6 w-6 rounded-full", players[currentPlayer].color)}
                title={players[currentPlayer].name}
              />
              <span className="text-lg">{players[currentPlayer].name}</span>
            </div>
          </div>

          {/* Dice */}
          <div className="bg-background p-6 rounded-lg shadow-sm w-full flex flex-col items-center">
            <div className="mb-6">{renderDice()}</div>
            <Button
              onClick={rollDice}
              disabled={isRolling || gameOver}
              className="w-full text-lg py-6"
              variant={gameOver ? "outline" : "default"}
              size="lg"
            >
              {isRolling ? "Rolling..." : "Roll Dice"}
            </Button>
          </div>

          {/* Player positions */}
          <div className="bg-background p-4 rounded-lg shadow-sm w-full">
            <h3 className="text-lg font-semibold mb-2 text-center">Players</h3>
            <div className="space-y-3">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-6 w-6 rounded-full", player.color)} />
                    <span>{player.name}</span>
                  </div>
                  <span className="font-medium">Position: {player.position}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <Button onClick={resetGame} variant="outline" className="w-full">
            New Game
          </Button>
        </div>
      </div>

      {/* Animation overlay */}
      <AnimatePresence>{renderAnimation()}</AnimatePresence>
    </div>
  )
}
