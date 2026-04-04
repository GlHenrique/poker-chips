import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTime, useTimer } from "@/context/TimerContext";
import { useTranslation } from "react-i18next";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export function Timer() {
  const { t } = useTranslation();
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
    clearSessions,
    inputDisabled,
  } = useTimer();

  return (
    <div className="mx-auto max-w-3xl space-y-8 fade-in-up">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{t("timer.title")}</h1>
        <p className="text-muted-foreground">{t("timer.subtitle")}</p>
      </div>

      {showNaturalEndMessage && (
        <div
          className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <p className="text-sm font-medium text-foreground">
            {t("timer.timeEnded")}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={dismissNaturalEndMessage}
          >
            {t("timer.close")}
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
          <span className="text-sm font-medium">{t("timer.duration")}</span>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="timer-minutes">{t("timer.minutes")}</Label>
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
              <Label htmlFor="timer-seconds">{t("timer.seconds")}</Label>
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
          <p className="text-xs text-muted-foreground">{t("timer.hint")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={start}
            disabled={phase === "running" || totalInputSeconds <= 0}
          >
            {phase === "paused" ? t("timer.resume") : t("timer.start")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={pause}
            disabled={phase !== "running"}
          >
            {t("timer.pause")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={stop}
            disabled={phase === "idle"}
          >
            {t("timer.stop")}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("timer.history.title")}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSessions}
            disabled={sessions.length === 0}
          >
            {t("timer.history.clear")}
          </Button>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("timer.history.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">
                    {t("timer.history.startColumn")}
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    {t("timer.history.endColumn")}
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
                        : t("timer.history.ongoing")}
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
