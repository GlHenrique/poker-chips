import { Outlet, useLocation, Link } from "react-router";
import { ModeToggle, useTheme, LanguageSwitcher } from "@/components/app";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LogoDark from "@/assets/poker-chips-logo.svg";
import LogoLight from "@/assets/poker-chips-logo-light.svg";
import { useTranslation } from "react-i18next";

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isManagePlayers = location.pathname === "/manage-players";
  const isTimer = location.pathname === "/timer";
  const { theme } = useTheme();
  const { t } = useTranslation();

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
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6 fade-in-up">
          <div className="flex items-center gap-3">
            {!isHome && (
              <Link to="/" className="fixed top-4 left-[-54px]">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">{t("nav.back")}</span>
                </Button>
              </Link>
            )}
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="Poker Chips"
                className="h-10 w-auto rounded-md shadow-md ring-1 ring-white/10 transition-transform duration-200 hover:scale-105"
              />
            </Link>
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
