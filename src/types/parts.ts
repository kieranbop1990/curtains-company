export interface Part {
  id: string;
  partRef: string;
  name: string;
  category: string;
  description?: string;
  unitCost?: number;
  unit?: string;
  supplier?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const PART_CATEGORIES = [
  'Motor',
  'Control Panel',
  'MCC',
  'Drive',
  'Battery',
  'Fabric',
  'Accessory',
  'Hardware',
  'Other',
] as const;

export type PartCategory = typeof PART_CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Motor: 'blue',
  'Control Panel': 'violet',
  MCC: 'grape',
  Drive: 'indigo',
  Battery: 'yellow',
  Fabric: 'teal',
  Accessory: 'cyan',
  Hardware: 'gray',
  Other: 'dark',
};
