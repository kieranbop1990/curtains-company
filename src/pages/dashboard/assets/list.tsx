import { useEffect, useState, useCallback } from 'react';
import {
  Container, Title, Stack, Group, Button, Paper, Table, Badge,
  TextInput, Select, Center, Loader, Text, Alert,
} from '@mantine/core';
import { IconPlus, IconSearch, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { assetsApi } from 'src/api/assets';
import type { Asset, AssetStatus, AssetPriority } from 'src/types/asset';

const STATUS_COLOR: Record<AssetStatus, string> = {
  LIVE_ACTIVE: 'green',
  SERVICE_DUE: 'yellow',
  OVERDUE: 'red',
  UNKNOWN: 'gray',
};

const STATUS_LABELS: Record<AssetStatus, string> = {
  LIVE_ACTIVE: 'Live / Active',
  SERVICE_DUE: 'Service Due',
  OVERDUE: 'Overdue',
  UNKNOWN: 'Unknown',
};

const PRIORITY_COLOR: Record<AssetPriority, string> = {
  HOT: 'red',
  HIGH: 'orange',
  NORMAL: 'gray',
};

const PRIORITY_LABELS: Record<AssetPriority, string> = {
  HOT: 'Hot',
  HIGH: 'High',
  NORMAL: 'Normal',
};

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB');
}

export default function AssetListPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await assetsApi.getAssets({
        status: statusFilter ?? undefined,
        priority: priorityFilter ?? undefined,
        search: search || undefined,
      });
      setAssets(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2} fw={700}>Asset Management</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/dashboard/assets/add')}>
            Add Asset
          </Button>
        </Group>

        <Group gap="sm">
          <TextInput
            placeholder="Search assets…"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="All statuses"
            clearable
            data={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
            value={statusFilter}
            onChange={setStatusFilter}
            w={160}
          />
          <Select
            placeholder="All priorities"
            clearable
            data={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
            value={priorityFilter}
            onChange={setPriorityFilter}
            w={140}
          />
        </Group>

        <Paper withBorder radius="md">
          {loading ? (
            <Center p="xl"><Loader /></Center>
          ) : assets.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="xs">
                <IconAlertCircle size={32} color="gray" />
                <Text c="dimmed" size="sm">No assets found.</Text>
              </Stack>
            </Center>
          ) : (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Ref</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Site</Table.Th>
                  <Table.Th>System Type</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Priority</Table.Th>
                  <Table.Th>Next Service</Table.Th>
                  <Table.Th>Serial No.</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {assets.map(a => (
                  <Table.Tr
                    key={a.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/assets/${a.id}`)}
                  >
                    <Table.Td><Text size="sm" fw={600}>{a.assetRef}</Text></Table.Td>
                    <Table.Td>{a.customerName || '—'}</Table.Td>
                    <Table.Td>{a.siteName || '—'}</Table.Td>
                    <Table.Td>{a.systemType || '—'}</Table.Td>
                    <Table.Td>
                      <Badge color={STATUS_COLOR[a.status]} variant="light" size="sm">
                        {STATUS_LABELS[a.status]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={PRIORITY_COLOR[a.priority]} variant="dot" size="sm">
                        {PRIORITY_LABELS[a.priority]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{fmtDate(a.nextServiceDate)}</Table.Td>
                    <Table.Td>{a.serialNumber || '—'}</Table.Td>
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
