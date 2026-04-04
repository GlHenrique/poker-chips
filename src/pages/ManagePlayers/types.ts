export type Chip = {
  name: string;
  nameKey?: string;
  value: number;
  quantity: number;
  color: string;
  borderColor: string;
};

export type ChipDistribution = {
  chipName: string;
  chipValue: number;
  chipColor: string;
  chipBorderColor: string;
  amount: number;
};

export type PlayerDistribution = {
  playerNumber: number;
  totalValue: number;
  chips: ChipDistribution[];
};

export type ChipEditValues = {
  name: string;
  value: string;
  quantity: string;
  color: string;
};
