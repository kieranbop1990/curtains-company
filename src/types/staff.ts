export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const STAFF_ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OFFICE_OPERATIONS', label: 'Office / Operations' },
  { value: 'ENGINEER_FIELD', label: 'Field Engineer' },
  { value: 'FINANCE_ACCOUNTS', label: 'Finance / Accounts' },
  { value: 'PRODUCTION', label: 'Production' },
] as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  OFFICE_OPERATIONS: 'Office / Operations',
  ENGINEER_FIELD: 'Field Engineer',
  FINANCE_ACCOUNTS: 'Finance / Accounts',
  PRODUCTION: 'Production',
};
