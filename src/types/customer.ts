export type Customer = {
  id: string;
  customer: string;
  businessName: string;
  email: string;
  contactNum: string;
  accountsContact: string;
  regNumber: string;
  trustedPayer: boolean;
  creditLimit: number;
  billingAddress: string;
  accountsEmail: string;
  vatNumber: string;
  taxReference: string;
  vatExempt: boolean;
  vatReverse: boolean;
  cisDeductions: boolean;
  cisName: string;
  cisRate: string;
  cisOrgType: string;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  totalSpent: number;
};

export interface CustomerLog {
  id: string;
  createdAt: number;
  description: string;
  ip: string;
  method: string;
  route: string;
  status: number;
}

export interface CustomerEmail {
  id: string;
  description: string;
  createdAt: number;
}

export interface CustomerInvoice {
  id: string;
  issueDate: number;
  status: string;
  amount: number;
}
