import { useContext } from 'react';

import type { AuthContextType } from 'src/contexts/auth/oidc-context';
import { AuthContext } from 'src/contexts/auth/oidc-context';

export const useAuth = <T = AuthContextType>() => useContext(AuthContext) as T;
