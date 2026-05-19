import type { UserRole } from '../middleware/auth.js';

// Roles that can access each permission category
export const PERMISSIONS = {
  // Full CRM access
  fullCrm: ['ADMIN', 'OFFICE_OPERATIONS'] as UserRole[],

  // Financial panels (read)
  financialRead: ['ADMIN', 'OFFICE_OPERATIONS', 'FINANCE_ACCOUNTS'] as UserRole[],

  // Financial actions (approve release, mark paid, block delivery)
  financialAction: ['ADMIN', 'FINANCE_ACCOUNTS'] as UserRole[],

  // Production and QC
  production: ['ADMIN', 'PRODUCTION'] as UserRole[],

  // Field engineer (own jobs only — enforced additionally via job ownership filter)
  fieldEngineer: ['ADMIN', 'ENGINEER_FIELD'] as UserRole[],

  // Customer sign-off + released docs only
  customerSignOff: ['ADMIN', 'CUSTOMER'] as UserRole[],

  // Admin only
  adminOnly: ['ADMIN'] as UserRole[],

  // Formula template edits — Admin + PIN required
  formulaEdit: ['ADMIN'] as UserRole[],

  // Audit log visibility
  auditLog: ['ADMIN', 'OFFICE_OPERATIONS'] as UserRole[],
} as const;

// Fields that Engineer role must NEVER see
export const ENGINEER_EXCLUDED_FIELDS = [
  'quoteValue',
  'orderValue',
  'profit',
  'margin',
  'internalNotes',
  'accountNotes',
  'creditScore',
  'vatNumber',
  'cisRate',
];

export function stripEngineerFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out = { ...obj };
  for (const f of ENGINEER_EXCLUDED_FIELDS) {
    delete out[f];
  }
  return out;
}
