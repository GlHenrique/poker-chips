import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit2, Check, X } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface Chip {
  name: string;
  value: number;
  quantity: number;
  color: string;
  borderColor: string;
}

interface ChipDistribution {
  chipName: string;
  chipValue: number;
  chipColor: string;
  chipBorderColor: string;
  amount: number;
}

interface PlayerDistribution {
  playerNumber: number;
  totalValue: number;
  chips: ChipDistribution[];
}

const initialChips: Chip[] = [
  {
    name: "Fichas Brancas",
    value: 1000.0,
    quantity: 100,
    color: "#ffffff",
    borderColor: "#d1d5db",
  },
  {
    name: "Fichas Vermelhas",
    value: 50.0,
    quantity: 50,
    color: "#ef4444",
    borderColor: "#b91c1c",
  },
  {
    name: "Fichas Pretas",
    value: 500.0,
    quantity: 50,
    color: "#020617",
    borderColor: "#020617",
  },
  {
    name: "Fichas Azuis",
    value: 100.0,
    quantity: 50,
    color: "#3b82f6",
    borderColor: "#1d4ed8",
  },
  {
    name: "Fichas Verdes",
    value: 250.0,
    quantity: 50,
    color: "#22c55e",
    borderColor: "#16a34a",
  },
];

function getContrastTextColor(hex: string): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.5 ? "#0f172a" : "#f8fafc";
}

export function ManagePlayers() {
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [initialStack, setInitialStack] = useState("");
  const [smallBlind, setSmallBlind] = useState("50");
  const [bigBlind, setBigBlind] = useState("100");
  const [chips, setChips] = useState<Chip[]>(initialChips);
  const [editingChip, setEditingChip] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    name: string;
    value: string;
    quantity: string;
    color: string;
  }>({
    name: "",
    value: "",
    quantity: "",
    color: "#ffffff",
  });
  const [distribution, setDistribution] = useState<PlayerDistribution[] | null>(
    null,
  );
  const [isHidingDistribution, setIsHidingDistribution] = useState(false);

  const resetDistribution = (withAnimation = false) => {
    if (distribution === null) return;

    if (withAnimation) {
      setIsHidingDistribution(true);
      setTimeout(() => {
        setDistribution(null);
        setIsHidingDistribution(false);
      }, 250);
      return;
    }

    setDistribution(null);
    setIsHidingDistribution(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const players = parseInt(numberOfPlayers, 10);
    const stackValue = parseFloat(initialStack);

    if (!players || players <= 0 || isNaN(stackValue) || stackValue <= 0) {
      setDistribution([]);
      return;
    }

    // Trabalhar em centavos para evitar problemas de ponto flutuante
    const stackCents = Math.round(stackValue * 100);

    const totalAvailableCents = chips.reduce(
      (sum, chip) => sum + Math.round(chip.value * 100) * chip.quantity,
      0,
    );

    const totalRequiredCents = players * stackCents;

    // Se não há fichas suficientes para todos os stacks
    if (totalRequiredCents > totalAvailableCents) {
      setDistribution([]);
      return;
    }

    // Ordena as fichas por valor crescente para priorizar fichas menores (50, 100, etc.)
    const sortedChips = [...chips].sort((a, b) => a.value - b.value);
    const chipValuesCents = sortedChips.map((chip) =>
      Math.round(chip.value * 100),
    );

    // Tentativas de reserva de fichas no "banco"
    const reservePercents = [0.25, 0.2, 0.15, 0]; // 25%, 20%, 15% ou usar o máximo

    const tryWithReserve = (
      reservePercent: number,
    ): PlayerDistribution[] | null => {
      const usageFactor = 1 - reservePercent;

      // Máximo de cada ficha que cada jogador pode receber, respeitando a reserva
      const maxPerPlayer = sortedChips.map((chip) =>
        Math.floor((chip.quantity * usageFactor) / players),
      );

      // Valor máximo possível para todos os jogadores com essa reserva
      const maxTotalValueForAllPlayers = sortedChips.reduce(
        (sum, _, idx) =>
          sum + chipValuesCents[idx] * maxPerPlayer[idx] * players,
        0,
      );

      if (maxTotalValueForAllPlayers < totalRequiredCents) {
        return null;
      }

      const combination = new Array<number>(sortedChips.length).fill(0);

      // Backtracking para encontrar uma combinação onde:
      // soma(quantidadePorFicha[i] * valorFicha[i]) = stackCents
      // e quantidadePorFicha[i] <= maxPerPlayer[i]
      const searchCombination = (index: number, remaining: number): boolean => {
        if (index === sortedChips.length) {
          return remaining === 0;
        }

        const valueCents = chipValuesCents[index];
        const maxByValue = Math.min(
          maxPerPlayer[index],
          Math.floor(remaining / valueCents),
        );

        // Começa do máximo para esse tipo de ficha, para tentar usar mais fichas menores
        for (let qty = maxByValue; qty >= 0; qty--) {
          const newRemaining = remaining - qty * valueCents;

          if (newRemaining < 0) continue;

          combination[index] = qty;

          if (searchCombination(index + 1, newRemaining)) {
            return true;
          }
        }

        return false;
      };

      const found = searchCombination(0, stackCents);

      if (!found) {
        return null;
      }

      // Monta as fichas que cada jogador vai receber (mesma combinação para todos)
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

      const playersDistribution: PlayerDistribution[] = Array.from(
        { length: players },
        (_, idx) => ({
          playerNumber: idx + 1,
          totalValue: stackCents / 100,
          chips: playerChipsTemplate.map((chip) => ({ ...chip })),
        }),
      );

      return playersDistribution;
    };

    for (const reserve of reservePercents) {
      const result = tryWithReserve(reserve);
      if (result) {
        setDistribution(result);
        return;
      }
    }

    // Se nenhuma combinação respeitando as reservas foi encontrada
    setDistribution([]);
  };

  const handleEdit = (chip: Chip) => {
    setEditingChip(chip.name);
    setEditValues({
      name: chip.name,
      value: chip.value.toString(),
      quantity: chip.quantity.toString(),
      color: chip.color,
    });
  };

  const handleSave = (chipName: string) => {
    resetDistribution();
    setChips((prevChips) =>
      prevChips.map((chip) =>
        chip.name === chipName
          ? {
              ...chip,
              name: editValues.name || chip.name,
              value: parseFloat(editValues.value) || chip.value,
              quantity: parseInt(editValues.quantity) || chip.quantity,
              color: editValues.color || chip.color,
              borderColor: editValues.color || chip.borderColor,
            }
          : chip,
      ),
    );
    setEditingChip(null);
    setEditValues({ value: "", quantity: "", color: "", name: "" });
  };

  const handleCancel = () => {
    setEditingChip(null);
    setEditValues({ value: "", quantity: "", color: "", name: "" });
  };

  const handleReset = () => {
    resetDistribution();
    setChips(initialChips);
  };

  const handleClearForm = () => {
    resetDistribution(true);
    setNumberOfPlayers("");
    setInitialStack("");
    setSmallBlind("50");
    setBigBlind("100");
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Distribuição de Fichas</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            Restaurar Padrão
          </Button>
        </div>
        <div className="space-y-3">
          {chips.map((chip) => (
            <div
              key={chip.name}
              className="flex items-center justify-between p-2 rounded-md bg-muted/20"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 md:w-6 md:h-6 rounded-full border-2"
                  style={{
                    backgroundColor: chip.color,
                    borderColor: chip.borderColor,
                  }}
                />
                <span className="font-medium">{chip.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {editingChip === chip.name ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1 items-end">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`name-${chip.name}`}>Nome</Label>
                        <Input
                          id={`name-${chip.name}`}
                          type="text"
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              name: e.target.value,
                            })
                          }
                          className="w-32 h-8 text-sm"
                          placeholder="Nome"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="value">Valor</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editValues.value}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              value: e.target.value,
                            })
                          }
                          className="w-24 h-8 text-sm"
                          placeholder="Valor"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editValues.quantity}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              quantity: e.target.value,
                            })
                          }
                          className="w-24 h-8 text-sm"
                          placeholder="Quantidade"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`color-${chip.name}`}>Cor</Label>
                        <input
                          id={`color-${chip.name}`}
                          type="color"
                          value={editValues.color}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              color: e.target.value,
                            })
                          }
                          className="h-8 w-10 rounded-md border border-border bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSave(chip.name)}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCancel}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(chip.value)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {chip.quantity} unidades
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(chip)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Gerenciar Jogadores
        </h1>
        <p className="text-muted-foreground">
          Adicione, edite e gerencie os jogadores das suas partidas de poker.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
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
            onChange={(e) => {
              resetDistribution();
              setNumberOfPlayers(e.target.value);
            }}
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
            onChange={(e) => {
              resetDistribution();
              setInitialStack(e.target.value);
            }}
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
              onChange={(e) => {
                resetDistribution();
                setSmallBlind(e.target.value);
              }}
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
              onChange={(e) => {
                resetDistribution();
                setBigBlind(e.target.value);
              }}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-accent text-accent-foreground hover:bg-accent/10"
            onClick={handleClearForm}
          >
            Limpar
          </Button>
          <Button
            type="submit"
            disabled={
              !numberOfPlayers ||
              !initialStack ||
              !smallBlind ||
              !bigBlind ||
              parseFloat(bigBlind) < parseFloat(smallBlind)
            }
          >
            Calcular Fichas
          </Button>
        </div>
      </form>

      {distribution && distribution.length > 0 && (
        <div
          className={`rounded-lg border bg-card p-6 ${
            isHidingDistribution ? "fade-out" : "fade-in-up"
          }`}
        >
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-2">
              Distribuição por Jogador
            </h2>
            <div className="flex gap-4 text-sm text-muted-foreground">
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
                    {Math.round(
                      parseFloat(initialStack) / parseFloat(bigBlind),
                    )}{" "}
                    BB)
                  </span>
                )}
            </div>
          </div>
          <div className="space-y-4">
            {distribution.map((player, idx) => (
              <div
                key={player.playerNumber}
                className={`rounded-md border bg-muted/30 p-4 ${
                  isHidingDistribution ? "fade-out" : "fade-in-up"
                }`}
                style={
                  !isHidingDistribution
                    ? { animationDelay: `${idx * 70}ms` }
                    : undefined
                }
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    Jogador {player.playerNumber}
                  </h3>
                  <span className="text-sm font-medium text-muted-foreground">
                    Total: {formatCurrency(player.totalValue)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {player.chips.map((chip, index) => (
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
                          <span className="text-sm font-medium">
                            {chip.amount}x
                          </span>
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
            ))}
          </div>
        </div>
      )}

      {distribution && distribution.length === 0 && (
        <div
          className={`rounded-lg border bg-card p-6 ${
            isHidingDistribution ? "fade-out" : "fade-in-up"
          }`}
        >
          <p className="text-muted-foreground text-center">
            Não foi possível calcular a distribuição. Verifique:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
            <li>Se há fichas suficientes para o valor solicitado</li>
            <li>
              Se a stack inicial é pelo menos 100 big blinds (recomendado)
            </li>
            <li>Se há fichas pequenas o suficiente para o small blind</li>
            <li>Se o big blind é maior ou igual ao small blind</li>
          </ul>
        </div>
      )}
    </div>
  );
}
