import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { SplashScreen } from 'src/components/splash-screen';

export default function AuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && !auth.error) {
      const returnTo = (auth.user?.state as string) || '/';
      navigate(returnTo, { replace: true });
    }
  }, [auth.isLoading, auth.error, auth.user, navigate]);

  if (auth.error) {
    return <div>Authentication error: {auth.error.message}</div>;
  }

  return <SplashScreen />;
}
