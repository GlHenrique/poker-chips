import type { Chip } from "../pages/ManagePlayers/types";
import type {
  ChipDistribution,
  PlayerDistribution,
} from "../pages/ManagePlayers/types";

/**
 * Calcula a distribuição de fichas por jogador (todos recebem a mesma combinação).
 * Retorna array vazio se não for possível calcular.
 */
export function calculateDistribution(
  chips: Chip[],
  players: number,
  stackValue: number,
): PlayerDistribution[] {
  // Valida entradas: número de jogadores e valor da stack devem ser válidos e positivos
  if (!players || players <= 0 || isNaN(stackValue) || stackValue <= 0) {
    return [];
  }

  // Converte o valor da stack para centavos (evita erros de ponto flutuante)
  const stackCents = Math.round(stackValue * 100);
  // Soma o valor total disponível: para cada tipo de ficha, (valor em centavos × quantidade)
  const totalAvailableCents = chips.reduce(
    (sum, chip) => sum + Math.round(chip.value * 100) * chip.quantity,
    0,
  );
  // Valor total necessário para dar a stack definida a todos os jogadores
  const totalRequiredCents = players * stackCents;

  // Se não há fichas suficientes no total, não é possível distribuir
  if (totalRequiredCents > totalAvailableCents) {
    return [];
  }

  // Ordena as fichas do menor para o maior valor (prioriza usar fichas menores primeiro)
  const sortedChips = [...chips].sort((a, b) => a.value - b.value);
  // Array com o valor de cada ficha em centavos (mesma ordem de sortedChips)
  const chipValuesCents = sortedChips.map((c) => Math.round(c.value * 100));
  // Percentuais de reserva a testar: 25%, 20%, 15% e 0% (usa todo o estoque)
  const reservePercents = [0.25, 0.2, 0.15, 0];

  /**
   * Tenta encontrar uma combinação válida usando um percentual de reserva.
   * A reserva deixa parte das fichas "no banco" (não distribuídas).
   */
  const tryWithReserve = (
    reservePercent: number,
  ): PlayerDistribution[] | null => {
    // Fator de uso: ex. 0.75 significa que só 75% do estoque pode ser usado (25% reserva)
    const usageFactor = 1 - reservePercent;
    // Para cada tipo de ficha, máximo que cada jogador pode receber (divisão inteira)
    const maxPerPlayer = sortedChips.map((chip) =>
      Math.floor((chip.quantity * usageFactor) / players),
    );
    // Valor máximo que conseguimos dar a todos os jogadores com essa reserva
    const maxTotalValueForAllPlayers = sortedChips.reduce(
      (sum, _, idx) => sum + chipValuesCents[idx] * maxPerPlayer[idx] * players,
      0,
    );

    // Com essa reserva não dá para atingir o valor necessário; tenta outra
    if (maxTotalValueForAllPlayers < totalRequiredCents) return null;

    // Array que vai guardar a quantidade de cada tipo de ficha na combinação encontrada
    const combination = new Array<number>(sortedChips.length).fill(0);

    /**
     * Backtracking: busca uma combinação de quantidades por tipo de ficha tal que
     * a soma (qty[i] * valor[i]) = remaining e cada qty[i] <= maxPerPlayer[i].
     */
    const searchCombination = (index: number, remaining: number): boolean => {
      // Chegou ao fim dos tipos de ficha: sucesso só se o valor restante é zero
      if (index === sortedChips.length) return remaining === 0;
      // Valor em centavos da ficha atual
      const valueCents = chipValuesCents[index];
      // Máximo de fichas deste tipo que podemos usar: mínimo entre o permitido e o que falta
      const maxByValue = Math.min(
        maxPerPlayer[index],
        Math.floor(remaining / valueCents),
      );
      // Tenta usar do máximo até zero fichas deste tipo (prioriza mais fichas menores)
      for (let qty = maxByValue; qty >= 0; qty--) {
        // Quanto ainda falta após usar 'qty' fichas deste tipo
        const newRemaining = remaining - qty * valueCents;
        if (newRemaining < 0) continue;
        // Registra essa quantidade na combinação
        combination[index] = qty;
        // Recursão: busca combinação para os próximos tipos com o valor restante
        if (searchCombination(index + 1, newRemaining)) return true;
      }
      // Nenhuma quantidade deste tipo levou a uma solução
      return false;
    };

    // Tenta encontrar uma combinação que some exatamente stackCents
    if (!searchCombination(0, stackCents)) return null;

    // Monta a lista de fichas que cada jogador recebe a partir da combinação encontrada
    const playerChipsTemplate: ChipDistribution[] = [];
    for (let i = 0; i < sortedChips.length; i++) {
      const qty = combination[i];
      // Ignora tipos de ficha com quantidade zero na combinação
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

    // Retorna um registro por jogador, todos com o mesmo template de fichas
    return Array.from({ length: players }, (_, idx) => ({
      playerNumber: idx + 1,
      totalValue: stackCents / 100,
      chips: playerChipsTemplate.map((c) => ({ ...c })),
    }));
  };

  // Tenta cada nível de reserva até encontrar uma combinação válida
  for (const reserve of reservePercents) {
    const result = tryWithReserve(reserve);
    if (result) return result;
  }

  // Nenhuma reserva permitiu uma combinação válida (ex.: não dá para montar o valor exato)
  return [];
}
