import type { Chip } from "../pages/ManagePlayers/types";
import type {
  ChipDistribution,
  PlayerDistribution,
} from "../pages/ManagePlayers/types";

/**
 * Computes per-player chip distribution (everyone gets the same combination).
 * Returns an empty array if no valid distribution exists.
 */
export function calculateDistribution(
  chips: Chip[],
  players: number,
  stackValue: number,
): PlayerDistribution[] {
  // Validate inputs: player count and stack value must be valid and positive
  if (!players || players <= 0 || isNaN(stackValue) || stackValue <= 0) {
    return [];
  }

  // Convert stack value to cents (avoids floating-point errors)
  const stackCents = Math.round(stackValue * 100);
  // Total available value: for each chip type, (value in cents × quantity)
  const totalAvailableCents = chips.reduce(
    (sum, chip) => sum + Math.round(chip.value * 100) * chip.quantity,
    0,
  );
  // Total value needed to give each player the target stack
  const totalRequiredCents = players * stackCents;

  // Not enough chips in the bank to distribute
  if (totalRequiredCents > totalAvailableCents) {
    return [];
  }

  // Sort chips from lowest to highest denomination (prefer smaller chips first)
  const sortedChips = [...chips].sort((a, b) => a.value - b.value);
  // Each chip’s value in cents (same order as sortedChips)
  const chipValuesCents = sortedChips.map((c) => Math.round(c.value * 100));
  // Reserve levels to try: 25%, 20%, 15%, and 0% (use full stock)
  const reservePercents = [0.25, 0.2, 0.15, 0];

  /**
   * Try to find a valid combination using a reserve percentage.
   * Reserve keeps some chips “in the bank” (undistributed).
   */
  const tryWithReserve = (
    reservePercent: number,
  ): PlayerDistribution[] | null => {
    // Usage factor: e.g. 0.75 means only 75% of stock may be used (25% reserve)
    const usageFactor = 1 - reservePercent;
    // Per chip type, max each player can receive (integer division)
    const maxPerPlayer = sortedChips.map((chip) =>
      Math.floor((chip.quantity * usageFactor) / players),
    );
    // Maximum value we can give all players combined with this reserve
    const maxTotalValueForAllPlayers = sortedChips.reduce(
      (sum, _, idx) => sum + chipValuesCents[idx] * maxPerPlayer[idx] * players,
      0,
    );

    // This reserve cannot reach the required value; try another
    if (maxTotalValueForAllPlayers < totalRequiredCents) return null;

    // Holds the count per chip type in the combination we find
    const combination = new Array<number>(sortedChips.length).fill(0);

    /**
     * Backtracking: find quantities per chip type such that
     * sum(qty[i] * value[i]) = remaining and each qty[i] <= maxPerPlayer[i].
     */
    const searchCombination = (index: number, remaining: number): boolean => {
      // End of chip types: success only if nothing left to cover
      if (index === sortedChips.length) return remaining === 0;
      // Current chip value in cents
      const valueCents = chipValuesCents[index];
      // Max chips of this type: min of per-player cap and what remaining allows
      const maxByValue = Math.min(
        maxPerPlayer[index],
        Math.floor(remaining / valueCents),
      );
      // Try from max down to zero for this type (prefers more smaller chips)
      for (let qty = maxByValue; qty >= 0; qty--) {
        // What’s left after using `qty` chips of this type
        const newRemaining = remaining - qty * valueCents;
        if (newRemaining < 0) continue;
        // Record this quantity in the combination
        combination[index] = qty;
        // Recurse: next types with the new remainder
        if (searchCombination(index + 1, newRemaining)) return true;
      }
      // No quantity for this type led to a solution
      return false;
    };

    // Try to find a combination that sums exactly to stackCents
    if (!searchCombination(0, stackCents)) return null;

    // Build each player’s chip list from the combination
    const playerChipsTemplate: ChipDistribution[] = [];
    for (let i = 0; i < sortedChips.length; i++) {
      const qty = combination[i];
      // Skip chip types with zero quantity in the combination
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

    // One record per player, all sharing the same chip template
    return Array.from({ length: players }, (_, idx) => ({
      playerNumber: idx + 1,
      totalValue: stackCents / 100,
      chips: playerChipsTemplate.map((c) => ({ ...c })),
    }));
  };

  // Try each reserve level until a valid combination is found
  for (const reserve of reservePercents) {
    const result = tryWithReserve(reserve);
    if (result) return result;
  }

  // No reserve level yielded a valid combination (e.g. exact value not reachable)
  return [];
}
