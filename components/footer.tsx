import Link from "next/link"
import { Gamepad2, Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t border-primary/20 py-6 md:py-0 bg-background/80 backdrop-blur-sm">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MiniGameHub. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/games" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Games
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/nitinmahala"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>

            <Link
              href="https://www.linkedin.com/in/mahalanitin/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
