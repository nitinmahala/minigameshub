"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

// Add these CSS classes at the top of the file, right after the imports
const styles = {
  cardContainer: "relative w-full h-full preserve-3d transition-all duration-500",
  cardFace: "absolute inset-0 backface-hidden flex items-center justify-center rounded-lg border-2",
  cardBack: "bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-2xl",
  cardFront: "bg-white dark:bg-gray-800 text-4xl rotateY-180",
}

// Card type
type Card = {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

// Difficulty levels
const difficultyLevels = {
  easy: { pairs: 6, time: 60 },
  medium: { pairs: 8, time: 90 },
  hard: { pairs: 12, time: 120 },
}

// Emojis for cards
const emojis = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
  "🦆",
  "🦉",
  "🦇",
  "🐺",
  "🐗",
  "🐴",
]

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<keyof typeof difficultyLevels>("easy")
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [moves, setMoves] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(difficultyLevels.easy.time)
  const [bestScores, setBestScores] = useState<Record<string, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  })

  // Initialize game
  useEffect(() => {
    // Load best scores from localStorage
    const savedScores = localStorage.getItem("memoryGameBestScores")
    if (savedScores) {
      setBestScores(JSON.parse(savedScores))
    }
  }, [])

  // Save best scores to localStorage
  useEffect(() => {
    localStorage.setItem("memoryGameBestScores", JSON.stringify(bestScores))
  }, [bestScores])

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (gameStarted && !gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && gameStarted) {
      setGameOver(true)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [gameStarted, gameOver, timeLeft])

  // Check for win
  useEffect(() => {
    if (gameStarted && matchedPairs === difficultyLevels[difficulty].pairs) {
      setGameOver(true)

      // Update best score if current score is better
      const currentScore = moves
      if (!bestScores[difficulty] || currentScore < bestScores[difficulty]!) {
        setBestScores((prev) => ({
          ...prev,
          [difficulty]: currentScore,
        }))
      }

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [matchedPairs, difficulty, gameStarted, moves, bestScores])

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCardId, secondCardId] = flippedCards
      const firstCard = cards.find((card) => card.id === firstCardId)
      const secondCard = cards.find((card) => card.id === secondCardId)

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === firstCardId || card.id === secondCardId ? { ...card, isMatched: true } : card,
          ),
        )
        setMatchedPairs((prev) => prev + 1)
        setFlippedCards([])
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCardId || card.id === secondCardId ? { ...card, isFlipped: false } : card,
            ),
          )
          setFlippedCards([])
        }, 1000)
      }

      // Increment moves
      setMoves((prev) => prev + 1)
    }
  }, [flippedCards, cards])

  // Initialize cards
  const initializeCards = () => {
    const numPairs = difficultyLevels[difficulty].pairs
    const selectedEmojis = emojis.slice(0, numPairs)

    // Create pairs of cards
    const cardPairs = selectedEmojis.flatMap((emoji, index) => [
      { id: index * 2, emoji, isFlipped: false, isMatched: false },
      { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false },
    ])

    // Shuffle cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5)

    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setTimeLeft(difficultyLevels[difficulty].time)
    setGameStarted(true)
    setGameOver(false)
  }

  // Handle card click
  const handleCardClick = (cardId: number) => {
    // Ignore click if game is over or already two cards flipped
    if (gameOver || flippedCards.length >= 2) return

    // Ignore click if card is already flipped or matched
    const clickedCard = cards.find((card) => card.id === cardId)
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return

    // Flip the card
    setCards((prevCards) => prevCards.map((card) => (card.id === cardId ? { ...card, isFlipped: true } : card)))

    // Add to flipped cards
    setFlippedCards((prev) => [...prev, cardId])
  }

  // Change difficulty
  const changeDifficulty = (newDifficulty: keyof typeof difficultyLevels) => {
    setDifficulty(newDifficulty)
    setGameStarted(false)
    setGameOver(false)
    setCards([])
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setTimeLeft(difficultyLevels[newDifficulty].time)
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="flex flex-col items-center gap-6 p-8 bg-background rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">Memory Game</h2>
          <p className="text-center text-muted-foreground">
            Flip cards to find matching pairs. Match all pairs before time runs out!
          </p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <h3 className="text-lg font-semibold">Select Difficulty:</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(difficultyLevels).map((level) => (
                <Button
                  key={level}
                  variant={difficulty === level ? "default" : "outline"}
                  onClick={() => changeDifficulty(level as keyof typeof difficultyLevels)}
                  className="w-full"
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>

            <div className="mt-4">
              <Button onClick={initializeCards} className="w-full" size="lg">
                Start Game
              </Button>
            </div>

            {/* Best scores */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Best Scores:</h3>
              <div className="space-y-1">
                {Object.entries(bestScores).map(([level, score]) => (
                  <div key={level} className="flex justify-between">
                    <span>{level.charAt(0).toUpperCase() + level.slice(1)}:</span>
                    <span>{score !== null ? `${score} moves` : "N/A"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {/* Game info */}
          <div className="flex justify-between w-full max-w-2xl mb-4 p-4 bg-background rounded-lg shadow-sm">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Moves</div>
              <div className="text-xl font-bold">{moves}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Pairs</div>
              <div className="text-xl font-bold">
                {matchedPairs} / {difficultyLevels[difficulty].pairs}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Time</div>
              <div className={cn("text-xl font-bold", timeLeft < 10 && "text-red-500 animate-pulse")}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Game board */}
          <div
            className={cn(
              "grid gap-3 p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-lg shadow-lg",
              difficulty === "easy" && "grid-cols-3 md:grid-cols-4",
              difficulty === "medium" && "grid-cols-4 md:grid-cols-4",
              difficulty === "hard" && "grid-cols-4 md:grid-cols-6",
            )}
          >
            {cards.map((card) => (
              <motion.div
                key={card.id}
                className={cn(
                  "aspect-square w-16 md:w-20 lg:w-24 cursor-pointer perspective-500",
                  (card.isMatched || gameOver) && "cursor-default",
                )}
                onClick={() => handleCardClick(card.id)}
                whileHover={!card.isFlipped && !card.isMatched && !gameOver ? { scale: 1.05 } : {}}
              >
                <div
                  className="w-full h-full relative"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: card.isFlipped ? "rotateY(180deg)" : "",
                    transition: "transform 0.6s",
                  }}
                >
                  {/* Card back */}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center rounded-lg border-2",
                      "bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-2xl",
                      "shadow-md",
                    )}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    ?
                  </div>

                  {/* Card front */}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center rounded-lg border-2 border-white",
                      "bg-white dark:bg-gray-800 text-4xl",
                      "shadow-md",
                      card.isMatched && "bg-green-100 dark:bg-green-900",
                    )}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {card.emoji}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Game over overlay */}
          {gameOver && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-background p-8 rounded-lg shadow-lg max-w-md w-full text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold mb-4">
                  {matchedPairs === difficultyLevels[difficulty].pairs ? "You Win!" : "Time's Up!"}
                </h2>

                <div className="space-y-2 mb-6">
                  <p>
                    <span className="font-semibold">Pairs Matched:</span> {matchedPairs} /{" "}
                    {difficultyLevels[difficulty].pairs}
                  </p>
                  <p>
                    <span className="font-semibold">Moves:</span> {moves}
                  </p>
                  <p>
                    <span className="font-semibold">Time Left:</span> {formatTime(timeLeft)}
                  </p>

                  {matchedPairs === difficultyLevels[difficulty].pairs && bestScores[difficulty] === moves && (
                    <p className="text-green-500 font-bold mt-2">New Best Score!</p>
                  )}
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={initializeCards} variant="default">
                    Play Again
                  </Button>
                  <Button
                    onClick={() => {
                      setGameStarted(false)
                      setGameOver(false)
                    }}
                    variant="outline"
                  >
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
