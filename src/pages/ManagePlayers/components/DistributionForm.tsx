import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "react-i18next";

type DistributionFormProps = {
  numberOfPlayers: string;
  initialStack: string;
  smallBlind: string;
  bigBlind: string;
  onNumberOfPlayersChange: (value: string) => void;
  onInitialStackChange: (value: string) => void;
  onSmallBlindChange: (value: string) => void;
  onBigBlindChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export function DistributionForm({
  numberOfPlayers,
  initialStack,
  smallBlind,
  bigBlind,
  onNumberOfPlayersChange,
  onInitialStackChange,
  onSmallBlindChange,
  onBigBlindChange,
  onSubmit,
  onClear,
}: DistributionFormProps) {
  const { t } = useTranslation();
  const formatCurrency = useCurrencyFormatter();

  const isSubmitDisabled =
    !numberOfPlayers ||
    !initialStack ||
    !smallBlind ||
    !bigBlind ||
    parseFloat(bigBlind) < parseFloat(smallBlind);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border bg-card p-4 space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="numberOfPlayers">
          {t("managePlayers.form.numberOfPlayers")}
        </Label>
        <Input
          id="numberOfPlayers"
          type="number"
          min="1"
          placeholder={t("managePlayers.form.numberOfPlayersPlaceholder")}
          value={numberOfPlayers}
          onChange={(e) => onNumberOfPlayersChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="initialStack">
          {t("managePlayers.form.initialStack")}
        </Label>
        <Input
          id="initialStack"
          type="number"
          min="0"
          step="0.01"
          placeholder={t("managePlayers.form.initialStackPlaceholder")}
          value={initialStack}
          onChange={(e) => onInitialStackChange(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          {bigBlind && !isNaN(parseFloat(bigBlind)) && (
            <>
              {t("managePlayers.form.initialStackHint", {
                amount: formatCurrency(parseFloat(bigBlind) * 100),
              })}
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="smallBlind">
            {t("managePlayers.form.smallBlind")}
          </Label>
          <Input
            id="smallBlind"
            type="number"
            min="0"
            step="0.01"
            placeholder={t("managePlayers.form.smallBlindPlaceholder")}
            value={smallBlind}
            onChange={(e) => onSmallBlindChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bigBlind">{t("managePlayers.form.bigBlind")}</Label>
          <Input
            id="bigBlind"
            type="number"
            min="0"
            step="0.01"
            placeholder={t("managePlayers.form.bigBlindPlaceholder")}
            value={bigBlind}
            onChange={(e) => onBigBlindChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-accent text-accent-foreground hover:bg-accent/10"
          onClick={onClear}
        >
          {t("managePlayers.form.clear")}
        </Button>
        <Button type="submit" disabled={isSubmitDisabled}>
          {t("managePlayers.form.calculate")}
        </Button>
      </div>
    </form>
  );
}
