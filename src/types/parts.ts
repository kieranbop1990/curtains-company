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
  'Panel',
  'MCC',
  'Drive',
  'Battery',
  'Sensor',
  'Fabric',
  'Accessory',
  'Hardware',
  'Bracket',
  'Label',
  'Documentation',
  'QC',
  'Other',
] as const;

export type PartCategory = typeof PART_CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Motor: 'blue',
  'Control Panel': 'violet',
  Panel: 'indigo',
  MCC: 'grape',
  Drive: 'cyan',
  Battery: 'yellow',
  Sensor: 'orange',
  Fabric: 'teal',
  Accessory: 'pink',
  Hardware: 'gray',
  Bracket: 'lime',
  Label: 'green',
  Documentation: 'red',
  QC: 'dark',
  Other: 'dark',
};
