import { Badge } from '@mantine/core';
import { useUserRole, type AppRole } from 'src/components/RoleGuard';

const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: 'Admin',
  OFFICE_OPERATIONS: 'Office',
  ENGINEER_FIELD: 'Engineer',
  FINANCE_ACCOUNTS: 'Finance',
  PRODUCTION: 'Production',
  CUSTOMER: 'Customer',
};

const ROLE_COLORS: Record<AppRole, string> = {
  ADMIN: 'red',
  OFFICE_OPERATIONS: 'blue',
  ENGINEER_FIELD: 'green',
  FINANCE_ACCOUNTS: 'violet',
  PRODUCTION: 'orange',
  CUSTOMER: 'gray',
};

export function RoleBadge() {
  const role = useUserRole();
  if (!role) return null;

  return (
    <Badge color={ROLE_COLORS[role]} variant="light" size="sm" radius="sm">
      {ROLE_LABELS[role]}
    </Badge>
  );
}
