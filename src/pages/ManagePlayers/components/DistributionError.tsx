import { useTranslation } from "react-i18next";

type DistributionErrorProps = {
  isHiding: boolean;
};

export function DistributionError({ isHiding }: DistributionErrorProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-lg border bg-card p-6 ${
        isHiding ? "fade-out" : "fade-in-up"
      }`}
    >
      <p className="text-muted-foreground text-center">
        {t("managePlayers.error.message")}
      </p>
      <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
        <li>{t("managePlayers.error.reasons.chips")}</li>
        <li>{t("managePlayers.error.reasons.stack")}</li>
        <li>{t("managePlayers.error.reasons.smallChips")}</li>
        <li>{t("managePlayers.error.reasons.bigBlind")}</li>
      </ul>
    </div>
  );
}
