"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"

// Game settings
type GameMode = "singlePlayer" | "twoPlayer"
type Difficulty = "easy" | "medium" | "hard"

const difficultySettings = {
  easy: {
    aiSpeed: 3,
    ballSpeed: 5,
    speedIncrease: 0.2,
  },
  medium: {
    aiSpeed: 4,
    ballSpeed: 6,
    speedIncrease: 0.3,
  },
  hard: {
    aiSpeed: 5.5,
    ballSpeed: 7,
    speedIncrease: 0.4,
  },
}

// Game objects
type Paddle = {
  x: number
  y: number
  width: number
  height: number
  speed: number
  score: number
}

type Ball = {
  x: number
  y: number
  radius: number
  speedX: number
  speedY: number
  maxSpeed: number
}

export default function Pong() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false)
  const [gamePaused, setGamePaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<"player1" | "player2" | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>("singlePlayer")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [winningScore, setWinningScore] = useState(5)

  // Game objects
  const [player1, setPlayer1] = useState<Paddle>({
    x: 10,
    y: 200,
    width: 10,
    height: 100,
    speed: 8,
    score: 0,
  })
  const [player2, setPlayer2] = useState<Paddle>({
    x: 780,
    y: 200,
    width: 10,
    height: 100,
    speed: 8,
    score: 0,
  })
  const [ball, setBall] = useState<Ball>({
    x: 400,
    y: 250,
    radius: 10,
    speedX: 5,
    speedY: 5,
    maxSpeed: 15,
  })

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const animationFrameRef = useRef<number>(0)

  // Input state
  const keysPressed = useRef<Set<string>>(new Set())
  const touchStartY = useRef<number | null>(null)

  // Initialize the game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas dimensions
    canvas.width = 800
    canvas.height = 500
    contextRef.current = canvas.getContext("2d")

    // Draw initial state
    const ctx = contextRef.current
    if (ctx) {
      ctx.fillStyle = "#1a1a1a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw center line
      ctx.setLineDash([10, 15])
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, 0)
      ctx.lineTo(canvas.width / 2, canvas.height)
      ctx.strokeStyle = "#444"
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Set up keyboard event listeners
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent) => {
    keysPressed.current.add(e.key.toLowerCase())

    // Pause game with Escape key
    if (e.key === "Escape" && gameStarted) {
      setGamePaused((prev) => !prev)
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    keysPressed.current.delete(e.key.toLowerCase())
  }

  // Handle touch input for mobile
  const handleTouchStart = (e: React.TouchEvent, player: "player1" | "player2") => {
    if (!gameStarted || gamePaused) return
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent, player: "player1" | "player2") => {
    if (!gameStarted || gamePaused || touchStartY.current === null) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touchY = e.touches[0].clientY - rect.top
    const deltaY = touchY - touchStartY.current

    if (player === "player1") {
      setPlayer1((prev) => ({
        ...prev,
        y: Math.max(0, Math.min(canvas.height - prev.height, prev.y + deltaY * 0.5)),
      }))
    } else if (player === "player2" && gameMode === "twoPlayer") {
      setPlayer2((prev) => ({
        ...prev,
        y: Math.max(0, Math.min(canvas.height - prev.height, prev.y + deltaY * 0.5)),
      }))
    }

    touchStartY.current = touchY
  }

  const handleTouchEnd = () => {
    touchStartY.current = null
  }

  // Start a new game
  const startGame = () => {
    // Reset game state
    setGameStarted(true)
    setGamePaused(false)
    setGameOver(false)
    setWinner(null)

    // Reset paddles
    setPlayer1({
      x: 10,
      y: 200,
      width: 10,
      height: 100,
      speed: 8,
      score: 0,
    })
    setPlayer2({
      x: 780,
      y: 200,
      width: 10,
      height: 100,
      speed: 8,
      score: 0,
    })

    // Reset ball with random direction
    const settings = difficultySettings[difficulty]
    const randomAngle = (Math.random() * Math.PI) / 4 - Math.PI / 8 // Random angle between -22.5 and 22.5 degrees
    const direction = Math.random() > 0.5 ? 1 : -1 // Random initial direction

    setBall({
      x: 400,
      y: 250,
      radius: 10,
      speedX: direction * settings.ballSpeed * Math.cos(randomAngle),
      speedY: settings.ballSpeed * Math.sin(randomAngle),
      maxSpeed: 15,
    })

    // Start game loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Use setTimeout to ensure state updates before starting the game loop
    setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }, 0)
  }

  // Game loop
  const gameLoop = () => {
    if (!gameStarted || gamePaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
      return
    }

    updateGame()
    drawGame()
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }

  // Update game state
  const updateGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Handle player 1 input (keyboard)
    if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) {
      setPlayer1((prev) => ({
        ...prev,
        y: Math.max(0, prev.y - prev.speed),
      }))
    }
    if (keysPressed.current.has("s") || keysPressed.current.has("arrowdown")) {
      setPlayer1((prev) => ({
        ...prev,
        y: Math.min(canvas.height - prev.height, prev.y + prev.speed),
      }))
    }

    // Handle player 2 input (keyboard) in two-player mode
    if (gameMode === "twoPlayer") {
      if (keysPressed.current.has("i")) {
        setPlayer2((prev) => ({
          ...prev,
          y: Math.max(0, prev.y - prev.speed),
        }))
      }
      if (keysPressed.current.has("k")) {
        setPlayer2((prev) => ({
          ...prev,
          y: Math.min(canvas.height - prev.height, prev.y + prev.speed),
        }))
      }
    } else {
      // AI movement in single-player mode
      const aiSpeed = difficultySettings[difficulty].aiSpeed
      const aiTarget = ball.y - player2.height / 2

      if (player2.y < aiTarget - aiSpeed / 2) {
        setPlayer2((prev) => ({
          ...prev,
          y: Math.min(canvas.height - prev.height, prev.y + aiSpeed),
        }))
      } else if (player2.y > aiTarget + aiSpeed / 2) {
        setPlayer2((prev) => ({
          ...prev,
          y: Math.max(0, prev.y - aiSpeed),
        }))
      }
    }

    // Update ball position
    setBall((prev) => {
      let newX = prev.x + prev.speedX
      let newY = prev.y + prev.speedY
      let newSpeedX = prev.speedX
      let newSpeedY = prev.speedY

      // Ball collision with top and bottom walls
      if (newY - prev.radius < 0 || newY + prev.radius > canvas.height) {
        newSpeedY = -newSpeedY
        newY = newY - prev.radius < 0 ? prev.radius : canvas.height - prev.radius
      }

      // Ball collision with paddles
      // Player 1 paddle
      if (
        newX - prev.radius <= player1.x + player1.width &&
        newX + prev.radius >= player1.x &&
        newY >= player1.y &&
        newY <= player1.y + player1.height
      ) {
        // Calculate bounce angle based on where the ball hits the paddle
        const hitPosition = (newY - player1.y) / player1.height - 0.5 // -0.5 to 0.5
        const bounceAngle = (hitPosition * Math.PI) / 3 // -60 to 60 degrees

        // Increase speed slightly with each hit
        const speedIncrease = difficultySettings[difficulty].speedIncrease
        const speed = Math.min(prev.maxSpeed, Math.sqrt(newSpeedX * newSpeedX + newSpeedY * newSpeedY) + speedIncrease)

        newSpeedX = Math.abs(speed * Math.cos(bounceAngle))
        newSpeedY = speed * Math.sin(bounceAngle)
        newX = player1.x + player1.width + prev.radius
      }

      // Player 2 paddle
      if (
        newX + prev.radius >= player2.x &&
        newX - prev.radius <= player2.x + player2.width &&
        newY >= player2.y &&
        newY <= player2.y + player2.height
      ) {
        // Calculate bounce angle based on where the ball hits the paddle
        const hitPosition = (newY - player2.y) / player2.height - 0.5 // -0.5 to 0.5
        const bounceAngle = (hitPosition * Math.PI) / 3 // -60 to 60 degrees

        // Increase speed slightly with each hit
        const speedIncrease = difficultySettings[difficulty].speedIncrease
        const speed = Math.min(prev.maxSpeed, Math.sqrt(newSpeedX * newSpeedX + newSpeedY * newSpeedY) + speedIncrease)

        newSpeedX = -Math.abs(speed * Math.cos(bounceAngle))
        newSpeedY = speed * Math.sin(bounceAngle)
        newX = player2.x - prev.radius
      }

      // Ball out of bounds (scoring)
      if (newX < 0) {
        // Player 2 scores
        setPlayer2((prev) => {
          const newScore = prev.score + 1

          // Check for game over
          if (newScore >= winningScore) {
            setGameOver(true)
            setWinner("player2")

            // Trigger confetti for AI win in single player mode
            if (gameMode === "singlePlayer") {
              confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 },
              })
            }
          }

          return { ...prev, score: newScore }
        })

        // Reset ball
        resetBall()
        return prev // Return previous state since we're resetting the ball
      } else if (newX > canvas.width) {
        // Player 1 scores
        setPlayer1((prev) => {
          const newScore = prev.score + 1

          // Check for game over
          if (newScore >= winningScore) {
            setGameOver(true)
            setWinner("player1")

            // Trigger confetti for player win
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            })
          }

          return { ...prev, score: newScore }
        })

        // Reset ball
        resetBall()
        return prev // Return previous state since we're resetting the ball
      }

      return {
        ...prev,
        x: newX,
        y: newY,
        speedX: newSpeedX,
        speedY: newSpeedY,
      }
    })
  }

  // Reset ball to center with random direction
  const resetBall = () => {
    const settings = difficultySettings[difficulty]
    const randomAngle = (Math.random() * Math.PI) / 4 - Math.PI / 8 // Random angle between -22.5 and 22.5 degrees
    const direction = Math.random() > 0.5 ? 1 : -1 // Random initial direction

    setTimeout(() => {
      setBall({
        x: 400,
        y: 250,
        radius: 10,
        speedX: direction * settings.ballSpeed * Math.cos(randomAngle),
        speedY: settings.ballSpeed * Math.sin(randomAngle),
        maxSpeed: 15,
      })
    }, 1000) // Short delay before serving the ball again
  }

  // Draw game on canvas
  const drawGame = () => {
    const context = contextRef.current
    const canvas = canvasRef.current
    if (!context || !canvas) return

    // Clear canvas
    context.fillStyle = "#1a1a1a"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Draw center line
    context.setLineDash([10, 15])
    context.beginPath()
    context.moveTo(canvas.width / 2, 0)
    context.lineTo(canvas.width / 2, canvas.height)
    context.strokeStyle = "#444"
    context.lineWidth = 2
    context.stroke()
    context.setLineDash([])

    // Draw scores
    context.font = "60px Arial"
    context.fillStyle = "#333"
    context.textAlign = "center"
    context.fillText(player1.score.toString(), canvas.width / 4, 80)
    context.fillText(player2.score.toString(), (canvas.width / 4) * 3, 80)

    // Draw paddles
    context.fillStyle = "#fff"
    context.fillRect(player1.x, player1.y, player1.width, player1.height)
    context.fillRect(player2.x, player2.y, player2.width, player2.height)

    // Draw ball
    context.beginPath()
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    context.fillStyle = "#fff"
    context.fill()
    context.closePath()

    // Draw pause screen
    if (gamePaused) {
      context.fillStyle = "rgba(0, 0, 0, 0.5)"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.font = "30px Arial"
      context.fillStyle = "#fff"
      context.textAlign = "center"
      context.fillText("PAUSED", canvas.width / 2, canvas.height / 2)
      context.font = "20px Arial"
      context.fillText("Press ESC to resume", canvas.width / 2, canvas.height / 2 + 40)
    }

    // Draw game over screen
    if (gameOver) {
      context.fillStyle = "rgba(0, 0, 0, 0.7)"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.font = "40px Arial"
      context.fillStyle = "#fff"
      context.textAlign = "center"
      context.fillText(
        `${winner === "player1" ? (gameMode === "twoPlayer" ? "Player 1" : "You") : gameMode === "twoPlayer" ? "Player 2" : "Computer"} Wins!`,
        canvas.width / 2,
        canvas.height / 2 - 20,
      )
      context.font = "20px Arial"
      context.fillText("Final Score", canvas.width / 2, canvas.height / 2 + 20)
      context.fillText(`${player1.score} - ${player2.score}`, canvas.width / 2, canvas.height / 2 + 50)
    }
  }

  // Change game mode
  const changeGameMode = (mode: GameMode) => {
    setGameMode(mode)
  }

  // Change difficulty
  const changeDifficulty = (level: Difficulty) => {
    setDifficulty(level)
  }

  // Change winning score
  const changeWinningScore = (score: number) => {
    setWinningScore(score)
  }

  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-background rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">Pong</h2>
          <p className="text-center text-muted-foreground">
            The classic arcade game! Score points by getting the ball past your opponent's paddle.
          </p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <h3 className="text-lg font-semibold">Game Mode:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={gameMode === "singlePlayer" ? "default" : "outline"}
                onClick={() => changeGameMode("singlePlayer")}
                className="w-full"
              >
                Single Player
              </Button>
              <Button
                variant={gameMode === "twoPlayer" ? "default" : "outline"}
                onClick={() => changeGameMode("twoPlayer")}
                className="w-full"
              >
                Two Players
              </Button>
            </div>

            {gameMode === "singlePlayer" && (
              <>
                <h3 className="text-lg font-semibold mt-2">Difficulty:</h3>
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
              </>
            )}

            <h3 className="text-lg font-semibold mt-2">Points to Win:</h3>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 7].map((score) => (
                <Button
                  key={score}
                  variant={winningScore === score ? "default" : "outline"}
                  onClick={() => changeWinningScore(score)}
                  className="w-full"
                >
                  {score}
                </Button>
              ))}
            </div>

            <div className="mt-4">
              <Button onClick={startGame} className="w-full" size="lg">
                Start Game
              </Button>
            </div>

            {/* Controls info */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Controls:</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Player 1:</span> W/S or Arrow Up/Down
                </p>
                {gameMode === "twoPlayer" && (
                  <p>
                    <span className="font-medium">Player 2:</span> I/K
                  </p>
                )}
                <p>
                  <span className="font-medium">Pause:</span> ESC
                </p>
                <p className="mt-2">You can also use touch controls on mobile devices.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {/* Game canvas */}
          <div className="relative mb-4 touch-none">
            <canvas
              ref={canvasRef}
              className="bg-gray-900 rounded-lg shadow-lg"
              width={800}
              height={500}
              style={{ maxWidth: "100%", height: "auto" }}
            />

            {/* Touch control overlays for mobile */}
            <div
              className="absolute left-0 top-0 w-1/2 h-full opacity-0"
              onTouchStart={(e) => handleTouchStart(e, "player1")}
              onTouchMove={(e) => handleTouchMove(e, "player1")}
              onTouchEnd={handleTouchEnd}
            />
            {gameMode === "twoPlayer" && (
              <div
                className="absolute right-0 top-0 w-1/2 h-full opacity-0"
                onTouchStart={(e) => handleTouchStart(e, "player2")}
                onTouchMove={(e) => handleTouchMove(e, "player2")}
                onTouchEnd={handleTouchEnd}
              />
            )}

            {/* Game controls overlay */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-background/80 hover:bg-background"
                onClick={() => setGamePaused(!gamePaused)}
              >
                {gamePaused ? "Resume" : "Pause"}
              </Button>
            </div>
          </div>

          {/* Game controls */}
          <div className="flex gap-4 mb-4">
            {gameOver ? (
              <>
                <Button onClick={startGame} variant="default">
                  Play Again
                </Button>
                <Button onClick={() => setGameStarted(false)} variant="outline">
                  Main Menu
                </Button>
              </>
            ) : (
              <Button onClick={() => setGameStarted(false)} variant="outline">
                Quit Game
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
