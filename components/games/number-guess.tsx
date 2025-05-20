"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { ArrowUp, ArrowDown, Check } from "lucide-react"

type Difficulty = "easy" | "medium" | "hard"
type GameState = "setup" | "playing" | "won" | "lost"

const difficultySettings = {
  easy: { min: 1, max: 50, attempts: 10 },
  medium: { min: 1, max: 100, attempts: 7 },
  hard: { min: 1, max: 500, attempts: 9 },
}

export default function NumberGuess() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  const [gameState, setGameState] = useState<GameState>("setup")
  const [targetNumber, setTargetNumber] = useState<number>(0)
  const [guess, setGuess] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [attemptsLeft, setAttemptsLeft] = useState<number>(10)
  const [guessHistory, setGuessHistory] = useState<{ value: number; result: "high" | "low" | "correct" }[]>([])
  const [bestScores, setBestScores] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  })
  const [hintDirection, setHintDirection] = useState<"up" | "down" | "correct" | null>(null)

  // Load best scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem("numberGuessBestScores")
    if (savedScores) {
      setBestScores(JSON.parse(savedScores))
    }
  }, [])

  // Save best scores to localStorage
  useEffect(() => {
    localStorage.setItem("numberGuessBestScores", JSON.stringify(bestScores))
  }, [bestScores])

  // Start a new game
  const startGame = () => {
    const { min, max, attempts } = difficultySettings[difficulty]
    const newTargetNumber = Math.floor(Math.random() * (max - min + 1)) + min

    setTargetNumber(newTargetNumber)
    setGuess("")
    setMessage(`I'm thinking of a number between ${min} and ${max}. You have ${attempts} attempts.`)
    setAttemptsLeft(attempts)
    setGuessHistory([])
    setGameState("playing")
    setHintDirection(null)

    console.log("Target number:", newTargetNumber) // For debugging
  }

  // Handle guess submission
  const handleGuess = () => {
    if (!guess) return

    const guessNumber = Number.parseInt(guess)
    if (isNaN(guessNumber)) {
      setMessage("Please enter a valid number.")
      return
    }

    const { min, max } = difficultySettings[difficulty]
    if (guessNumber < min || guessNumber > max) {
      setMessage(`Please enter a number between ${min} and ${max}.`)
      return
    }

    // Process the guess
    const newAttemptsLeft = attemptsLeft - 1
    setAttemptsLeft(newAttemptsLeft)

    let result: "high" | "low" | "correct"

    if (guessNumber === targetNumber) {
      // Correct guess
      setMessage(`Congratulations! You guessed the number ${targetNumber} correctly!`)
      setGameState("won")
      result = "correct"
      setHintDirection("correct")

      // Update best score if needed
      const attemptsUsed = difficultySettings[difficulty].attempts - newAttemptsLeft
      if (!bestScores[difficulty] || attemptsUsed < bestScores[difficulty]!) {
        setBestScores((prev) => ({
          ...prev,
          [difficulty]: attemptsUsed,
        }))
      }

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else if (guessNumber < targetNumber) {
      // Guess too low
      result = "low"
      setHintDirection("up")
      setMessage(
        newAttemptsLeft > 0
          ? `Too low! Try a higher number. ${newAttemptsLeft} ${newAttemptsLeft === 1 ? "attempt" : "attempts"} left.`
          : `Game over! The number was ${targetNumber}.`,
      )
      if (newAttemptsLeft === 0) {
        setGameState("lost")
      }
    } else {
      // Guess too high
      result = "high"
      setHintDirection("down")
      setMessage(
        newAttemptsLeft > 0
          ? `Too high! Try a lower number. ${newAttemptsLeft} ${newAttemptsLeft === 1 ? "attempt" : "attempts"} left.`
          : `Game over! The number was ${targetNumber}.`,
      )
      if (newAttemptsLeft === 0) {
        setGameState("lost")
      }
    }

    // Add to history
    setGuessHistory((prev) => [...prev, { value: guessNumber, result }])

    // Clear input
    setGuess("")

    // Clear hint after a delay
    setTimeout(() => {
      setHintDirection(null)
    }, 1500)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuess(e.target.value)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGuess()
    }
  }

  // Render hint animation
  const renderHintAnimation = () => {
    if (!hintDirection) return null

    if (hintDirection === "up") {
      return (
        <motion.div
          className="absolute right-3 text-orange-500"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <ArrowUp className="h-6 w-6" />
        </motion.div>
      )
    } else if (hintDirection === "down") {
      return (
        <motion.div
          className="absolute right-3 text-blue-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <ArrowDown className="h-6 w-6" />
        </motion.div>
      )
    } else if (hintDirection === "correct") {
      return (
        <motion.div
          className="absolute right-3 text-green-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <Check className="h-6 w-6" />
        </motion.div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col items-center">
      {gameState === "setup" ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-background rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">Number Guessing Game</h2>
          <p className="text-center text-muted-foreground">
            I'll think of a number, and you try to guess it with hints!
          </p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <h3 className="text-lg font-semibold">Select Difficulty:</h3>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(difficultySettings) as Difficulty[]).map((level) => (
                <Button
                  key={level}
                  variant={difficulty === level ? "default" : "outline"}
                  onClick={() => setDifficulty(level)}
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
                  <span className="font-medium">Easy:</span> 1-50, 10 attempts
                </p>
                <p>
                  <span className="font-medium">Medium:</span> 1-100, 7 attempts
                </p>
                <p>
                  <span className="font-medium">Hard:</span> 1-500, 9 attempts
                </p>
              </div>
            </div>

            {/* Best scores */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Best Scores:</h3>
              <div className="space-y-1">
                {Object.entries(bestScores).map(([level, score]) => (
                  <div key={level} className="flex justify-between">
                    <span>{level.charAt(0).toUpperCase() + level.slice(1)}:</span>
                    <span>{score !== null ? `${score} attempts` : "N/A"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {/* Game area */}
          <div className="w-full max-w-md p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Number Guessing Game</h2>

            <div className="mb-6 p-4 bg-background rounded-lg shadow-inner">
              <p className="text-center">{message}</p>
            </div>

            {/* Guess input */}
            {gameState === "playing" && (
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="number"
                    value={guess}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full p-3 text-center text-2xl font-bold rounded-lg border-2 border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your guess"
                    min={difficultySettings[difficulty].min}
                    max={difficultySettings[difficulty].max}
                    autoFocus
                  />
                  <AnimatePresence>{renderHintAnimation()}</AnimatePresence>
                </div>

                <Button onClick={handleGuess} className="w-full mt-3" size="lg">
                  Guess
                </Button>
              </div>
            )}

            {/* Game over actions */}
            {(gameState === "won" || gameState === "lost") && (
              <div className="flex gap-4 justify-center mb-6">
                <Button onClick={startGame} variant="default">
                  Play Again
                </Button>
                <Button onClick={() => setGameState("setup")} variant="outline">
                  Change Difficulty
                </Button>
              </div>
            )}

            {/* Guess history */}
            {guessHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Guess History:</h3>
                <div className="max-h-48 overflow-y-auto p-2 bg-background rounded-lg">
                  <div className="space-y-1">
                    {guessHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md">
                        <span>
                          Guess #{index + 1}: {item.value}
                        </span>
                        <span>
                          {item.result === "high" && (
                            <span className="flex items-center text-blue-500">
                              Too High <ArrowDown className="h-4 w-4 ml-1" />
                            </span>
                          )}
                          {item.result === "low" && (
                            <span className="flex items-center text-orange-500">
                              Too Low <ArrowUp className="h-4 w-4 ml-1" />
                            </span>
                          )}
                          {item.result === "correct" && (
                            <span className="flex items-center text-green-500">
                              Correct! <Check className="h-4 w-4 ml-1" />
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Game info */}
          <div className="mt-6 p-4 bg-background rounded-lg shadow-sm w-full max-w-md">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
                <div className="font-medium capitalize">{difficulty}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Range</div>
                <div className="font-medium">
                  {difficultySettings[difficulty].min}-{difficultySettings[difficulty].max}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Attempts Left</div>
                <div className="font-medium">{attemptsLeft}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
