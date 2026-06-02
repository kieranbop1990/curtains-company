import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from 'src/hooks/use-auth';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: FC<AuthGuardProps> = (props) => {
  const { children } = props;
  const { isAuthenticated, signIn } = useAuth();
  const skipAuth = import.meta.env.VITE_AUTH_SKIP === 'true';
  const [checked, setChecked] = useState<boolean>(skipAuth);

  const check = useCallback(() => {
    if (!isAuthenticated) {
      signIn();
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, signIn]);

  useEffect(() => {
    if (!skipAuth) {
      check();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};
