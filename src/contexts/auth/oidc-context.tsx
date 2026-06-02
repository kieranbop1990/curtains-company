import type { FC, ReactNode } from 'react';
import { createContext, useCallback } from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';
import { cognitoDomain, amplifyConfig } from 'src/config';
import { userManager } from 'src/lib/user-manager';
import type { User } from 'src/types/user';
import { Issuer } from 'src/utils/auth';

interface State {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

export interface AuthContextType extends State {
  issuer: Issuer.Amplify;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const initialState: State = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  issuer: Issuer.Amplify,
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const auth = useOidcAuth();

  const user: User | null = auth.user
    ? {
        id: auth.user.profile.sub,
        email: auth.user.profile.email as string,
        name: (auth.user.profile.given_name as string) ?? '',
        surname: (auth.user.profile.family_name as string) ?? '',
      }
    : null;

  const signIn = useCallback(async () => {
    await userManager.signinRedirect({ state: window.location.pathname });
  }, []);

  const signOut = useCallback(async () => {
    await auth.removeUser();
    const logoutUri = encodeURIComponent(window.location.origin);
    const clientId = amplifyConfig.aws_user_pools_web_client_id;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
  }, [auth]);

  return (
    <AuthContext.Provider
      value={{
        issuer: Issuer.Amplify,
        isInitialized: !auth.isLoading,
        isAuthenticated: auth.isAuthenticated,
        user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthConsumer = AuthContext.Consumer;
