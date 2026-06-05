import { useEffect, useState, useCallback } from 'react';
import {
  Container, Title, Stack, Group, Button, Paper, SimpleGrid, Text,
  Table, Badge, TextInput, Select, ActionIcon, Tooltip, Modal,
  Alert, Center, Loader,
} from '@mantine/core';
import { IconPlus, IconSearch, IconMail, IconFileText, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { quotesApi } from 'src/api/quotes';
import type { Quote, QuoteStatus, EnquirySource } from 'src/types/quote';
import { ENQUIRY_SOURCES } from 'src/types/quote';
import { paths } from 'src/paths';

const STATUS_COLOR: Record<QuoteStatus, string> = {
  NEW: 'cyan',
  ACTIVE: 'yellow',
  WON: 'blue',
  LOST: 'red',
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  NEW: 'New',
  ACTIVE: 'Active',
  WON: 'Won',
  LOST: 'Lost',
};

const SOURCE_LABELS: Record<EnquirySource, string> = {
  REFERRAL: 'Referral',
  WEBSITE: 'Website',
  COLD_CALL: 'Cold Call',
  REPEAT_CUSTOMER: 'Repeat Customer',
  TRADE_SHOW: 'Trade Show',
  XERO_IMPORT: 'Xero Import',
  OTHER: 'Other',
};

type SortKey = 'createdAt' | 'customerName' | 'orderValue' | 'nextActionDate' | 'status' | 'enquirySource';
type SortDir = 'asc' | 'desc';

function sortQuotes(quotes: Quote[], key: SortKey, dir: SortDir): Quote[] {
  return [...quotes].sort((a, b) => {
    const av = a[key] ?? '';
    const bv = b[key] ?? '';
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return dir === 'asc' ? cmp : -cmp;
  });
}

function fmt(n: number | null): string {
  if (n == null) return '—';
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB');
}

export default function QuoteListPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [kpis, setKpis] = useState({ total: 0, totalValue: 0, avgValue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await quotesApi.getQuotes({ status: statusFilter ?? undefined, search: search || undefined });
      setQuotes(res.quotes);
      setKpis(res.kpis);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = sortQuotes(quotes, sortKey, sortDir);

  const colHeader = (label: string, key: SortKey) => (
    <Table.Th
      style={{ cursor: 'pointer', userSelect: 'none' }}
      onClick={() => handleSort(key)}
    >
      {label}{sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
    </Table.Th>
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Title order={2} fw={700}>Quote Pipeline</Title>
          <Group>
            <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
              Create New Quote
            </Button>
          </Group>
        </Group>

        {/* KPI Strip */}
        {(() => {
          const now = new Date();
          const weekAhead = new Date(now); weekAhead.setDate(weekAhead.getDate() + 7);
          const overdue = quotes.filter(q => q.nextActionDate && new Date(q.nextActionDate) < now && q.status !== 'WON' && q.status !== 'LOST').length;
          const dueThisWeek = quotes.filter(q => {
            if (!q.nextActionDate || q.status === 'WON' || q.status === 'LOST') return false;
            const d = new Date(q.nextActionDate);
            return d >= now && d <= weekAhead;
          }).length;
          const weightedValue = quotes.reduce((s, q) => s + (q.orderValue ?? 0) * ((q.probabilityScore ?? 50) / 100), 0);
          const wonThisMonth = quotes.filter(q => q.status === 'WON' && new Date(q.updatedAt).getMonth() === now.getMonth() && new Date(q.updatedAt).getFullYear() === now.getFullYear()).length;
          const pills = [
            { label: 'Total Quotes', value: kpis.total, color: undefined },
            { label: 'Total Value', value: fmt(kpis.totalValue), color: undefined },
            { label: 'Weighted Value', value: fmt(weightedValue), color: undefined },
            { label: 'Overdue Actions', value: overdue, color: overdue > 0 ? 'red' : undefined },
            { label: 'Due This Week', value: dueThisWeek, color: dueThisWeek > 0 ? 'orange' : undefined },
            { label: 'Won This Month', value: wonThisMonth, color: 'green' },
          ];
          return (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }}>
              {pills.map(p => (
                <Paper key={p.label} withBorder radius="md" p="md">
                  <Text size="xs" c="dimmed">{p.label}</Text>
                  <Title order={3} fw={700} c={p.color}>{p.value}</Title>
                </Paper>
              ))}
            </SimpleGrid>
          );
        })()}

        {/* Filters */}
        <Group gap="sm">
          <TextInput
            placeholder="Search quotes…"
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
        </Group>

        {/* Table */}
        <Paper withBorder radius="md">
          {loading ? (
            <Center p="xl"><Loader /></Center>
          ) : sorted.length === 0 ? (
            <Center p="xl">
              <Stack align="center" gap="xs">
                <IconAlertCircle size={32} color="gray" />
                <Text c="dimmed" size="sm">No quotes found. Create your first quote to get started.</Text>
              </Stack>
            </Center>
          ) : (
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  {colHeader('Created', 'createdAt')}
                  <Table.Th>Ref</Table.Th>
                  {colHeader('Customer', 'customerName')}
                  {colHeader('Source', 'enquirySource')}
                  <Table.Th>Product Type</Table.Th>
                  <Table.Th>Size</Table.Th>
                  {colHeader('Status', 'status')}
                  <Table.Th>Next Action</Table.Th>
                  {colHeader('Action Date', 'nextActionDate')}
                  <Table.Th>Assignee</Table.Th>
                  {colHeader('Value', 'orderValue')}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sorted.map(q => (
                  <Table.Tr
                    key={q.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/quotes/${q.id}`)}
                  >
                    <Table.Td>{fmtDate(q.createdAt)}</Table.Td>
                    <Table.Td><Text size="sm" fw={600}>{q.quoteRef}</Text></Table.Td>
                    <Table.Td>{q.customerName}</Table.Td>
                    <Table.Td>{q.enquirySource ? SOURCE_LABELS[q.enquirySource] : '—'}</Table.Td>
                    <Table.Td>{q.productType || '—'}</Table.Td>
                    <Table.Td>
                      {q.widthMm && q.heightMm ? `${q.widthMm}×${q.heightMm}` : '—'}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={STATUS_COLOR[q.status]} variant="light" size="sm">
                        {STATUS_LABELS[q.status]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{q.nextAction || '—'}</Table.Td>
                    <Table.Td>{fmtDate(q.nextActionDate)}</Table.Td>
                    <Table.Td>{q.assigneeName || '—'}</Table.Td>
                    <Table.Td>{fmt(q.orderValue)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>

      <CreateQuoteModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(q) => {
          setCreateOpen(false);
          navigate(`/dashboard/quotes/${q.id}`);
        }}
      />
    </Container>
  );
}

interface CreateQuoteModalProps {
  opened: boolean;
  onClose: () => void;
  onCreated: (q: Quote) => void;
}

function CreateQuoteModal({ opened, onClose, onCreated }: CreateQuoteModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [productType, setProductType] = useState('');
  const [enquirySource, setEnquirySource] = useState<EnquirySource | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!customerName.trim()) { setError('Customer name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const q = await quotesApi.createQuote({ customerName, productType, enquirySource: enquirySource ?? undefined });
      onCreated(q);
    } catch (e: any) {
      setError(e.message || 'Failed to create quote');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create New Quote" size="md">
      <Stack gap="md">
        {error && <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>}
        <TextInput
          label="Customer Name"
          placeholder="e.g. Acme Ltd"
          required
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
        />
        <TextInput
          label="Product Type"
          placeholder="e.g. Fire Curtain FC80"
          value={productType}
          onChange={e => setProductType(e.target.value)}
        />
        <Select
          label="Enquiry Source"
          placeholder="Select source"
          clearable
          data={ENQUIRY_SOURCES.map(s => ({ value: s, label: SOURCE_LABELS[s] }))}
          value={enquirySource}
          onChange={v => setEnquirySource(v as EnquirySource | null)}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Create Quote</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
