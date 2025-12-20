import { Link } from "react-router"

export function Home() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Bem-vindo ao Poker Chips</h1>
        <p className="text-muted-foreground">
          Gerencie suas fichas de poker de forma fácil e intuitiva.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-2">Jogos</h3>
          <p className="text-sm text-muted-foreground">
            Crie e gerencie suas partidas de poker.
          </p>
        </div>

        <Link 
          to="/manage-players" 
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors cursor-pointer block"
        >
          <h3 className="text-lg font-semibold mb-2">Jogadores</h3>
          <p className="text-sm text-muted-foreground">
            Adicione e gerencie os jogadores das suas partidas.
          </p>
        </Link>

       
      </div>
    </div>
  )
}

