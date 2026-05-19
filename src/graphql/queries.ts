/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPending = /* GraphQL */ `
  query GetPending($id: ID!) {
    getPending(id: $id) {
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
export const listPendings = /* GraphQL */ `
  query ListPendings(
    $filter: ModelPendingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPendings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const syncPendings = /* GraphQL */ `
  query SyncPendings(
    $filter: ModelPendingFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncPendings(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const getOrderInf = /* GraphQL */ `
  query GetOrderInf($id: ID!) {
    getOrderInf(id: $id) {
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
export const listOrderInfs = /* GraphQL */ `
  query ListOrderInfs(
    $filter: ModelOrderInfFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrderInfs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const syncOrderInfs = /* GraphQL */ `
  query SyncOrderInfs(
    $filter: ModelOrderInfFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncOrderInfs(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const orderInfsByOrdersID = /* GraphQL */ `
  query OrderInfsByOrdersID(
    $ordersID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelOrderInfFilterInput
    $limit: Int
    $nextToken: String
  ) {
    orderInfsByOrdersID(
      ordersID: $ordersID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
    }
  }
`;
export const getOrders = /* GraphQL */ `
  query GetOrders($id: ID!) {
    getOrders(id: $id) {
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
export const listOrders = /* GraphQL */ `
  query ListOrders(
    $filter: ModelOrdersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrders(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        lastUpdatedBy
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
      nextToken
      startedAt
    }
  }
`;
export const syncOrders = /* GraphQL */ `
  query SyncOrders(
    $filter: ModelOrdersFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncOrders(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
        lastUpdatedBy
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
      nextToken
      startedAt
    }
  }
`;
export const ordersByCustomersID = /* GraphQL */ `
  query OrdersByCustomersID(
    $customersID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelOrdersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ordersByCustomersID(
      customersID: $customersID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        lastUpdatedBy
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
      nextToken
      startedAt
    }
  }
`;
export const getCustomers = /* GraphQL */ `
  query GetCustomers($id: ID!) {
    getCustomers(id: $id) {
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
export const listCustomers = /* GraphQL */ `
  query ListCustomers(
    $filter: ModelCustomersFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCustomers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        customer
        businessName
        email
        contactNum
        accountsContact
        regNumber
        trustedPayer
        creditLimit
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
      nextToken
      startedAt
    }
  }
`;
export const syncCustomers = /* GraphQL */ `
  query SyncCustomers(
    $filter: ModelCustomersFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncCustomers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        customer
        businessName
        email
        contactNum
        accountsContact
        regNumber
        trustedPayer
        creditLimit
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
      nextToken
      startedAt
    }
  }
`;
