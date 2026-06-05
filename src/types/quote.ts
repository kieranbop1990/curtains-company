export type QuoteStatus = 'NEW' | 'ACTIVE' | 'WON' | 'LOST';

export interface QuoteChaseEntry {
  id: string;
  chaseDate: string;
  chasedBy: string;
  method: string;
  outcome: string;
  nextActionDate: string | null;
}

export const ENQUIRY_SOURCES = [
  'REFERRAL',
  'WEBSITE',
  'COLD_CALL',
  'REPEAT_CUSTOMER',
  'TRADE_SHOW',
  'XERO_IMPORT',
  'OTHER',
] as const;
export type EnquirySource = typeof ENQUIRY_SOURCES[number];

export interface Quote {
  id: string;
  quoteRef: string;
  status: QuoteStatus;
  enquirySource: EnquirySource | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  siteAddress: string;
  siteType: string;
  supplyType: string;
  productType: string;
  widthMm: number | null;
  heightMm: number | null;
  nextAction: string;
  nextActionDate: string | null;
  assigneeId: string;
  assigneeName: string;
  probabilityScore: number | null;
  orderValue: number | null;
  notes: string;
  chaseEntries: QuoteChaseEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteListResponse {
  quotes: Quote[];
  kpis: {
    total: number;
    totalValue: number;
    avgValue: number;
  };
}
