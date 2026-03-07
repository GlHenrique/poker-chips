import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/utils/formatCurrency";
import { getContrastTextColor } from "@/utils/color";
import type { PlayerDistribution } from "../types";

type DistributionResultProps = {
  distribution: PlayerDistribution[];
  smallBlind: string;
  bigBlind: string;
  initialStack: string;
  isHiding: boolean;
};

export function DistributionResult({
  distribution,
  smallBlind,
  bigBlind,
  initialStack,
  isHiding,
}: DistributionResultProps) {
  return (
    <div
      id="distribution-result"
      className={`scroll-mt-24 rounded-lg border bg-card p-6 ${
        isHiding ? "fade-out" : "fade-in-up"
      }`}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2">
          Distribuição por Jogador
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">Blinds:</strong>{" "}
            {formatCurrency(parseFloat(smallBlind))} /{" "}
            {formatCurrency(parseFloat(bigBlind))}
          </span>
          {bigBlind &&
            !isNaN(parseFloat(bigBlind)) &&
            parseFloat(bigBlind) > 0 && (
              <span>
                <strong className="text-foreground">Stack:</strong>{" "}
                {formatCurrency(parseFloat(initialStack))} (
                {Math.round(parseFloat(initialStack) / parseFloat(bigBlind))}{" "}
                BB)
              </span>
            )}
          <span>
            <strong className="text-foreground">Jogadores:</strong>{" "}
            {distribution.length}
          </span>
        </div>
      </div>
      <div
        className={`rounded-md border bg-muted/30 p-4 ${
          isHiding ? "fade-out" : "fade-in-up"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Fichas por Jogador:</h3>
          <span className="text-sm font-medium text-muted-foreground">
            Total: {formatCurrency(distribution[0].totalValue)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {distribution[0].chips.map((chip, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-background border cursor-default">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{
                      backgroundColor: chip.chipColor,
                      borderColor: chip.chipBorderColor,
                    }}
                  />
                  <span className="text-sm font-medium">{chip.amount}x</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(chip.chipValue)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="border-0"
                style={{
                  backgroundColor: chip.chipColor,
                  color: getContrastTextColor(chip.chipColor),
                  borderColor: chip.chipBorderColor,
                }}
              >
                <p>{chip.chipName}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
