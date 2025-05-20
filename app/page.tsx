"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gamepad2, Trophy, Zap } from "lucide-react"
import FeaturedGames from "@/components/featured-games"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background/50 z-0"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                Play. Compete. Repeat.
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Enjoy a collection of classic and fun mini-games right in your browser. Challenge yourself or play with
                friends!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="gap-2 group relative overflow-hidden">
                <Link href="/games">
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></span>
                  <Gamepad2 className="h-5 w-5" />
                  <span className="relative z-10">Start Playing</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Animated gaming elements */}
        <div className="absolute top-20 left-10 opacity-20 animate-float-slow">
          <Gamepad2 className="h-16 w-16 text-primary" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20 animate-float">
          <Trophy className="h-16 w-16 text-yellow-500" />
        </div>
        <div className="absolute top-40 right-20 opacity-20 animate-float-medium">
          <Zap className="h-12 w-12 text-purple-500" />
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="w-full py-12 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-primary/5 z-0"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-12 bg-primary/50"></div>
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl inline-flex items-center gap-2">
                  
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    Featured Games
                  </span>
                </h2>
                <div className="h-px w-12 bg-primary/50"></div>
              </div>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Check out our most popular games and start playing right away.
              </p>
            </div>
            <FeaturedGames />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/50 z-0"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                Ready to Play?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Explore our full collection of games and challenge yourself or friends.
              </p>
            </div>
            <Button asChild size="lg" className="group relative overflow-hidden">
              <Link href="/games">
                <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></span>
                <span className="relative z-10">View All Games</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
