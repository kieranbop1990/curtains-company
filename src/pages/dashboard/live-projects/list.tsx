import { useEffect, useState, useCallback } from 'react';
import {
  Container, Title, Stack, Group, Paper, Table, Badge,
  TextInput, Select, Center, Loader, Text, Anchor,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { liveProjectsApi } from 'src/api/live-projects';
import type { LiveProject, LQStage } from 'src/types/live-project';

const STAGE_LABELS: Record<LQStage, string> = { LQ: 'Stage 2 — Live Quote', SD: 'Stage 3 — Survey & Drawings' };
const STAGE_COLOR: Record<LQStage, string> = { LQ: 'blue', SD: 'violet' };

function fmtCurrency(n: number | null): string {
  if (n == null) return '—';
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB');
}

export default function LiveProjectListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<LiveProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await liveProjectsApi.getAll({ stage: stageFilter ?? undefined, search: search || undefined });
      setProjects(data);
    } finally { setLoading(false); }
  }, [stageFilter, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={2} fw={700}>Live Projects</Title>
        <Group gap="sm">
          <TextInput placeholder="Search projects…" leftSection={<IconSearch size={16} />}
            value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <Select placeholder="All stages" clearable
            data={Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }))}
            value={stageFilter} onChange={setStageFilter} w={220} />
        </Group>
        <Paper withBorder radius="md">
          {loading ? <Center p="xl"><Loader /></Center> : projects.length === 0 ? (
            <Center p="xl"><Text c="dimmed" size="sm">No live projects yet. Convert a Won quote to create one.</Text></Center>
          ) : (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Ref</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Stage</Table.Th>
                  <Table.Th>Contract Value</Table.Th>
                  <Table.Th>Expected Completion</Table.Th>
                  <Table.Th>Assignee</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {projects.map(p => (
                  <Table.Tr key={p.id} style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/live-projects/${p.id}`)}>
                    <Table.Td><Text size="sm" fw={600}>{p.lqRef}</Text></Table.Td>
                    <Table.Td>{p.customerName}</Table.Td>
                    <Table.Td>
                      <Badge color={STAGE_COLOR[p.stage]} variant="light" size="sm">{STAGE_LABELS[p.stage]}</Badge>
                    </Table.Td>
                    <Table.Td>{fmtCurrency(p.totalContractValue)}</Table.Td>
                    <Table.Td>{fmtDate(p.expectedCompletion)}</Table.Td>
                    <Table.Td>{p.assigneeName || '—'}</Table.Td>
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
