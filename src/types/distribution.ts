export type DistributionType = 'COLLECTION' | 'DELIVERY' | 'INSTALLATION';
export type PaymentMilestoneStatus = 'PENDING' | 'PAID';

export interface InstallationEngineer {
  id: string;
  djId: string;
  engineerName: string;
  engineerId: string | null;
  signOnTime: string | null;
  overnight: boolean;
  miles: number | null;
  travelCost: number | null;
  nightRate: number | null;
  offSpecRate: number | null;
  hotelCost: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMilestone {
  id: string;
  djId: string;
  name: string;
  amount: number | null;
  triggerEvent: string | null;
  status: PaymentMilestoneStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InstallationProgressStep {
  id: string;
  djId: string;
  stepName: string;
  stepDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DistributionDocument {
  id: string;
  djId: string;
  docType: string;
  fileName: string;
  s3Key: string | null;
  uploadedAt: string;
}

export interface DistributionJob {
  id: string;
  djRef: string;
  distributionType: DistributionType;
  mfgJobId: string | null;
  liveProjectId: string | null;
  liveServiceId: string | null;
  customerName: string | null;
  siteName: string | null;

  // 6A
  accountsReleaseApproved: boolean;
  accountsReleaseApprovedBy: string | null;
  packMccCert: boolean;
  packCurtainScope: boolean;
  packFiringLicence: boolean;
  packLabelsId: boolean;
  packControllersManual: boolean;
  packWarrantyCert: boolean;
  collectionSignature: string | null;
  collectedAt: string | null;
  collectionRep: string | null;
  pocGenerated: boolean;

  // 6B
  despatchDate: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  palletBoxCount: number | null;
  trackingLink: string | null;
  despatchNotes: string | null;
  deliveryMccCert: boolean;
  deliveryCurtainScope: boolean;
  deliveryFiringLicence: boolean;
  deliveryLabelsId: boolean;
  deliveryControllersManual: boolean;
  deliveryWarrantyCert: boolean;
  deliverySignature: string | null;
  deliverySignedOffAt: string | null;
  podGenerated: boolean;
  courierName: string | null;
  driverName: string | null;

  // 6C
  ramsUploaded: boolean;
  ramsReviewed: boolean;
  dateIn: string | null;
  daysOnSite: number | null;
  estimatedCompletion: string | null;
  extendedFlag: boolean;
  returnVisit: boolean;
  ramsFiledChecked: boolean;
  teamSignedOffChecked: boolean;
  customerSignoffUploaded: boolean;
  handoverPackIssued: boolean;
  returnVisitResolved: boolean;
  commissionDate: string | null;
  awaitingInvoice: boolean;
  certificatesReleased: boolean;
  certificateReleasedBy: string | null;
  djStatus: string;

  engineers: InstallationEngineer[];
  milestones: PaymentMilestone[];
  progressSteps: InstallationProgressStep[];
  documents: DistributionDocument[];
  createdAt: string;
  updatedAt: string;
}
