import { Button } from "@/components/ui/button";
import { ChipRow } from "./ChipRow";
import type { Chip } from "../types";
import type { ChipEditValues } from "../types";

type ChipConfigCardProps = {
  chips: Chip[];
  editingChip: string | null;
  editValues: ChipEditValues;
  onEditValuesChange: (values: Partial<ChipEditValues>) => void;
  onEdit: (chip: Chip) => void;
  onSave: (chipName: string) => void;
  onCancel: () => void;
  onReset: () => void;
};

export function ChipConfigCard({
  chips,
  editingChip,
  editValues,
  onEditValuesChange,
  onEdit,
  onSave,
  onCancel,
  onReset,
}: ChipConfigCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Distribuição de Fichas</h2>
        <Button variant="outline" size="sm" onClick={onReset} className="text-xs">
          Restaurar Padrão
        </Button>
      </div>
      <div className="space-y-3">
        {chips.map((chip) => (
          <ChipRow
            key={chip.name}
            chip={chip}
            isEditing={editingChip === chip.name}
            editValues={editValues}
            onEditValuesChange={onEditValuesChange}
            onEdit={() => onEdit(chip)}
            onSave={() => onSave(chip.name)}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
}
