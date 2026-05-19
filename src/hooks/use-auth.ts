import { useContext } from 'react';

import type { AuthContextType as AmplifyAuthContextType } from 'src/contexts/auth/amplify-context';
import { AuthContext } from 'src/contexts/auth/amplify-context';

type AuthContextType = AmplifyAuthContextType;

export const useAuth = <T = AuthContextType>() => useContext(AuthContext) as T;
