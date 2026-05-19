export type OrderStatus =
  | 'PENDING'
  | 'PRODUCTION_SPECIFICATION'
  | 'PRODUCTION_READY'
  | 'BOOKING'
  | 'INSTALLATION'
  | 'INVOICE';

export interface OrderPending {
  purchaseOrder: boolean;
  survey: boolean;
  drawings: boolean;
  drawingsApproved: boolean;
  depositPaid: boolean;
  completed: boolean;
  orderPlaced: boolean;
  shippingDetails: boolean;
  invoices: boolean;
  quotationDetails: boolean;
}

export interface Extras {
  productName: string;
  quantity: number;
}

export interface OrderSpecificationExtras {
  headboxSizeWidth: number;
  headboxSizeHeight: number;
  colour: string;
  motorSide: string;
  smokeSeals: boolean;
}

export interface OrderInformation {
  id: string;
  orderId: string;
  itemName: string;
  reference: string;
  itemQuantity: number;
  width: number;
  drop: number;
  cost: number;
  production: boolean;
  extras: Extras[];
  productionSpecification: OrderSpecificationExtras | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customer: string;
  orderDate: string;
  quotationNo: string;
  projectName: string;
  projectReference: string;
  siteContactManager: string;
  siteContactSupervisor: string;
  status: OrderStatus;
  orderValue: number;
  siteAddress: string;
  lastUpdatedBy: string;
  sfclTerms: string;
  sfclCreditScore: string;
  sfclRecommended: string;
  sfclInsured: boolean;
  supply: string;
  customerCollection: boolean;
  deliveryCharge: string;
  estimatedCollectionDelivery: string;
  estimateProjectCompletion: string;
  sfclDelivered: string;
  siteContactManagerNumber: string;
  siteContactSupervisorNumber: string;
  siteWorkingHours: string;
  pending: OrderPending;
  items: OrderInformation[];
  createdAt: string;
  updatedAt: string;
}
