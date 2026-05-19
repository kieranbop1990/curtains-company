export type AssetStatus = 'LIVE_ACTIVE' | 'OVERDUE' | 'SERVICE_DUE' | 'UNKNOWN';
export type AssetPriority = 'HOT' | 'HIGH' | 'NORMAL';

export interface AssetContact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface AssetServiceEvent {
  id: string;
  serviceDate: string;
  engineerName: string;
  company: string;
  summary: string;
  statusLabel: string;
}

export interface Asset {
  id: string;
  assetRef: string;
  status: AssetStatus;
  priority: AssetPriority;
  lqId: string | null;
  isExternalSource: boolean;
  customerName: string;
  siteName: string;
  siteAddress: string;
  systemType: string;
  firingRating: string;
  locationOnSite: string;
  headboxSize: string;
  motorType: string;
  controlPanelType: string;
  mccType: string;
  driveType: string;
  motorMake: string;
  serialNumber: string;
  manufactureDate: string | null;
  warrantyExpiry: string | null;
  fabricType: string;
  fabricColour: string;
  widthMm: number | null;
  heightMm: number | null;
  serviceFrequencyMonths: number | null;
  lastServiceDate: string | null;
  nextServiceDate: string | null;
  renewalAlertDate: string | null;
  accessRestrictions: boolean;
  permitsRequired: boolean;
  dchiRequired: boolean;
  securityClearance: boolean;
  loadingBay: boolean;
  laddersRequired: boolean;
  inductionRequired: boolean;
  lastQuoteDate: string | null;
  lastContactDate: string | null;
  nextCloseDate: string | null;
  contractValue: number | null;
  annualRevenue: number | null;
  contacts: AssetContact[];
  serviceEvents: AssetServiceEvent[];
  createdAt: string;
  updatedAt: string;
}
