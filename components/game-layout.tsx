"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Info, Volume2, VolumeX, RefreshCw, ArrowLeft } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { motion } from "framer-motion"

interface GameLayoutProps {
  title: string
  description: string
  instructions: string
  children: React.ReactNode
}

export default function GameLayout({ title, description, instructions, children }: GameLayoutProps) {
  const [soundEnabled, setSoundEnabled] = useState(false)

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  return (
    <div className="container py-8 max-w-5xl relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/50 z-0"></div>
      <div className="relative z-10">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              {title}
            </h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
                >
                  <Info className="h-5 w-5" />
                  <span className="sr-only">Instructions</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background/95 backdrop-blur-md border-primary/20">
                <SheetHeader>
                  <SheetTitle className="text-primary">How to Play: {title}</SheetTitle>
                  <SheetDescription>{instructions}</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleSound}
              className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              <span className="sr-only">{soundEnabled ? "Disable sound" : "Enable sound"}</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              asChild
              className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
            >
              <Link href="/games">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to games</span>
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="bg-background/80 backdrop-blur-sm rounded-lg p-6 mb-6 border border-primary/20 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>

        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
          >
            <RefreshCw className="h-4 w-4" />
            Play Again
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            <Link href="/games">Back to Games</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
