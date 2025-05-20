import { notFound } from "next/navigation"
import TicTacToe from "@/components/games/tic-tac-toe"
import SnakeLadder from "@/components/games/snake-ladder"
import MemoryGame from "@/components/games/memory-game"
import RockPaperScissors from "@/components/games/rock-paper-scissors"
import NumberGuess from "@/components/games/number-guess"
import ThreeDTicTacToe from "@/components/games/3d-tic-tac-toe"
import WhackAMole from "@/components/games/whack-a-mole"
import Game2048 from "@/components/games/2048"
import Pong from "@/components/games/pong"
import Minesweeper from "@/components/games/minesweeper"
import GameLayout from "@/components/game-layout"

// Game data with metadata
const games = {
  "tic-tac-toe": {
    title: "Tic Tac Toe",
    description: "Classic 3x3 grid game for two players. Get three in a row to win!",
    instructions:
      "Players take turns placing X or O on the grid. The first player to get three of their marks in a row (horizontally, vertically, or diagonally) wins the game.",
    component: TicTacToe,
  },
  "snake-ladder": {
    title: "Snake & Ladder",
    description: "Classic board game with snakes and ladders. Race to the finish!",
    instructions:
      "Roll the dice and move your piece. If you land on a ladder, you climb up. If you land on a snake, you slide down. First player to reach square 100 wins!",
    component: SnakeLadder,
  },
  "memory-game": {
    title: "Memory Game",
    description: "Test your memory by matching pairs of cards.",
    instructions:
      "Click on cards to flip them over. Try to find matching pairs. Remember the positions of the cards you've seen to make matches more efficiently. Match all pairs before time runs out!",
    component: MemoryGame,
  },
  "rock-paper-scissors": {
    title: "Rock Paper Scissors",
    description: "The classic hand game now digital! Play against the computer or a friend.",
    instructions:
      "Choose rock, paper, or scissors. Rock beats scissors, scissors beats paper, and paper beats rock. Play against the computer or take turns with a friend on the same device.",
    component: RockPaperScissors,
  },
  "number-guess": {
    title: "Number Guessing",
    description: "Guess the number chosen by the system within limited attempts.",
    instructions:
      "The computer will think of a random number within a range. Try to guess it with the fewest attempts possible. After each guess, you'll get a hint whether your guess was too high or too low.",
    component: NumberGuess,
  },
  "3d-tic-tac-toe": {
    title: "3D Tic Tac Toe",
    description: "Advanced version of the classic game in a 4×4×4 cube.",
    instructions:
      "Similar to regular Tic Tac Toe, but in 3D! Players take turns placing their marks (X or O) in a 4×4×4 cube. The first player to get four of their marks in a row (horizontally, vertically, diagonally, or in 3D) wins the game. You can view the game in full 3D or layer by layer.",
    component: ThreeDTicTacToe,
  },
  "whack-a-mole": {
    title: "Whack-a-Mole",
    description: "Classic arcade game where you whack moles as they pop up.",
    instructions:
      "Moles will randomly pop up from their holes. Click or tap on them to whack them before they disappear. Each successful whack earns you a point. Try to get as many points as possible before time runs out!",
    component: WhackAMole,
  },
  "2048": {
    title: "2048",
    description: "Addictive puzzle game where you merge tiles to reach 2048.",
    instructions:
      "Use arrow keys or swipe to move all tiles. When two tiles with the same number touch, they merge into one with their sum. The goal is to create a tile with the number 2048. After each move, a new tile (2 or 4) appears randomly on the board.",
    component: Game2048,
  },
  pong: {
    title: "Pong",
    description: "The classic arcade paddle game that started it all.",
    instructions:
      "Control your paddle to hit the ball back and forth. Score points when your opponent misses the ball. First player to reach the winning score wins! Use W/S or arrow keys to move Player 1, and I/K for Player 2 in two-player mode. You can also use touch controls on mobile devices.",
    component: Pong,
  },
  minesweeper: {
    title: "Minesweeper",
    description: "Classic puzzle game about finding mines in a grid.",
    instructions:
      "Left-click to reveal a cell, right-click to flag a potential mine. Numbers show how many mines are adjacent to that cell. Clear all non-mine cells to win. The first click is always safe and will never be a mine.",
    component: Minesweeper,
  },
}

export default function GamePage({ params }: { params: { id: string } }) {
  const game = games[params.id as keyof typeof games]

  if (!game) {
    notFound()
  }

  const GameComponent = game.component

  return (
    <GameLayout title={game.title} description={game.description} instructions={game.instructions}>
      <GameComponent />
    </GameLayout>
  )
}
