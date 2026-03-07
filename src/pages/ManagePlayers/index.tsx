import { useState, type FormEvent } from "react";
import { scrollToElementById } from "@/utils/scrollToElement";
import { calculateDistribution } from "./calculateDistribution";
import { initialChips } from "./constants";
import type { Chip, ChipEditValues, PlayerDistribution } from "./types";
import {
  ChipConfigCard,
  DistributionForm,
  DistributionResult,
  DistributionError,
} from "./components";

const emptyEditValues: ChipEditValues = {
  name: "",
  value: "",
  quantity: "",
  color: "#ffffff",
};

export function ManagePlayers() {
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [initialStack, setInitialStack] = useState("");
  const [smallBlind, setSmallBlind] = useState("50");
  const [bigBlind, setBigBlind] = useState("100");
  const [chips, setChips] = useState<Chip[]>(initialChips);
  const [editingChip, setEditingChip] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<ChipEditValues>(emptyEditValues);
  const [distribution, setDistribution] = useState<PlayerDistribution[] | null>(
    null
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
    const result = calculateDistribution(chips, players, stackValue);
    setDistribution(result);
    if (result.length > 0) {
      scrollToElementById("distribution-result");
    }
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
    setChips((prev) =>
      prev.map((chip) =>
        chip.name === chipName
          ? {
              ...chip,
              name: editValues.name || chip.name,
              value: parseFloat(editValues.value) || chip.value,
              quantity: parseInt(editValues.quantity, 10) || chip.quantity,
              color: editValues.color || chip.color,
              borderColor: editValues.color || chip.borderColor,
            }
          : chip
      )
    );
    setEditingChip(null);
    setEditValues(emptyEditValues);
  };

  const handleCancel = () => {
    setEditingChip(null);
    setEditValues(emptyEditValues);
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

  const withReset = <T,>(fn: (value: T) => void) => (value: T) => {
    resetDistribution();
    fn(value);
  };

  return (
    <div className="space-y-6 fade-in-up">
      <ChipConfigCard
        chips={chips}
        editingChip={editingChip}
        editValues={editValues}
        onEditValuesChange={(values) =>
          setEditValues((prev) => ({ ...prev, ...values }))
        }
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onReset={handleReset}
      />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Gerenciar Jogadores
        </h1>
        <p className="text-muted-foreground">
          Adicione, edite e gerencie os jogadores das suas partidas de poker.
        </p>
      </div>

      <DistributionForm
        numberOfPlayers={numberOfPlayers}
        initialStack={initialStack}
        smallBlind={smallBlind}
        bigBlind={bigBlind}
        onNumberOfPlayersChange={withReset(setNumberOfPlayers)}
        onInitialStackChange={withReset(setInitialStack)}
        onSmallBlindChange={withReset(setSmallBlind)}
        onBigBlindChange={withReset(setBigBlind)}
        onSubmit={handleSubmit}
        onClear={handleClearForm}
      />

      {distribution && distribution.length > 0 && (
        <DistributionResult
          distribution={distribution}
          smallBlind={smallBlind}
          bigBlind={bigBlind}
          initialStack={initialStack}
          isHiding={isHidingDistribution}
        />
      )}

      {distribution && distribution.length === 0 && (
        <DistributionError isHiding={isHidingDistribution} />
      )}
    </div>
  );
}
