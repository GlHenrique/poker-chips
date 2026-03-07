import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatCurrency";

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
        <Label htmlFor="numberOfPlayers">Quantidade de Jogadores</Label>
        <Input
          id="numberOfPlayers"
          type="number"
          min="1"
          placeholder="Ex: 6"
          value={numberOfPlayers}
          onChange={(e) => onNumberOfPlayersChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="initialStack">Valor Inicial da Stack (R$)</Label>
        <Input
          id="initialStack"
          type="number"
          min="0"
          step="0.01"
          placeholder="Ex: 10000.00"
          value={initialStack}
          onChange={(e) => onInitialStackChange(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          {bigBlind && !isNaN(parseFloat(bigBlind)) && (
            <>
              Recomendado: mínimo 100 big blinds (
              {formatCurrency(parseFloat(bigBlind) * 100)})
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="smallBlind">Small Blind (R$)</Label>
          <Input
            id="smallBlind"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 50.00"
            value={smallBlind}
            onChange={(e) => onSmallBlindChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bigBlind">Big Blind (R$)</Label>
          <Input
            id="bigBlind"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 100.00"
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
          Limpar
        </Button>
        <Button type="submit" disabled={isSubmitDisabled}>
          Calcular Fichas
        </Button>
      </div>
    </form>
  );
}
