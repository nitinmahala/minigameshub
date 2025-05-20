"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { Timer, Award, Hammer } from "lucide-react"

type Difficulty = "easy" | "medium" | "hard"
type GameState = "idle" | "playing" | "gameOver"

// Difficulty settings
const difficultySettings = {
  easy: {
    duration: 30,
    moleInterval: [1000, 2000], // min, max time between moles in ms
    moleUpTime: [1000, 2000], // min, max time mole stays up in ms
    maxActiveMoles: 1,
  },
  medium: {
    duration: 30,
    moleInterval: [800, 1500],
    moleUpTime: [800, 1500],
    maxActiveMoles: 2,
  },
  hard: {
    duration: 30,
    moleInterval: [600, 1200],
    moleUpTime: [600, 1000],
    maxActiveMoles: 3,
  },
}

// Mole type
type Mole = {
  id: number
  isUp: boolean
  isHit: boolean
}

export default function WhackAMole() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [gameState, setGameState] = useState<GameState>("idle")
  const [moles, setMoles] = useState<Mole[]>(
    Array(9)
      .fill(null)
      .map((_, i) => ({ id: i, isUp: false, isHit: false })),
  )
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(difficultySettings.easy.duration)
  const [highScores, setHighScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  })
  const [hammerPosition, setHammerPosition] = useState({ x: 0, y: 0 })
  const [isHammering, setIsHammering] = useState(false)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const moleTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  // Load high scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem("whackAMoleHighScores")
    if (savedScores) {
      setHighScores(JSON.parse(savedScores))
    }
  }, [])

  // Save high scores to localStorage
  useEffect(() => {
    localStorage.setItem("whackAMoleHighScores", JSON.stringify(highScores))
  }, [highScores])

  // Game timer
  useEffect(() => {
    if (gameState === "playing") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameState])

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current)
      }
      moleTimeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  // Start the game
  const startGame = () => {
    // Reset game state
    setScore(0)
    setTimeLeft(difficultySettings[difficulty].duration)
    setMoles(
      Array(9)
        .fill(null)
        .map((_, i) => ({ id: i, isUp: false, isHit: false })),
    )
    setGameState("playing")

    // Clear any existing timeouts
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current)
    }
    moleTimeoutsRef.current.forEach(clearTimeout)
    moleTimeoutsRef.current = []

    // Start spawning moles
    spawnMoles()
  }

  // End the game
  const endGame = () => {
    setGameState("gameOver")

    // Clear all timeouts
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current)
      gameIntervalRef.current = null
    }
    moleTimeoutsRef.current.forEach(clearTimeout)
    moleTimeoutsRef.current = []

    // Update high score if needed
    if (score > highScores[difficulty]) {
      setHighScores((prev) => ({ ...prev, [difficulty]: score }))

      // Trigger confetti for new high score
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }

  // Spawn moles at random intervals
  const spawnMoles = () => {
    const settings = difficultySettings[difficulty]

    // Function to spawn a single mole
    const spawnMole = () => {
      if (gameState !== "playing") return

      // Count active moles
      const activeMoles = moles.filter((mole) => mole.isUp && !mole.isHit).length

      // Don't spawn more moles if we're at max
      if (activeMoles >= settings.maxActiveMoles) return

      // Find all moles that are down
      const downMoles = moles.filter((mole) => !mole.isUp)

      // If no moles are available, return
      if (downMoles.length === 0) return

      // Pick a random mole to pop up
      const randomIndex = Math.floor(Math.random() * downMoles.length)
      const moleToPopUp = downMoles[randomIndex]

      // Determine how long the mole stays up
      const upTime = Math.floor(
        Math.random() * (settings.moleUpTime[1] - settings.moleUpTime[0]) + settings.moleUpTime[0],
      )

      // Pop the mole up
      setMoles((prevMoles) =>
        prevMoles.map((mole) =>
          mole.id === moleToPopUp.id
            ? {
                ...mole,
                isUp: true,
                isHit: false,
              }
            : mole,
        ),
      )

      // Set timeout to pop the mole back down
      const timeoutId = setTimeout(() => {
        setMoles((prevMoles) => prevMoles.map((mole) => (mole.id === moleToPopUp.id ? { ...mole, isUp: false } : mole)))
      }, upTime)

      moleTimeoutsRef.current.push(timeoutId)
    }

    // Spawn first mole immediately
    spawnMole()

    // Set interval to spawn moles regularly
    gameIntervalRef.current = setInterval(
      () => {
        spawnMole()
      },
      Math.floor(Math.random() * (settings.moleInterval[1] - settings.moleInterval[0]) + settings.moleInterval[0]),
    )
  }

  // Handle whacking a mole
  const whackMole = (moleId: number) => {
    if (gameState !== "playing") return

    // Find the mole
    const moleIndex = moles.findIndex((m) => m.id === moleId)
    if (moleIndex === -1) return

    const mole = moles[moleIndex]

    // Only register hit if mole is up and not already hit
    if (mole.isUp && !mole.isHit) {
      // Show hammer animation
      setIsHammering(true)
      setTimeout(() => setIsHammering(false), 300)

      // Update mole state
      setMoles((prevMoles) => {
        const newMoles = [...prevMoles]
        newMoles[moleIndex] = { ...newMoles[moleIndex], isHit: true }
        return newMoles
      })

      // Set timeout to hide the mole
      const timeoutId = setTimeout(() => {
        setMoles((prevMoles) => {
          const newMoles = [...prevMoles]
          newMoles[moleIndex] = { ...newMoles[moleIndex], isUp: false, isHit: false }
          return newMoles
        })
      }, 500)

      moleTimeoutsRef.current.push(timeoutId)

      // Increment score
      setScore((prev) => prev + 1)
    }
  }

  // Track mouse/touch position for hammer
  const updateHammerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== "playing" || !gameAreaRef.current) return

    const gameArea = gameAreaRef.current.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    }

    setHammerPosition({
      x: clientX - gameArea.left,
      y: clientY - gameArea.top,
    })
  }

  // Change difficulty
  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
    setTimeLeft(difficultySettings[newDifficulty].duration)
  }

  return (
    <div className="flex flex-col items-center">
      {gameState === "idle" ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg border border-primary/20">
          <h2 className="text-2xl font-bold text-primary">Whack-a-Mole</h2>
          <p className="text-center text-muted-foreground">Whack as many moles as you can before time runs out!</p>

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
              <Button onClick={startGame} className="w-full" size="lg">
                Start Game
              </Button>
            </div>

            {/* Difficulty info */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Difficulty Info:</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Easy:</span> Slower moles, 30 seconds
                </p>
                <p>
                  <span className="font-medium">Medium:</span> Faster moles, multiple moles, 30 seconds
                </p>
                <p>
                  <span className="font-medium">Hard:</span> Very fast moles, many moles, 30 seconds
                </p>
              </div>
            </div>

            {/* High scores */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">High Scores:</h3>
              <div className="space-y-1">
                {Object.entries(highScores).map(([level, score]) => (
                  <div key={level} className="flex justify-between">
                    <span>{level.charAt(0).toUpperCase() + level.slice(1)}:</span>
                    <span>{score} moles</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {/* Game info */}
          <div className="flex justify-between w-full max-w-md mb-4 p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="text-xl font-bold">{score}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Time</div>
                <div className={cn("text-xl font-bold", timeLeft <= 5 && "text-red-500 animate-pulse")}>
                  {timeLeft}s
                </div>
              </div>
            </div>
          </div>

          {/* Game area */}
          <div
            ref={gameAreaRef}
            className="relative w-full max-w-md aspect-square bg-gradient-to-br from-green-900/70 to-green-800/70 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg border border-green-500/30"
            onMouseMove={updateHammerPosition}
            onTouchMove={updateHammerPosition}
          >
            {/* Grass background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjZmQiPjwvcmVjdD4KPC9zdmc+')] opacity-30"></div>

            {/* Mole grid */}
            <div className="grid grid-cols-3 grid-rows-3 gap-4 h-full w-full p-4">
              {moles.map((mole) => (
                <div key={mole.id} className="relative flex items-end justify-center">
                  {/* Mole hole */}
                  <div className="absolute bottom-0 w-16 h-8 bg-amber-950 dark:bg-amber-900 rounded-full transform translate-y-2 shadow-inner"></div>

                  {/* Mole */}
                  <AnimatePresence>
                    {mole.isUp && (
                      <motion.div
                        className="absolute bottom-0 flex flex-col items-center cursor-pointer z-10"
                        initial={{ y: 60 }}
                        animate={{ y: mole.isHit ? 30 : 0 }}
                        exit={{ y: 60 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onClick={() => whackMole(mole.id)}
                      >
                        {/* Mole face */}
                        <div
                          className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center text-2xl",
                            "bg-amber-600 border-2 border-amber-800 shadow-md",
                            mole.isHit && "bg-amber-400",
                          )}
                        >
                          {mole.isHit ? "😵" : "😀"}
                        </div>

                        {/* Mole body */}
                        <div className="w-10 h-6 bg-amber-700 rounded-b-full"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Hammer cursor */}
            {gameState === "playing" && (
              <motion.div
                className="absolute pointer-events-none z-20"
                style={{
                  left: hammerPosition.x - 20,
                  top: hammerPosition.y - 20,
                  rotate: isHammering ? 45 : 0,
                  originY: 1,
                  originX: 1,
                }}
                animate={{ rotate: isHammering ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Hammer className="h-10 w-10 text-gray-800 drop-shadow-md" />
              </motion.div>
            )}
          </div>

          {/* Game over overlay */}
          {gameState === "gameOver" && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-background/90 p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-primary/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold mb-4 text-primary">Game Over!</h2>

                <div className="space-y-2 mb-6">
                  <p className="text-4xl font-bold text-primary">{score} moles whacked!</p>

                  {score > 0 && score === highScores[difficulty] && (
                    <p className="text-green-500 font-bold mt-2">New High Score!</p>
                  )}
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={startGame} variant="default">
                    Play Again
                  </Button>
                  <Button onClick={() => setGameState("idle")} variant="outline">
                    Change Difficulty
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
