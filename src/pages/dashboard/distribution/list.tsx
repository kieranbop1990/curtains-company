import { useEffect, useState } from 'react';
import {
  Container, Title, Stack, Group, Paper, Table, Badge, Text, Center, Loader, Alert, Button,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { distributionApi } from 'src/api/distribution';
import type { DistributionJob } from 'src/types/distribution';

const DIST_LABELS = { COLLECTION: '6A — Collection', DELIVERY: '6B — Delivery', INSTALLATION: '6C — Installation' };
const DIST_COLORS = { COLLECTION: 'violet', DELIVERY: 'blue', INSTALLATION: 'green' };

export default function DistributionListPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<DistributionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    distributionApi.getAll()
      .then(setJobs)
      .catch(() => setError('Failed to load distribution jobs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (error) return (
    <Container size="xl" py="xl">
      <Alert icon={<IconAlertCircle />} color="red">{error}</Alert>
    </Container>
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={2} fw={700}>Distribution &amp; Installation</Title>
        <Paper withBorder radius="md">
          {jobs.length === 0 ? (
            <Center p="xl"><Text c="dimmed" size="sm">No distribution jobs yet.</Text></Center>
          ) : (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Ref</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Site</Table.Th>
                  <Table.Th>Return Visit</Table.Th>
                  <Table.Th>Released</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {jobs.map(dj => (
                  <Table.Tr key={dj.id} style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/distribution/${dj.id}`)}>
                    <Table.Td><Text size="sm" fw={600}>{dj.djRef}</Text></Table.Td>
                    <Table.Td>
                      <Badge color={DIST_COLORS[dj.distributionType]} variant="light" size="sm">
                        {DIST_LABELS[dj.distributionType]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{dj.customerName ?? '—'}</Table.Td>
                    <Table.Td>{dj.siteName ?? '—'}</Table.Td>
                    <Table.Td>
                      {dj.distributionType === 'INSTALLATION' && dj.returnVisit ? (
                        <Badge color="orange" size="sm" variant="filled">Return Visit</Badge>
                      ) : '—'}
                    </Table.Td>
                    <Table.Td>
                      {dj.distributionType === 'COLLECTION' ? (
                        <Badge color={dj.accountsReleaseApproved ? 'green' : 'red'} size="sm" variant="light">
                          {dj.accountsReleaseApproved ? 'Released' : 'Blocked'}
                        </Badge>
                      ) : '—'}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
