import { Outlet, useLocation, Link } from "react-router";
import { ModeToggle, useTheme, LanguageSwitcher } from "@/components/app";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BellRing,
  Clock,
  Pause,
  Play,
  Square,
  VolumeX,
} from "lucide-react";
import LogoDark from "@/assets/poker-chips-logo.svg";
import LogoLight from "@/assets/poker-chips-logo-light.svg";
import { useTranslation } from "react-i18next";
import { formatTime, useTimer } from "@/context/TimerContext";

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isManagePlayers = location.pathname === "/manage-players";
  const isTimer = location.pathname === "/timer";
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    phase,
    remainingSeconds,
    start,
    pause,
    stop,
    showNaturalEndMessage,
    dismissNaturalEndMessage,
  } = useTimer();
  const showHeaderTimer =
    !isTimer &&
    (phase === "running" ||
      phase === "paused" ||
      showNaturalEndMessage);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const logoSrc = isDark ? LogoDark : LogoLight;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 md:px-6 fade-in-up">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {!isHome && (
              <Link to="/" className="fixed top-4 left-[-54px]">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">{t("nav.back")}</span>
                </Button>
              </Link>
            )}
            <Link to="/" className="flex shrink-0 items-center gap-3">
              <img
                src={logoSrc}
                alt="Poker Chips"
                className="h-10 w-auto rounded-md shadow-md ring-1 ring-white/10 transition-transform duration-200 hover:scale-105"
              />
            </Link>
            {showHeaderTimer &&
              (showNaturalEndMessage ? (
                <div className="flex min-w-0 max-w-full items-center overflow-hidden rounded-md border border-primary/40 bg-primary/10 text-sm font-medium text-foreground transition-colors">
                  <Link
                    to="/timer"
                    className="flex min-w-0 flex-1 items-center gap-1.5 rounded-l-md px-2 py-1 transition-colors hover:bg-primary/15"
                    title={t("nav.timerAlarmTitle")}
                    aria-label={t("nav.timerAlarmAria")}
                  >
                    <BellRing
                      className="h-3.5 w-3.5 shrink-0 text-primary animate-pulse"
                      aria-hidden
                    />
                    <span className="tabular-nums">
                      {formatTime(remainingSeconds)}
                    </span>
                    <span className="min-w-0 truncate text-xs font-normal">
                      {t("timer.timeEnded")}
                    </span>
                  </Link>
                  <div className="flex shrink-0 items-center border-l border-border/70">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none rounded-r-md"
                      onClick={() => dismissNaturalEndMessage()}
                      aria-label={t("timer.close")}
                    >
                      <VolumeX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex min-w-0 max-w-full items-center overflow-hidden rounded-md border text-sm font-medium tabular-nums transition-colors ${
                    phase === "paused"
                      ? "border-border bg-muted/40 text-muted-foreground"
                      : "border-primary/30 bg-primary/10 text-foreground"
                  }`}
                >
                  <Link
                    to="/timer"
                    className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-l-md px-2 py-1 transition-colors ${
                      phase === "paused"
                        ? "hover:bg-muted/60"
                        : "hover:bg-primary/15"
                    }`}
                    title={t("nav.timerActiveTitle", {
                      time: formatTime(remainingSeconds),
                    })}
                    aria-label={t("nav.timerActiveAria", {
                      time: formatTime(remainingSeconds),
                    })}
                  >
                    <Clock
                      className="h-3.5 w-3.5 shrink-0 opacity-80"
                      aria-hidden
                    />
                    <span className="truncate">
                      {formatTime(remainingSeconds)}
                    </span>
                    {phase === "paused" && (
                      <span className="shrink-0 text-xs font-normal">
                        {t("nav.timerPaused")}
                      </span>
                    )}
                  </Link>
                  <div className="flex shrink-0 items-center border-l border-border/70">
                    {phase === "running" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => pause()}
                        aria-label={t("timer.pause")}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => start()}
                        aria-label={t("timer.resume")}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none rounded-r-md"
                      onClick={() => stop()}
                      aria-label={t("timer.stop")}
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to="/"
              className={`hidden text-sm font-medium transition-colors md:inline-flex ${
                isHome
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/manage-players"
              className={`hidden text-sm font-medium transition-colors md:inline-flex ${
                isManagePlayers
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("nav.players")}
            </Link>
            <Link
              to="/timer"
              className={`hidden text-sm font-medium transition-colors md:inline-flex ${
                isTimer
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("nav.timer")}
            </Link>
            <div className="hidden h-6 w-px bg-border md:block" />
            <LanguageSwitcher />
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
            © {new Date().getFullYear()} Poker Chips. {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
