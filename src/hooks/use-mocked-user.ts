import type { User } from 'src/types/user';

export const useMockedUser = (): User => {
  // To get the user from the authContext, you can use
  // `const { user } = useAuth();`
  return {
    id: 'id-to-change',
    avatar: '/assets/avatars/avatar-anika-visser.png',
    name: 'Simona Pillay',
    email: 'SimonaP@smells.com'
  };
};
