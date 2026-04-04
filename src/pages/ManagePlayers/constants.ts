import type { TFunction } from "i18next";
import type { Chip } from "./types";

export const chipDefaults = [
  { nameKey: "initialChips.white", value: 1000.0, quantity: 100, color: "#ffffff", borderColor: "#d1d5db" },
  { nameKey: "initialChips.red", value: 50.0, quantity: 50, color: "#ef4444", borderColor: "#b91c1c" },
  { nameKey: "initialChips.black", value: 500.0, quantity: 50, color: "#020617", borderColor: "#020617" },
  { nameKey: "initialChips.blue", value: 100.0, quantity: 50, color: "#3b82f6", borderColor: "#1d4ed8" },
  { nameKey: "initialChips.green", value: 250.0, quantity: 50, color: "#22c55e", borderColor: "#16a34a" },
] as const;

export function getInitialChips(t: TFunction): Chip[] {
  return chipDefaults.map((chip) => ({
    ...chip,
    name: t(chip.nameKey),
  }));
}
