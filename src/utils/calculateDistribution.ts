import type { Chip } from "../pages/ManagePlayers/types";
import type {
  ChipDistribution,
  PlayerDistribution,
} from "../pages/ManagePlayers/types";

/**
 * Calcula a distribuição de fichas por jogador.
 * Retorna array vazio se não for possível calcular.
 */
export function calculateDistribution(
  chips: Chip[],
  players: number,
  stackValue: number,
): PlayerDistribution[] {
  if (!players || players <= 0 || isNaN(stackValue) || stackValue <= 0) {
    return [];
  }

  const stackCents = Math.round(stackValue * 100);
  const totalAvailableCents = chips.reduce(
    (sum, chip) => sum + Math.round(chip.value * 100) * chip.quantity,
    0,
  );
  const totalRequiredCents = players * stackCents;

  if (totalRequiredCents > totalAvailableCents) {
    return [];
  }

  const sortedChips = [...chips].sort((a, b) => a.value - b.value);
  const chipValuesCents = sortedChips.map((c) => Math.round(c.value * 100));
  const reservePercents = [0.25, 0.2, 0.15, 0];

  const tryWithReserve = (
    reservePercent: number,
  ): PlayerDistribution[] | null => {
    const usageFactor = 1 - reservePercent;
    const maxPerPlayer = sortedChips.map((chip) =>
      Math.floor((chip.quantity * usageFactor) / players),
    );
    const maxTotalValueForAllPlayers = sortedChips.reduce(
      (sum, _, idx) => sum + chipValuesCents[idx] * maxPerPlayer[idx] * players,
      0,
    );

    if (maxTotalValueForAllPlayers < totalRequiredCents) return null;

    const combination = new Array<number>(sortedChips.length).fill(0);

    const searchCombination = (index: number, remaining: number): boolean => {
      if (index === sortedChips.length) return remaining === 0;
      const valueCents = chipValuesCents[index];
      const maxByValue = Math.min(
        maxPerPlayer[index],
        Math.floor(remaining / valueCents),
      );
      for (let qty = maxByValue; qty >= 0; qty--) {
        const newRemaining = remaining - qty * valueCents;
        if (newRemaining < 0) continue;
        combination[index] = qty;
        if (searchCombination(index + 1, newRemaining)) return true;
      }
      return false;
    };

    if (!searchCombination(0, stackCents)) return null;

    const playerChipsTemplate: ChipDistribution[] = [];
    for (let i = 0; i < sortedChips.length; i++) {
      const qty = combination[i];
      if (qty <= 0) continue;
      const chip = sortedChips[i];
      playerChipsTemplate.push({
        chipName: chip.name,
        chipValue: chip.value,
        chipColor: chip.color,
        chipBorderColor: chip.borderColor,
        amount: qty,
      });
    }

    return Array.from({ length: players }, (_, idx) => ({
      playerNumber: idx + 1,
      totalValue: stackCents / 100,
      chips: playerChipsTemplate.map((c) => ({ ...c })),
    }));
  };

  for (const reserve of reservePercents) {
    const result = tryWithReserve(reserve);
    if (result) return result;
  }

  return [];
}
