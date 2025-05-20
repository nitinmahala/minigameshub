"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

type Player = "X" | "O" | null
type BoardState = Player[]

const winningCombinations = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal top-left to bottom-right
  [2, 4, 6], // diagonal top-right to bottom-left
]

export default function TicTacToe() {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X")
  const [winner, setWinner] = useState<Player>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const [winningSquares, setWinningSquares] = useState<number[]>([])

  // Check for winner or draw
  useEffect(() => {
    checkWinner()
  }, [board])

  // Load scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem("ticTacToeScores")
    if (savedScores) {
      setScores(JSON.parse(savedScores))
    }
  }, [])

  // Save scores to localStorage
  useEffect(() => {
    localStorage.setItem("ticTacToeScores", JSON.stringify(scores))
  }, [scores])

  // Trigger confetti when there's a winner
  useEffect(() => {
    if (winner) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [winner])

  const checkWinner = () => {
    // Check for winner
    for (const combo of winningCombinations) {
      const [a, b, c] = combo
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a])
        setWinningSquares(combo)
        updateScores(board[a])
        return
      }
    }

    // Check for draw
    if (!board.includes(null) && !winner) {
      setIsDraw(true)
      updateScores(null)
    }
  }

  const updateScores = (result: Player) => {
    if (result === "X") {
      setScores((prev) => ({ ...prev, X: prev.X + 1 }))
    } else if (result === "O") {
      setScores((prev) => ({ ...prev, O: prev.O + 1 }))
    } else {
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }))
    }
  }

  const handleSquareClick = (index: number) => {
    // Return if square is already filled or game is over
    if (board[index] || winner || isDraw) return

    // Update board
    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    // Switch player
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X")
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setIsDraw(false)
    setWinningSquares([])
  }

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 })
  }

  const renderSquare = (index: number) => {
    const isWinningSquare = winningSquares.includes(index)

    return (
      <button
        className={cn(
          "flex items-center justify-center text-3xl md:text-5xl font-bold bg-background border-2 border-border rounded-md h-20 w-20 transition-all",
          isWinningSquare && "bg-green-100 dark:bg-green-900 border-green-500",
          !board[index] && !winner && !isDraw && "hover:bg-muted-foreground/10",
        )}
        onClick={() => handleSquareClick(index)}
        disabled={!!board[index] || !!winner || isDraw}
        aria-label={`Square ${index + 1}`}
      >
        {board[index]}
      </button>
    )
  }

  const getStatusMessage = () => {
    if (winner) {
      return `Player ${winner} wins!`
    } else if (isDraw) {
      return "Game ended in a draw!"
    } else {
      return `Player ${currentPlayer}'s turn`
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Game status */}
      <div className="text-xl font-semibold mb-6 text-center">{getStatusMessage()}</div>

      {/* Game board */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {Array(9)
          .fill(null)
          .map((_, index) => (
            <div key={index}>{renderSquare(index)}</div>
          ))}
      </div>

      {/* Game controls */}
      <div className="flex gap-4 mb-8">
        <Button onClick={resetGame} variant="outline">
          New Game
        </Button>
      </div>

      {/* Scoreboard */}
      <div className="bg-background p-4 rounded-lg shadow-sm w-full max-w-xs">
        <h3 className="text-lg font-semibold mb-2 text-center">Scoreboard</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-bold text-xl">X</div>
            <div className="text-2xl">{scores.X}</div>
          </div>
          <div>
            <div className="font-bold text-xl">Draws</div>
            <div className="text-2xl">{scores.draws}</div>
          </div>
          <div>
            <div className="font-bold text-xl">O</div>
            <div className="text-2xl">{scores.O}</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Button onClick={resetScores} variant="ghost" size="sm">
            Reset Scores
          </Button>
        </div>
      </div>
    </div>
  )
}
