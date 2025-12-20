import { Outlet, useLocation, Link } from "react-router"
import { ModeToggle } from "@/components/app"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function Layout() {
  const location = useLocation()
  const isHome = location.pathname === "/"

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {!isHome && (
              <Link to="/">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Voltar</span>
                </Button>
              </Link>
            )}
            <h1 className="text-xl font-bold">Poker Chips</h1>
          </div>
          <nav className="flex items-center gap-4">
            <ModeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-14 items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Poker Chips. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

