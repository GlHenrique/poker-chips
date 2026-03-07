import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface Chip {
  name: string;
  value: number;
  quantity: number;
  bgColor: string;
  borderColor: string;
}

interface ChipDistribution {
  chipName: string;
  chipValue: number;
  chipBgColor: string;
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
    bgColor: "bg-white",
    borderColor: "border-gray-300",
  },
  {
    name: "Fichas Vermelhas",
    value: 50.0,
    quantity: 50,
    bgColor: "bg-red-500",
    borderColor: "border-red-600",
  },
  {
    name: "Fichas Pretas",
    value: 500.0,
    quantity: 50,
    bgColor: "bg-black",
    borderColor: "border-gray-800",
  },
  {
    name: "Fichas Azuis",
    value: 100.0,
    quantity: 50,
    bgColor: "bg-blue-500",
    borderColor: "border-blue-600",
  },
  {
    name: "Fichas Verdes",
    value: 250.0,
    quantity: 50,
    bgColor: "bg-green-500",
    borderColor: "border-green-600",
  },
];

export function ManagePlayers() {
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [initialStack, setInitialStack] = useState("");
  const [smallBlind, setSmallBlind] = useState("50");
  const [bigBlind, setBigBlind] = useState("100");
  const [chips, setChips] = useState<Chip[]>(initialChips);
  const [editingChip, setEditingChip] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    value: string;
    quantity: string;
  }>({
    value: "",
    quantity: "",
  });
  const [distribution, setDistribution] = useState<PlayerDistribution[] | null>(
    null
  );

  const resetDistribution = () => {
    if (distribution !== null) {
      setDistribution(null);
    }
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
      0
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
      Math.round(chip.value * 100)
    );

    // Tentativas de reserva de fichas no "banco"
    const reservePercents = [0.25, 0.2, 0.15, 0]; // 25%, 20%, 15% ou usar o máximo

    const tryWithReserve = (
      reservePercent: number
    ): PlayerDistribution[] | null => {
      const usageFactor = 1 - reservePercent;

      // Máximo de cada ficha que cada jogador pode receber, respeitando a reserva
      const maxPerPlayer = sortedChips.map((chip) =>
        Math.floor((chip.quantity * usageFactor) / players)
      );

      // Valor máximo possível para todos os jogadores com essa reserva
      const maxTotalValueForAllPlayers = sortedChips.reduce(
        (sum, _, idx) =>
          sum + chipValuesCents[idx] * maxPerPlayer[idx] * players,
        0
      );

      if (maxTotalValueForAllPlayers < totalRequiredCents) {
        return null;
      }

      const combination = new Array<number>(sortedChips.length).fill(0);

      // Backtracking para encontrar uma combinação onde:
      // soma(quantidadePorFicha[i] * valorFicha[i]) = stackCents
      // e quantidadePorFicha[i] <= maxPerPlayer[i]
      const searchCombination = (
        index: number,
        remaining: number
      ): boolean => {
        if (index === sortedChips.length) {
          return remaining === 0;
        }

        const valueCents = chipValuesCents[index];
        const maxByValue = Math.min(
          maxPerPlayer[index],
          Math.floor(remaining / valueCents)
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
          chipBgColor: chip.bgColor,
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
        })
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
      value: chip.value.toString(),
      quantity: chip.quantity.toString(),
    });
  };

  const handleSave = (chipName: string) => {
    resetDistribution();
    setChips((prevChips) =>
      prevChips.map((chip) =>
        chip.name === chipName
          ? {
              ...chip,
              value: parseFloat(editValues.value) || chip.value,
              quantity: parseInt(editValues.quantity) || chip.quantity,
            }
          : chip
      )
    );
    setEditingChip(null);
    setEditValues({ value: "", quantity: "" });
  };

  const handleCancel = () => {
    setEditingChip(null);
    setEditValues({ value: "", quantity: "" });
  };

  const handleReset = () => {
    resetDistribution();
    setChips(initialChips);
  };

  return (
    <div className="space-y-6">
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
              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 md:w-6 md:h-6 rounded-full ${chip.bgColor} border-2 ${chip.borderColor}`}
                />
                <span className="font-medium">{chip.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {editingChip === chip.name ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1 items-end">
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
              <>Recomendado: mínimo 100 big blinds ({formatCurrency(parseFloat(bigBlind) * 100)})</>
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

        <div className="flex justify-end">
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
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-2">
              Distribuição por Jogador
            </h2>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">Blinds:</strong> {formatCurrency(parseFloat(smallBlind))} / {formatCurrency(parseFloat(bigBlind))}
              </span>
              {bigBlind && !isNaN(parseFloat(bigBlind)) && parseFloat(bigBlind) > 0 && (
                <span>
                  <strong className="text-foreground">Stack:</strong> {formatCurrency(parseFloat(initialStack))} ({Math.round(parseFloat(initialStack) / parseFloat(bigBlind))} BB)
                </span>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {distribution.map((player) => (
              <div
                key={player.playerNumber}
                className="rounded-md border bg-muted/30 p-4"
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
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-background border"
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${chip.chipBgColor} border ${chip.chipBorderColor}`}
                      />
                      <span className="text-sm font-medium">
                        {chip.amount}x
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(chip.chipValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {distribution && distribution.length === 0 && (
        <div className="rounded-lg border bg-card p-6">
          <p className="text-muted-foreground text-center">
            Não foi possível calcular a distribuição. Verifique:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
            <li>Se há fichas suficientes para o valor solicitado</li>
            <li>Se a stack inicial é pelo menos 100 big blinds (recomendado)</li>
            <li>Se há fichas pequenas o suficiente para o small blind</li>
            <li>Se o big blind é maior ou igual ao small blind</li>
          </ul>
        </div>
      )}
    </div>
  );
}
