/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createPending = /* GraphQL */ `
  mutation CreatePending(
    $input: CreatePendingInput!
    $condition: ModelPendingConditionInput
  ) {
    createPending(input: $input, condition: $condition) {
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
export const updatePending = /* GraphQL */ `
  mutation UpdatePending(
    $input: UpdatePendingInput!
    $condition: ModelPendingConditionInput
  ) {
    updatePending(input: $input, condition: $condition) {
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
export const deletePending = /* GraphQL */ `
  mutation DeletePending(
    $input: DeletePendingInput!
    $condition: ModelPendingConditionInput
  ) {
    deletePending(input: $input, condition: $condition) {
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
export const createOrderInf = /* GraphQL */ `
  mutation CreateOrderInf(
    $input: CreateOrderInfInput!
    $condition: ModelOrderInfConditionInput
  ) {
    createOrderInf(input: $input, condition: $condition) {
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
export const updateOrderInf = /* GraphQL */ `
  mutation UpdateOrderInf(
    $input: UpdateOrderInfInput!
    $condition: ModelOrderInfConditionInput
  ) {
    updateOrderInf(input: $input, condition: $condition) {
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
export const deleteOrderInf = /* GraphQL */ `
  mutation DeleteOrderInf(
    $input: DeleteOrderInfInput!
    $condition: ModelOrderInfConditionInput
  ) {
    deleteOrderInf(input: $input, condition: $condition) {
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
export const createOrders = /* GraphQL */ `
  mutation CreateOrders(
    $input: CreateOrdersInput!
    $condition: ModelOrdersConditionInput
  ) {
    createOrders(input: $input, condition: $condition) {
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
export const updateOrders = /* GraphQL */ `
  mutation UpdateOrders(
    $input: UpdateOrdersInput!
    $condition: ModelOrdersConditionInput
  ) {
    updateOrders(input: $input, condition: $condition) {
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
export const deleteOrders = /* GraphQL */ `
  mutation DeleteOrders(
    $input: DeleteOrdersInput!
    $condition: ModelOrdersConditionInput
  ) {
    deleteOrders(input: $input, condition: $condition) {
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
export const createCustomers = /* GraphQL */ `
  mutation CreateCustomers(
    $input: CreateCustomersInput!
    $condition: ModelCustomersConditionInput
  ) {
    createCustomers(input: $input, condition: $condition) {
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
export const updateCustomers = /* GraphQL */ `
  mutation UpdateCustomers(
    $input: UpdateCustomersInput!
    $condition: ModelCustomersConditionInput
  ) {
    updateCustomers(input: $input, condition: $condition) {
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
export const deleteCustomers = /* GraphQL */ `
  mutation DeleteCustomers(
    $input: DeleteCustomersInput!
    $condition: ModelCustomersConditionInput
  ) {
    deleteCustomers(input: $input, condition: $condition) {
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
