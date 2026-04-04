import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 fade-in-up">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("home.title")}
        </h1>
        <p className="text-muted-foreground">{t("home.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/manage-players"
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors cursor-pointer block"
        >
          <h3 className="text-lg font-semibold mb-2">
            {t("home.cards.players.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("home.cards.players.description")}
          </p>
        </Link>
        <Link
          to="/timer"
          className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors cursor-pointer block"
        >
          <h3 className="text-lg font-semibold mb-2">
            {t("home.cards.timer.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("home.cards.timer.description")}
          </p>
        </Link>
      </div>
    </div>
  );
}
