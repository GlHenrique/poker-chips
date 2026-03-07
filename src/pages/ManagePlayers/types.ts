export interface Chip {
  name: string;
  value: number;
  quantity: number;
  color: string;
  borderColor: string;
}

export interface ChipDistribution {
  chipName: string;
  chipValue: number;
  chipColor: string;
  chipBorderColor: string;
  amount: number;
}

export interface PlayerDistribution {
  playerNumber: number;
  totalValue: number;
  chips: ChipDistribution[];
}

export interface ChipEditValues {
  name: string;
  value: string;
  quantity: string;
  color: string;
}
