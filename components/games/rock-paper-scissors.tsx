"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

type Choice = "rock" | "paper" | "scissors" | null
type GameMode = "ai" | "player"
type GameResult = "win" | "lose" | "draw" | null

const choices: Choice[] = ["rock", "paper", "scissors"]

const emojis: Record<Choice, string> = {
  rock: "👊",
  paper: "✋",
  scissors: "✌️",
  null: "❓",
}

const getWinner = (playerChoice: Choice, opponentChoice: Choice): GameResult => {
  if (!playerChoice || !opponentChoice) return null
  if (playerChoice === opponentChoice) return "draw"

  if (
    (playerChoice === "rock" && opponentChoice === "scissors") ||
    (playerChoice === "paper" && opponentChoice === "rock") ||
    (playerChoice === "scissors" && opponentChoice === "paper")
  ) {
    return "win"
  }

  return "lose"
}

export default function RockPaperScissors() {
  const [gameMode, setGameMode] = useState<GameMode>("ai")
  const [playerChoice, setPlayerChoice] = useState<Choice>(null)
  const [opponentChoice, setOpponentChoice] = useState<Choice>(null)
  const [result, setResult] = useState<GameResult>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [scores, setScores] = useState({
    player: 0,
    opponent: 0,
    draws: 0,
  })
  const [showResult, setShowResult] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [player2Ready, setPlayer2Ready] = useState(false)

  // Load scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem("rockPaperScissorsScores")
    if (savedScores) {
      setScores(JSON.parse(savedScores))
    }
  }, [])

  // Save scores to localStorage
  useEffect(() => {
    localStorage.setItem("rockPaperScissorsScores", JSON.stringify(scores))
  }, [scores])

  // Handle countdown
  useEffect(() => {
    if (countdown === null) return

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Time's up, make AI choice or prompt player 2
      if (gameMode === "ai") {
        makeAIChoice()
      } else {
        setPlayer2Ready(true)
      }
    }
  }, [countdown, gameMode])

  // Make AI choice
  const makeAIChoice = () => {
    const randomIndex = Math.floor(Math.random() * choices.length)
    const aiChoice = choices[randomIndex]
    setOpponentChoice(aiChoice)

    // Determine winner
    if (playerChoice) {
      const gameResult = getWinner(playerChoice, aiChoice)
      setResult(gameResult)
      updateScores(gameResult)
      setShowResult(true)

      // Trigger confetti if player wins
      if (gameResult === "win") {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }
  }

  // Update scores based on result
  const updateScores = (gameResult: GameResult) => {
    if (gameResult === "win") {
      setScores((prev) => ({ ...prev, player: prev.player + 1 }))
    } else if (gameResult === "lose") {
      setScores((prev) => ({ ...prev, opponent: prev.opponent + 1 }))
    } else if (gameResult === "draw") {
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }))
    }
  }

  // Start a new game
  const startGame = () => {
    setPlayerChoice(null)
    setOpponentChoice(null)
    setResult(null)
    setShowResult(false)
    setPlayer2Ready(false)
    setGameStarted(true)
  }

  // Handle player choice
  const handlePlayerChoice = (choice: Choice) => {
    setPlayerChoice(choice)

    if (gameMode === "ai") {
      // Start countdown for AI
      setCountdown(3)
    } else {
      // In 2-player mode, hide choice and wait for player 2
      setCountdown(3)
    }
  }

  // Handle player 2 choice
  const handlePlayer2Choice = (choice: Choice) => {
    setOpponentChoice(choice)

    // Determine winner
    if (playerChoice) {
      const gameResult = getWinner(playerChoice, choice)
      setResult(gameResult)
      updateScores(gameResult)
      setShowResult(true)
      setPlayer2Ready(false)

      // Trigger confetti if player wins
      if (gameResult === "win") {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }
  }

  // Reset scores
  const resetScores = () => {
    setScores({
      player: 0,
      opponent: 0,
      draws: 0,
    })
  }

  // Get result message
  const getResultMessage = () => {
    if (result === "win") return "You Win!"
    if (result === "lose") return "You Lose!"
    if (result === "draw") return "It's a Draw!"
    return ""
  }

  // Render choice button
  const renderChoiceButton = (choice: Choice, onClick: () => void, disabled = false) => {
    return (
      <motion.button
        className={cn(
          "w-24 h-24 md:w-32 md:h-32 rounded-full bg-background flex items-center justify-center",
          "border-4 border-primary shadow-lg text-5xl md:text-6xl",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        onClick={onClick}
        disabled={disabled}
      >
        {emojis[choice]}
      </motion.button>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-background rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">Rock Paper Scissors</h2>
          <p className="text-center text-muted-foreground">Choose your game mode and start playing!</p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <h3 className="text-lg font-semibold">Select Game Mode:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={gameMode === "ai" ? "default" : "outline"}
                onClick={() => setGameMode("ai")}
                className="w-full"
              >
                vs Computer
              </Button>
              <Button
                variant={gameMode === "player" ? "default" : "outline"}
                onClick={() => setGameMode("player")}
                className="w-full"
              >
                2 Players
              </Button>
            </div>

            <div className="mt-4">
              <Button onClick={startGame} className="w-full" size="lg">
                Start Game
              </Button>
            </div>

            {/* Scores */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Scores:</h3>
                <Button onClick={resetScores} variant="ghost" size="sm">
                  Reset
                </Button>
              </div>
              <div className="grid grid-cols-3 text-center">
                <div>
                  <div className="font-semibold">You</div>
                  <div className="text-xl">{scores.player}</div>
                </div>
                <div>
                  <div className="font-semibold">Draws</div>
                  <div className="text-xl">{scores.draws}</div>
                </div>
                <div>
                  <div className="font-semibold">Opponent</div>
                  <div className="text-xl">{scores.opponent}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {/* Game area */}
          <div className="w-full max-w-2xl">
            {/* Player choices area */}
            {!player2Ready ? (
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-6">
                  {gameMode === "player" ? "Player 1's Turn" : "Make Your Choice"}
                </h2>

                {/* Countdown display */}
                {countdown !== null && <div className="text-4xl font-bold mb-8 animate-bounce">{countdown}</div>}

                {/* Result display */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      className="flex flex-col items-center mb-8"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="text-3xl font-bold mb-2">{getResultMessage()}</div>

                      <div className="flex gap-8 items-center">
                        <div className="flex flex-col items-center">
                          <div className="text-lg font-semibold mb-2">You</div>
                          <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center border-4 border-primary text-4xl">
                            {playerChoice && emojis[playerChoice]}
                          </div>
                        </div>

                        <div className="text-2xl font-bold">VS</div>

                        <div className="flex flex-col items-center">
                          <div className="text-lg font-semibold mb-2">
                            {gameMode === "ai" ? "Computer" : "Player 2"}
                          </div>
                          <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center border-4 border-primary text-4xl">
                            {opponentChoice && emojis[opponentChoice]}
                          </div>
                        </div>
                      </div>

                      <Button onClick={startGame} className="mt-6">
                        Play Again
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Player choices */}
                {!showResult && (
                  <div className="flex flex-wrap justify-center gap-6 mb-8">
                    {choices.map((choice) => (
                      <div key={choice} className="flex flex-col items-center">
                        {renderChoiceButton(choice, () => handlePlayerChoice(choice), countdown !== null)}
                        <div className="mt-2 font-medium capitalize">{choice}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-6">Player 2's Turn</h2>

                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  {choices.map((choice) => (
                    <div key={choice} className="flex flex-col items-center">
                      {renderChoiceButton(choice, () => handlePlayer2Choice(choice))}
                      <div className="mt-2 font-medium capitalize">{choice}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scoreboard */}
          <div className="bg-background p-4 rounded-lg shadow-sm w-full max-w-md mt-8">
            <div className="grid grid-cols-3 text-center">
              <div>
                <div className="font-semibold">{gameMode === "player" ? "Player 1" : "You"}</div>
                <div className="text-2xl font-bold">{scores.player}</div>
              </div>
              <div>
                <div className="font-semibold">Draws</div>
                <div className="text-2xl font-bold">{scores.draws}</div>
              </div>
              <div>
                <div className="font-semibold">{gameMode === "player" ? "Player 2" : "Computer"}</div>
                <div className="text-2xl font-bold">{scores.opponent}</div>
              </div>
            </div>
          </div>

          {/* Back button */}
          {!countdown && !showResult && !player2Ready && (
            <Button variant="outline" onClick={() => setGameStarted(false)} className="mt-6">
              Back to Menu
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
