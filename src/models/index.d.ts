import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection, AsyncItem } from "@aws-amplify/datastore";

export enum Status {
  PENDING = "PENDING",
  PRODUCTION_READY = "PRODUCTION_READY",
  BOOKING = "BOOKING",
  INSTALLATION = "INSTALLATION",
  INVOICE = "INVOICE",
  PRODUCTION_SPECIFICATION = "PRODUCTION_SPECIFICATION"
}



type EagerPending = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Pending, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly purchaseOrder?: boolean | null;
  readonly survey?: boolean | null;
  readonly drawingsApproved?: boolean | null;
  readonly drawings?: boolean | null;
  readonly completed?: boolean | null;
  readonly depositPaid?: boolean | null;
  readonly orderPlaced?: boolean | null;
  readonly shippingDetails?: boolean | null;
  readonly invoices?: boolean | null;
  readonly quotationDetails?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPending = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Pending, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly purchaseOrder?: boolean | null;
  readonly survey?: boolean | null;
  readonly drawingsApproved?: boolean | null;
  readonly drawings?: boolean | null;
  readonly completed?: boolean | null;
  readonly depositPaid?: boolean | null;
  readonly orderPlaced?: boolean | null;
  readonly shippingDetails?: boolean | null;
  readonly invoices?: boolean | null;
  readonly quotationDetails?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Pending = LazyLoading extends LazyLoadingDisabled ? EagerPending : LazyPending

export declare const Pending: (new (init: ModelInit<Pending>) => Pending) & {
  copyOf(source: Pending, mutator: (draft: MutableModel<Pending>) => MutableModel<Pending> | void): Pending;
}

type EagerOrderInf = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<OrderInf, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly itemName?: string | null;
  readonly itemQuantity?: number | null;
  readonly width?: number | null;
  readonly drop?: number | null;
  readonly cost?: number | null;
  readonly ordersID: string;
  readonly reference?: string | null;
  readonly production?: boolean | null;
  readonly extras?: (string | null)[] | null;
  readonly productionSpecification?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyOrderInf = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<OrderInf, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly itemName?: string | null;
  readonly itemQuantity?: number | null;
  readonly width?: number | null;
  readonly drop?: number | null;
  readonly cost?: number | null;
  readonly ordersID: string;
  readonly reference?: string | null;
  readonly production?: boolean | null;
  readonly extras?: (string | null)[] | null;
  readonly productionSpecification?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type OrderInf = LazyLoading extends LazyLoadingDisabled ? EagerOrderInf : LazyOrderInf

export declare const OrderInf: (new (init: ModelInit<OrderInf>) => OrderInf) & {
  copyOf(source: OrderInf, mutator: (draft: MutableModel<OrderInf>) => MutableModel<OrderInf> | void): OrderInf;
}

type EagerOrders = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Orders, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly orderDate?: string | null;
  readonly quotationNo?: string | null;
  readonly projectName?: string | null;
  readonly projectReference?: string | null;
  readonly siteContactManager?: string | null;
  readonly siteContactSupervisor?: string | null;
  readonly status?: Status | keyof typeof Status | null;
  readonly orderValue?: number | null;
  readonly siteAddress?: string | null;
  readonly customersID: string;
  readonly OrderInfs?: (OrderInf | null)[] | null;
  readonly lastUpdatedBy: string;
  readonly Pending?: Pending | null;
  readonly sfclTerms?: string | null;
  readonly sfclCreditScore?: string | null;
  readonly sfclRecommended?: string | null;
  readonly sfclInsured?: boolean | null;
  readonly supply?: string | null;
  readonly customerCollection?: boolean | null;
  readonly deliveryCharge?: string | null;
  readonly estimatedCollectionDelivery?: string | null;
  readonly estimateProjectCompletion?: string | null;
  readonly sfclDelivered?: string | null;
  readonly siteContactManagerNumber?: string | null;
  readonly siteContactSupervisorNumber?: string | null;
  readonly siteWorkingHours?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly ordersPendingId?: string | null;
}

type LazyOrders = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Orders, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly orderDate?: string | null;
  readonly quotationNo?: string | null;
  readonly projectName?: string | null;
  readonly projectReference?: string | null;
  readonly siteContactManager?: string | null;
  readonly siteContactSupervisor?: string | null;
  readonly status?: Status | keyof typeof Status | null;
  readonly orderValue?: number | null;
  readonly siteAddress?: string | null;
  readonly customersID: string;
  readonly OrderInfs: AsyncCollection<OrderInf>;
  readonly lastUpdatedBy: string;
  readonly Pending: AsyncItem<Pending | undefined>;
  readonly sfclTerms?: string | null;
  readonly sfclCreditScore?: string | null;
  readonly sfclRecommended?: string | null;
  readonly sfclInsured?: boolean | null;
  readonly supply?: string | null;
  readonly customerCollection?: boolean | null;
  readonly deliveryCharge?: string | null;
  readonly estimatedCollectionDelivery?: string | null;
  readonly estimateProjectCompletion?: string | null;
  readonly sfclDelivered?: string | null;
  readonly siteContactManagerNumber?: string | null;
  readonly siteContactSupervisorNumber?: string | null;
  readonly siteWorkingHours?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly ordersPendingId?: string | null;
}

export declare type Orders = LazyLoading extends LazyLoadingDisabled ? EagerOrders : LazyOrders

export declare const Orders: (new (init: ModelInit<Orders>) => Orders) & {
  copyOf(source: Orders, mutator: (draft: MutableModel<Orders>) => MutableModel<Orders> | void): Orders;
}

type EagerCustomers = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Customers, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly customer: string;
  readonly businessName?: string | null;
  readonly email?: string | null;
  readonly contactNum?: string | null;
  readonly accountsContact?: string | null;
  readonly regNumber?: string | null;
  readonly trustedPayer?: boolean | null;
  readonly creditLimit?: number | null;
  readonly Orders?: (Orders | null)[] | null;
  readonly billingAddress?: string | null;
  readonly accountsEmail?: string | null;
  readonly vatNumber?: string | null;
  readonly taxReference?: string | null;
  readonly vatExempt?: boolean | null;
  readonly vatReverse?: boolean | null;
  readonly cisDeductions?: boolean | null;
  readonly cisName?: string | null;
  readonly cisRate?: string | null;
  readonly cisOrgType?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCustomers = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Customers, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly customer: string;
  readonly businessName?: string | null;
  readonly email?: string | null;
  readonly contactNum?: string | null;
  readonly accountsContact?: string | null;
  readonly regNumber?: string | null;
  readonly trustedPayer?: boolean | null;
  readonly creditLimit?: number | null;
  readonly Orders: AsyncCollection<Orders>;
  readonly billingAddress?: string | null;
  readonly accountsEmail?: string | null;
  readonly vatNumber?: string | null;
  readonly taxReference?: string | null;
  readonly vatExempt?: boolean | null;
  readonly vatReverse?: boolean | null;
  readonly cisDeductions?: boolean | null;
  readonly cisName?: string | null;
  readonly cisRate?: string | null;
  readonly cisOrgType?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Customers = LazyLoading extends LazyLoadingDisabled ? EagerCustomers : LazyCustomers

export declare const Customers: (new (init: ModelInit<Customers>) => Customers) & {
  copyOf(source: Customers, mutator: (draft: MutableModel<Customers>) => MutableModel<Customers> | void): Customers;
}