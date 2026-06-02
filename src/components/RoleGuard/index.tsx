import type { ReactNode } from 'react';
import { useContext } from 'react';
import { AuthContext } from 'src/contexts/auth/oidc-context';
import NotAuthorisedPage from 'src/pages/not-authorised';

export type AppRole =
  | 'ADMIN'
  | 'OFFICE_OPERATIONS'
  | 'ENGINEER_FIELD'
  | 'FINANCE_ACCOUNTS'
  | 'PRODUCTION'
  | 'CUSTOMER';

interface RoleGuardProps {
  allowedRoles: AppRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user } = useContext(AuthContext);
  const role = (user as { role?: AppRole } | null)?.role;

  if (!role || !allowedRoles.includes(role)) {
    return fallback ? <>{fallback}</> : <NotAuthorisedPage />;
  }

  return <>{children}</>;
}

export function useUserRole(): AppRole | undefined {
  const { user } = useContext(AuthContext);
  return (user as { role?: AppRole } | null)?.role;
}
