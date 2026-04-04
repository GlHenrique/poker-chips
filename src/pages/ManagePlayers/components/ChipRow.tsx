import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import type { Chip } from "../types";
import type { ChipEditValues } from "../types";
import { useTranslation } from "react-i18next";

type ChipRowProps = {
  chip: Chip;
  isEditing: boolean;
  editValues: ChipEditValues;
  onEditValuesChange: (values: Partial<ChipEditValues>) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ChipRow({
  chip,
  isEditing,
  editValues,
  onEditValuesChange,
  onEdit,
  onSave,
  onCancel,
}: ChipRowProps) {
  const { t } = useTranslation();
  const formatCurrency = useCurrencyFormatter();

  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted/20">
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 md:w-6 md:h-6 rounded-full border-2"
          style={{ backgroundColor: chip.color, borderColor: chip.borderColor }}
        />
        <span className="font-medium">{chip.name}</span>
      </div>
      <div className="flex items-center gap-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-2">
                <Label htmlFor={`name-${chip.name}`}>
                  {t("managePlayers.chipRow.name")}
                </Label>
                <Input
                  id={`name-${chip.name}`}
                  type="text"
                  value={editValues.name}
                  onChange={(e) => onEditValuesChange({ name: e.target.value })}
                  className="w-32 h-8 text-sm"
                  placeholder={t("managePlayers.chipRow.name")}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`value-${chip.name}`}>
                  {t("managePlayers.chipRow.value")}
                </Label>
                <Input
                  id={`value-${chip.name}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={editValues.value}
                  onChange={(e) =>
                    onEditValuesChange({ value: e.target.value })
                  }
                  className="w-24 h-8 text-sm"
                  placeholder={t("managePlayers.chipRow.value")}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`quantity-${chip.name}`}>
                  {t("managePlayers.chipRow.quantity")}
                </Label>
                <Input
                  id={`quantity-${chip.name}`}
                  type="number"
                  min="0"
                  value={editValues.quantity}
                  onChange={(e) =>
                    onEditValuesChange({ quantity: e.target.value })
                  }
                  className="w-24 h-8 text-sm"
                  placeholder={t("managePlayers.chipRow.quantity")}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`color-${chip.name}`}>
                  {t("managePlayers.chipRow.color")}
                </Label>
                <input
                  id={`color-${chip.name}`}
                  type="color"
                  value={editValues.color}
                  onChange={(e) =>
                    onEditValuesChange({ color: e.target.value })
                  }
                  className="h-8 w-10 rounded-md border border-border bg-transparent cursor-pointer"
                />
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onSave}
              className="h-8 w-8"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <>
            <div className="text-right">
              <div className="font-semibold">{formatCurrency(chip.value)}</div>
              <div className="text-sm text-muted-foreground">
                {chip.quantity} {t("managePlayers.chipRow.units")}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
