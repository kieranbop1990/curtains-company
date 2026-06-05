export type SystemFamily = 'NECO_DC80' | 'CSV';
export type DistributionType = 'COLLECTION' | 'DELIVERY' | 'INSTALLATION';

export interface CuttingListItem {
  component: string;
  dimension: string;
}

export interface ProductionSystem {
  id: string;
  packId: string;
  systemIndex: number;
  family: SystemFamily | null;
  variant: string | null;
  widthMm: number | null;
  heightMm: number | null;
  customerSupplied: boolean;
  addManual: boolean;
  addWarrantyCard: boolean;
  notes: string | null;
  cuttingList: CuttingListItem[] | null;
  accessories: AccessoryItem[] | null;
  qrCodeUrl: string | null;
  barrelType: string | null;
  installationType: string | null;
  fabricAccommodation: string | null;
  bottomRail: string | null;
  motorPosition: string | null;
  installationSide: string | null;
  firingRating: string | null;
  loadingPlate: boolean;
  droppingHeightBar: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccessoryItem {
  name: string;
  quantity: number;
  price: number | null;
}

export interface ProductionPack {
  id: string;
  packRef: string;
  liveProjectId: string | null;
  liveServiceId: string | null;
  status: string;
  distributionType: DistributionType | null;
  sentToStage5At: string | null;
  systems: ProductionSystem[];
  createdAt: string;
  updatedAt: string;
}

export type MfgStatus = 'BOOKING_PRODUCTION' | 'AWAITING_SMOKE_ALARMS' | 'FABRICATION' | 'ASSEMBLY' | 'QC' | 'DISPATCH';
export type MfgSource = 'LG' | 'LS';
export type ComponentStatus = 'AWAITING_STOCK_OUT' | 'IN_PRODUCTION' | 'AWAITING_QC' | 'READY_TO_RELEASE' | 'MADE_FOR_REUSE';

export interface MfgComponent {
  id: string;
  jobId: string;
  name: string;
  status: ComponentStatus;
  category: string | null;
  requiredByDate: string | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface MfgFabricRow {
  id: string;
  jobId: string;
  systemRef: string | null;
  widthMm: number | null;
  dropMm: number | null;
  material: string | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface MfgQcCheckpoint {
  id: string;
  jobId: string;
  label: string;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ManufacturingJob {
  id: string;
  mfgRef: string;
  source: MfgSource;
  status: MfgStatus;
  packId: string | null;
  liveProjectId: string | null;
  liveServiceId: string | null;
  customerName: string | null;
  siteName: string | null;
  description: string | null;
  priority: string | null;
  requiredByDate: string | null;
  engineerName: string | null;
  specNotes: string | null;
  specRequiredBy: string | null;
  specPriority: string | null;
  approvedBy: string | null;
  authorisedBy: string | null;
  allComponentsDone: boolean;
  qcFormsUploaded: boolean;
  stampChecked: boolean;
  productionDocsDone: boolean;
  components: MfgComponent[];
  fabricRows: MfgFabricRow[];
  qcCheckpoints: MfgQcCheckpoint[];
  createdAt: string;
  updatedAt: string;
}
