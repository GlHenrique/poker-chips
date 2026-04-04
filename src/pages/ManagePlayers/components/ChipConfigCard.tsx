import { Button } from "@/components/ui/button";
import { ChipRow } from "./ChipRow";
import type { Chip } from "../types";
import type { ChipEditValues } from "../types";
import { useTranslation } from "react-i18next";

const chipKey = (chip: Chip) => chip.nameKey ?? chip.name;

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
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          {t("managePlayers.chipConfig.title")}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="text-xs"
        >
          {t("managePlayers.chipConfig.restoreDefault")}
        </Button>
      </div>
      <div className="space-y-3">
        {chips.map((chip) => (
          <ChipRow
            key={chipKey(chip)}
            chip={chip}
            isEditing={editingChip === chipKey(chip)}
            editValues={editValues}
            onEditValuesChange={onEditValuesChange}
            onEdit={() => onEdit(chip)}
            onSave={() => onSave(chipKey(chip))}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
}
