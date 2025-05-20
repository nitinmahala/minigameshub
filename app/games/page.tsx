"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Gamepad2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

// Game data
const games = [
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    icon: "🎮",
    description: "Classic 3x3 grid game for two players",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "snake-ladder",
    title: "Snake & Ladder",
    icon: "🐍",
    description: "Roll the dice and navigate the board game",
    color: "from-green-500 to-green-700",
  },
  {
    id: "3d-tic-tac-toe",
    title: "3D Tic Tac Toe",
    icon: "🎲",
    description: "Advanced version of the classic tic tac toe",
    color: "from-purple-500 to-purple-700",
  },
  {
    id: "memory-game",
    title: "Memory Game",
    icon: "🧠",
    description: "Test your memory by matching pairs of cards",
    color: "from-pink-500 to-pink-700",
  },
  {
    id: "rock-paper-scissors",
    title: "Rock Paper Scissors",
    icon: "✂️",
    description: "Play the classic hand game against the computer",
    color: "from-yellow-500 to-yellow-700",
  },
  {
    id: "number-guess",
    title: "Number Guessing",
    icon: "🔢",
    description: "Guess the number chosen by the system",
    color: "from-red-500 to-red-700",
  },
  {
    id: "whack-a-mole",
    title: "Whack-a-Mole",
    icon: "🔨",
    description: "Click fast when moles pop up from their holes",
    color: "from-amber-500 to-amber-700",
  },
  {
    id: "2048",
    title: "2048",
    icon: "🧩",
    description: "Merge tiles to reach the 2048 tile",
    color: "from-cyan-500 to-cyan-700",
  },
  {
    id: "pong",
    title: "Pong",
    icon: "🏓",
    description: "Classic paddle ball game",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    icon: "💣",
    description: "Logic-based board game to clear mines",
    color: "from-teal-500 to-teal-700",
  },
]

export default function GamesPage() {
  return (
    <div className="container py-8 md:py-12 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/50 z-0"></div>
      <div className="relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-12 bg-primary/50"></div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl inline-flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                All Games
              </span>
            </h1>
            <div className="h-px w-12 bg-primary/50"></div>
          </div>
          <p className="mt-4 text-muted-foreground max-w-[700px]">
            Browse our collection of fun mini-games. Play directly in your browser!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 border-primary/20 bg-background/80 backdrop-blur-sm overflow-hidden group">
                <CardHeader>
                  <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">
                    {game.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{game.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group-hover:shadow-md transition-all duration-300"
                  >
                    <Link href={`/game/${game.id}`}>
                      <Gamepad2 className="h-4 w-4" />
                      Play Now
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
