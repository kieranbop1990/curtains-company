import { Center, Stack, Title, Text, Button, ThemeIcon } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function NotAuthorisedPage() {
  const navigate = useNavigate();

  return (
    <Center style={{ minHeight: '60vh' }}>
      <Stack align="center" gap="md" maw={400}>
        <ThemeIcon size={64} radius="xl" color="red" variant="light">
          <IconLock size={32} />
        </ThemeIcon>
        <Title order={2} ta="center">Not Authorised</Title>
        <Text c="dimmed" ta="center" size="sm">
          You don&apos;t have permission to access this section. Contact your administrator
          if you believe this is an error.
        </Text>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Stack>
    </Center>
  );
}
