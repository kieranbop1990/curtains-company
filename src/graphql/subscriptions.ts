/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreatePending = /* GraphQL */ `
  subscription OnCreatePending($filter: ModelSubscriptionPendingFilterInput) {
    onCreatePending(filter: $filter) {
      id
      purchaseOrder
      survey
      drawingsApproved
      drawings
      completed
      depositPaid
      orderPlaced
      shippingDetails
      invoices
      quotationDetails
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdatePending = /* GraphQL */ `
  subscription OnUpdatePending($filter: ModelSubscriptionPendingFilterInput) {
    onUpdatePending(filter: $filter) {
      id
      purchaseOrder
      survey
      drawingsApproved
      drawings
      completed
      depositPaid
      orderPlaced
      shippingDetails
      invoices
      quotationDetails
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeletePending = /* GraphQL */ `
  subscription OnDeletePending($filter: ModelSubscriptionPendingFilterInput) {
    onDeletePending(filter: $filter) {
      id
      purchaseOrder
      survey
      drawingsApproved
      drawings
      completed
      depositPaid
      orderPlaced
      shippingDetails
      invoices
      quotationDetails
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateOrderInf = /* GraphQL */ `
  subscription OnCreateOrderInf($filter: ModelSubscriptionOrderInfFilterInput) {
    onCreateOrderInf(filter: $filter) {
      id
      itemName
      itemQuantity
      width
      drop
      cost
      ordersID
      reference
      production
      extras
      productionSpecification
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateOrderInf = /* GraphQL */ `
  subscription OnUpdateOrderInf($filter: ModelSubscriptionOrderInfFilterInput) {
    onUpdateOrderInf(filter: $filter) {
      id
      itemName
      itemQuantity
      width
      drop
      cost
      ordersID
      reference
      production
      extras
      productionSpecification
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteOrderInf = /* GraphQL */ `
  subscription OnDeleteOrderInf($filter: ModelSubscriptionOrderInfFilterInput) {
    onDeleteOrderInf(filter: $filter) {
      id
      itemName
      itemQuantity
      width
      drop
      cost
      ordersID
      reference
      production
      extras
      productionSpecification
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onCreateOrders = /* GraphQL */ `
  subscription OnCreateOrders($filter: ModelSubscriptionOrdersFilterInput) {
    onCreateOrders(filter: $filter) {
      id
      orderDate
      quotationNo
      projectName
      projectReference
      siteContactManager
      siteContactSupervisor
      status
      orderValue
      siteAddress
      customersID
      OrderInfs {
        nextToken
        startedAt
      }
      lastUpdatedBy
      Pending {
        id
        purchaseOrder
        survey
        drawingsApproved
        drawings
        completed
        depositPaid
        orderPlaced
        shippingDetails
        invoices
        quotationDetails
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      sfclTerms
      sfclCreditScore
      sfclRecommended
      sfclInsured
      supply
      customerCollection
      deliveryCharge
      estimatedCollectionDelivery
      estimateProjectCompletion
      sfclDelivered
      siteContactManagerNumber
      siteContactSupervisorNumber
      siteWorkingHours
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      ordersPendingId
    }
  }
`;
export const onUpdateOrders = /* GraphQL */ `
  subscription OnUpdateOrders($filter: ModelSubscriptionOrdersFilterInput) {
    onUpdateOrders(filter: $filter) {
      id
      orderDate
      quotationNo
      projectName
      projectReference
      siteContactManager
      siteContactSupervisor
      status
      orderValue
      siteAddress
      customersID
      OrderInfs {
        nextToken
        startedAt
      }
      lastUpdatedBy
      Pending {
        id
        purchaseOrder
        survey
        drawingsApproved
        drawings
        completed
        depositPaid
        orderPlaced
        shippingDetails
        invoices
        quotationDetails
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      sfclTerms
      sfclCreditScore
      sfclRecommended
      sfclInsured
      supply
      customerCollection
      deliveryCharge
      estimatedCollectionDelivery
      estimateProjectCompletion
      sfclDelivered
      siteContactManagerNumber
      siteContactSupervisorNumber
      siteWorkingHours
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      ordersPendingId
    }
  }
`;
export const onDeleteOrders = /* GraphQL */ `
  subscription OnDeleteOrders($filter: ModelSubscriptionOrdersFilterInput) {
    onDeleteOrders(filter: $filter) {
      id
      orderDate
      quotationNo
      projectName
      projectReference
      siteContactManager
      siteContactSupervisor
      status
      orderValue
      siteAddress
      customersID
      OrderInfs {
        nextToken
        startedAt
      }
      lastUpdatedBy
      Pending {
        id
        purchaseOrder
        survey
        drawingsApproved
        drawings
        completed
        depositPaid
        orderPlaced
        shippingDetails
        invoices
        quotationDetails
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
      }
      sfclTerms
      sfclCreditScore
      sfclRecommended
      sfclInsured
      supply
      customerCollection
      deliveryCharge
      estimatedCollectionDelivery
      estimateProjectCompletion
      sfclDelivered
      siteContactManagerNumber
      siteContactSupervisorNumber
      siteWorkingHours
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      ordersPendingId
    }
  }
`;
export const onCreateCustomers = /* GraphQL */ `
  subscription OnCreateCustomers(
    $filter: ModelSubscriptionCustomersFilterInput
  ) {
    onCreateCustomers(filter: $filter) {
      id
      customer
      businessName
      email
      contactNum
      accountsContact
      regNumber
      trustedPayer
      creditLimit
      Orders {
        nextToken
        startedAt
      }
      billingAddress
      accountsEmail
      vatNumber
      taxReference
      vatExempt
      vatReverse
      cisDeductions
      cisName
      cisRate
      cisOrgType
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdateCustomers = /* GraphQL */ `
  subscription OnUpdateCustomers(
    $filter: ModelSubscriptionCustomersFilterInput
  ) {
    onUpdateCustomers(filter: $filter) {
      id
      customer
      businessName
      email
      contactNum
      accountsContact
      regNumber
      trustedPayer
      creditLimit
      Orders {
        nextToken
        startedAt
      }
      billingAddress
      accountsEmail
      vatNumber
      taxReference
      vatExempt
      vatReverse
      cisDeductions
      cisName
      cisRate
      cisOrgType
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeleteCustomers = /* GraphQL */ `
  subscription OnDeleteCustomers(
    $filter: ModelSubscriptionCustomersFilterInput
  ) {
    onDeleteCustomers(filter: $filter) {
      id
      customer
      businessName
      email
      contactNum
      accountsContact
      regNumber
      trustedPayer
      creditLimit
      Orders {
        nextToken
        startedAt
      }
      billingAddress
      accountsEmail
      vatNumber
      taxReference
      vatExempt
      vatReverse
      cisDeductions
      cisName
      cisRate
      cisOrgType
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
