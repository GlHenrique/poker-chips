import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTime, useTimer } from "@/context/TimerContext";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export function Timer() {
  const {
    minutes,
    seconds,
    totalInputSeconds,
    remainingSeconds,
    phase,
    sessions,
    showNaturalEndMessage,
    dismissNaturalEndMessage,
    setMinutesFromInput,
    setSecondsFromInput,
    start,
    pause,
    stop,
    inputDisabled,
  } = useTimer();

  return (
    <div className="mx-auto max-w-3xl space-y-8 fade-in-up">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Timer</h1>
        <p className="text-muted-foreground">
          Defina a duração em minutos e opcionalmente em segundos (0–59), depois
          inicie, pause ou pare o contador. O tempo continua mesmo ao sair desta
          página.
        </p>
      </div>

      {showNaturalEndMessage && (
        <div
          className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <p className="text-sm font-medium text-foreground">
            Tempo finalizado!
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={dismissNaturalEndMessage}
          >
            Fechar
          </Button>
        </div>
      )}

      <div className="rounded-lg border bg-card p-6 space-y-6">
        <div
          className="text-center font-mono text-5xl font-semibold tabular-nums tracking-tight"
          aria-live="polite"
        >
          {formatTime(remainingSeconds)}
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Duração</span>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="timer-minutes">Minutos</Label>
              <Input
                id="timer-minutes"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={String(minutes)}
                disabled={inputDisabled}
                onChange={(e) => setMinutesFromInput(e.target.value)}
                className="w-28"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timer-seconds">Segundos</Label>
              <Input
                id="timer-seconds"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                pattern="[0-9]*"
                value={String(seconds)}
                disabled={inputDisabled}
                onChange={(e) => setSecondsFromInput(e.target.value)}
                className="w-28"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Padrão: 10 minutos e 0 segundos. Segundos de 0 a 59. Durante a
            contagem os campos ficam bloqueados.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={start}
            disabled={phase === "running" || totalInputSeconds <= 0}
          >
            {phase === "paused" ? "Continuar" : "Iniciar"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={pause}
            disabled={phase !== "running"}
          >
            Pausar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={stop}
            disabled={phase === "idle"}
          >
            Parar
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Histórico de execuções
        </h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma execução registrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">
                    Início (data e hora)
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    Fim (data e hora)
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-3 py-2.5 font-mono text-xs tabular-nums">
                      {formatDateTime(row.startedAt)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">
                      {row.finishedAt
                        ? formatDateTime(row.finishedAt)
                        : "Em andamento"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
