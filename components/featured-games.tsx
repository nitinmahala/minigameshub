"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2 } from "lucide-react"
import { motion } from "framer-motion"

const featuredGames = [
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    icon: "🎮",
    description: "Classic 3x3 grid game for two players",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "memory-game",
    title: "Memory Game",
    icon: "🧠",
    description: "Test your memory by matching pairs of cards",
    color: "from-purple-500 to-purple-700",
  },
  {
    id: "rock-paper-scissors",
    title: "Rock Paper Scissors",
    icon: "✂️",
    description: "Play the classic hand game against the computer",
    color: "from-green-500 to-green-700",
  },
]

export default function FeaturedGames() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
      {featuredGames.map((game, index) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="flex flex-col h-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 border-primary/20 bg-background/80 backdrop-blur-sm overflow-hidden group">
            <CardHeader className="relative">
              <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
              <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                {game.icon}
              </div>
              <CardTitle className="group-hover:text-primary transition-colors duration-300">{game.title}</CardTitle>
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
  )
}
