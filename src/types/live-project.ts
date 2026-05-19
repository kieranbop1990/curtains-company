export type LQStage = 'LQ' | 'SD';
export type LQRoutingDecision = 'PRODUCTION_PACK' | 'LIVE_SERVICES';
export type DrawingStatus = 'ISSUED' | 'APPROVED' | 'REJECTED';
export type ReviewStatus = 'NOT_STARTED' | 'IN_REVIEW' | 'CUSTOMER_APPROVED' | 'CUSTOMER_REJECTED';
export type InvoiceStatus = 'PENDING' | 'PAID';

export interface LQInvoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  amount: number;
  dueDate: string | null;
  xeroInvoiceId: string | null;
}

export interface LQDrawing {
  id: string;
  drawingNumber: string;
  description: string;
  status: DrawingStatus;
}

export interface LQInstallationItem {
  id: string;
  systemName: string;
  installationDate: string | null;
  commissionDate: string | null;
  amount: number | null;
  paid: boolean;
}

export interface LQComponent {
  id: string;
  componentName: string;
  qty: number;
  stockStatus: string;
  cost: number | null;
}

export interface LiveProject {
  id: string;
  lqRef: string;
  stage: LQStage;
  sourceQuoteId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  siteAddress: string;
  siteType: string;
  supplyType: string;
  productType: string;
  widthMm: number | null;
  heightMm: number | null;
  totalContractValue: number | null;
  paidToDate: number | null;
  vatAmount: number | null;
  paymentTerms: string;
  surveyDate: string | null;
  drawingsDue: string | null;
  drawingsApprovedDate: string | null;
  installationBooked: string | null;
  expectedCompletion: string | null;
  poReceived: boolean;
  drawingsReceived: boolean;
  depositPaid: boolean;
  surveyBooked: boolean;
  contractApproved: boolean;
  signatureData: string | null;
  surveyCompletionDate: string | null;
  surveyStatus: string;
  surveyorName: string;
  surveyMethod: string;
  surveyAccessType: string;
  surveySignedOff: boolean;
  reviewApprovalDate: string | null;
  reviewComments: string;
  reviewStatus: ReviewStatus;
  routingDecision: LQRoutingDecision | null;
  assigneeId: string;
  assigneeName: string;
  invoices: LQInvoice[];
  drawings: LQDrawing[];
  installationSchedule: LQInstallationItem[];
  components: LQComponent[];
  createdAt: string;
  updatedAt: string;
}
