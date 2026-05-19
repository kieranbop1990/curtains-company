import { apiClient } from '../client';
import type { Customer } from 'src/types/customer';
import { customersApi } from './index';

export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    return await apiClient.get<Customer[]>('/api/customers');
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const updateCustomer = async (customer: Customer, values: any): Promise<string> => {
  try {
    await apiClient.put(`/api/customers/${customer.id}`, {
      customer: values.customer || customer.customer,
      businessName: values.businessName || customer.businessName,
      email: values.email || customer.email,
      contactNum: values.contactNum || customer.contactNum,
      accountsContact: values.accountsContact || customer.accountsContact,
      regNumber: values.regNumber || customer.regNumber,
      trustedPayer: values.trustedPayer ?? customer.trustedPayer,
      creditLimit: values.creditLimit ?? customer.creditLimit,
      billingAddress: values.billingAddress || customer.billingAddress,
      accountsEmail: values.accountsEmail || customer.accountsEmail,
      vatNumber: values.vatNumber || customer.vatNumber,
      taxReference: values.taxReference || customer.taxReference,
      vatExempt: values.vatExempt ?? customer.vatExempt,
      vatReverse: values.vatReverse ?? customer.vatReverse,
      cisDeductions: values.cisDeductions ?? customer.cisDeductions,
      cisName: values.cisName || customer.cisName,
      cisRate: values.cisRate || customer.cisRate,
      cisOrgType: values.cisOrgType || customer.cisOrgType,
    });

    customersApi.refresh();
    return 'Customer updated';
  } catch (error) {
    console.error('Failed to update:', error);
    return 'Failed to update customer';
  }
};

export const createCustomer = async (values: any): Promise<string> => {
  try {
    await apiClient.post('/api/customers', {
      customer: values.customer,
      businessName: values.businessName,
      email: values.email,
      contactNum: values.contactNum,
      accountsContact: values.accountsContact,
      regNumber: values.regNumber,
      trustedPayer: values.trustedPayer,
      creditLimit: values.creditLimit,
      billingAddress: values.billingAddress,
      accountsEmail: values.accountsEmail,
      vatNumber: values.vatNumber,
      taxReference: values.taxReference,
      vatExempt: values.vatExempt,
      vatReverse: values.vatReverse,
      cisDeductions: values.cisDeductions,
      cisName: values.cisName,
      cisRate: values.cisRate,
      cisOrgType: values.cisOrgType,
    });

    customersApi.refresh();
    return 'Customer created';
  } catch (error) {
    console.error('Failed to create:', error);
    return 'Failed to create customer';
  }
};
