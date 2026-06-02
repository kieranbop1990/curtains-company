import { createMiddleware } from 'hono/factory';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

export const USER_ROLES = ['ADMIN', 'OFFICE_OPERATIONS', 'ENGINEER_FIELD', 'FINANCE_ACCOUNTS', 'PRODUCTION', 'CUSTOMER'] as const;
export type UserRole = typeof USER_ROLES[number];

interface AuthUser {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  role: UserRole;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID!,
      tokenUse: 'id',
      clientId: process.env.COGNITO_CLIENT_ID!,
    });
  }
  return verifier;
}

function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && USER_ROLES.includes(role as UserRole);
}

export const authMiddleware = createMiddleware(async (c, next) => {
  if (process.env.DEV_SKIP_AUTH === 'true') {
    c.set('user', {
      sub: 'dev-user',
      email: 'dev@firecurtains.com',
      given_name: 'Dev',
      family_name: 'User',
      role: 'ADMIN' as UserRole,
    });
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await getVerifier().verify(token);
    const groups = (payload as Record<string, unknown>)['cognito:groups'];
    const rawRole = Array.isArray(groups) ? groups.find(isValidRole) : undefined;
    if (!rawRole) {
      return c.json({ error: 'Invalid or missing role claim' }, 403);
    }
    c.set('user', {
      sub: payload.sub,
      email: payload.email as string,
      given_name: payload.given_name as string | undefined,
      family_name: payload.family_name as string | undefined,
      role: rawRole,
    });
    return next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

export function requireRole(...roles: UserRole[]) {
  return createMiddleware(async (c, next) => {
    const user = c.get('user');
    if (!roles.includes(user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    return next();
  });
}
