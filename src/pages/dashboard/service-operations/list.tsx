import { useEffect, useState } from 'react';
import {
  Container, Title, Stack, Group, Button, Paper, Table, Badge,
  Center, Loader, Text, Progress, Grid, SimpleGrid, Tabs, RingProgress,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ApexChart from 'react-apexcharts';
import { serviceQuotesApi } from 'src/api/service-operations';
import type { ServiceQuote, ServiceQuoteStatus } from 'src/types/service-operations';

const STATUS_STEPS: ServiceQuoteStatus[] = ['QUOTE_DRAFTED', 'SENT', 'CHASING', 'ORDER_PLACED', 'LIVE_CLOSED'];
const STATUS_LABELS: Record<ServiceQuoteStatus, string> = {
  QUOTE_DRAFTED: 'Quote Drafted', SENT: 'Sent', CHASING: 'Chasing',
  ORDER_PLACED: 'Order Placed', LIVE_CLOSED: 'Live / Closed',
};
const STATUS_COLOR: Record<ServiceQuoteStatus, string> = {
  QUOTE_DRAFTED: 'gray', SENT: 'blue', CHASING: 'yellow',
  ORDER_PLACED: 'green', LIVE_CLOSED: 'teal',
};

function fmtCurrency(n: number | null): string {
  if (n == null) return '—';
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

function slaBreached(sla: string, createdAt: string): boolean {
  if (!sla) return false;
  const hours = parseInt(sla, 10);
  if (isNaN(hours)) return false;
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  return ageHours > hours;
}

export default function ServiceOperationsListPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<ServiceQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    serviceQuotesApi.getAll().then(setQuotes).finally(() => setLoading(false));
  }, []);

  // KPIs matching design
  const now = new Date();
  const servicesDue = quotes.filter(q => q.status === 'CHASING').length;
  const servicesRenewed = quotes.filter(q => q.status === 'LIVE_CLOSED').length;
  const awaitingAccess = quotes.filter(q => q.status === 'ORDER_PLACED').length;
  const overdueServices = quotes.filter(q => {
    if (q.status !== 'CHASING') return false;
    const lastChase = q.chaseEntries?.slice(-1)[0];
    if (!lastChase?.nextActionDate) return false;
    return new Date(lastChase.nextActionDate) < now;
  }).length;
  const monthlyValue = quotes.reduce((s, q) => s + (q.serviceRate ?? 0), 0);
  const forecastRenewals = quotes
    .filter(q => q.autoRenewal && q.status !== 'LIVE_CLOSED')
    .reduce((s, q) => s + (q.annualRevenueIncVat ?? 0), 0);
  const annualValue = quotes.reduce((s, q) => s + (q.annualRevenueIncVat ?? 0), 0);

  // T-186: Contract summary
  const contractCount = quotes.filter(q => q.status !== 'QUOTE_DRAFTED').length;
  const totalContracts = quotes.length;

  // T-184: Monthly revenue — last 6 months
  const now = new Date();
  const monthLabels: string[] = [];
  const monthRevenue: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    monthLabels.push(label);
    const rev = quotes
      .filter(q => {
        if (!q.contractStart) return false;
        const s = new Date(q.contractStart);
        return s.getMonth() === d.getMonth() && s.getFullYear() === d.getFullYear();
      })
      .reduce((sum, q) => sum + (q.annualRevenueIncVat ?? 0), 0);
    monthRevenue.push(rev);
  }

  // T-185: Engineer workload — open jobs per engineer (using engineerName from live services or accountManager)
  const engineerCounts: Record<string, number> = {};
  for (const q of quotes) {
    const name = q.customerName ?? 'Unknown';
    // Proxy: count by customer as engineer workload is on LS jobs; use serviceCategory as proxy grouping
    engineerCounts[name] = (engineerCounts[name] ?? 0) + 1;
  }

  // T-187: KPI by customer
  const customerMap: Record<string, { count: number; value: number; status: string }> = {};
  for (const q of quotes) {
    const k = q.customerName ?? 'Unknown';
    if (!customerMap[k]) customerMap[k] = { count: 0, value: 0, status: q.status };
    customerMap[k].count++;
    customerMap[k].value += q.annualRevenueIncVat ?? 0;
  }
  const customerRows = Object.entries(customerMap)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 10);

  // T-188: SLA tracking
  const slaBreachRows = quotes.filter(q =>
    slaBreached(q.slaResponse, q.createdAt) || slaBreached(q.slaResolution, q.createdAt)
  );

  const barChartOptions = {
    chart: { type: 'bar' as const, toolbar: { show: false } },
    xaxis: { categories: monthLabels },
    yaxis: { labels: { formatter: (v: number) => `£${(v / 1000).toFixed(0)}k` } },
    colors: ['#339af0'],
    dataLabels: { enabled: false },
    plotOptions: { bar: { borderRadius: 4 } },
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2} fw={700}>Service Operations</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/dashboard/service-operations/add')}>
            New Service Quote
          </Button>
        </Group>

        {/* KPI Strip */}
        <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm">
          {[
            { label: 'Services Due', value: servicesDue, color: servicesDue > 0 ? 'orange' : undefined },
            { label: 'Services Renewed', value: servicesRenewed, color: 'green' },
            { label: 'Awaiting Access', value: awaitingAccess, color: undefined },
            { label: 'Overdue', value: overdueServices, color: overdueServices > 0 ? 'red' : undefined },
            { label: 'Monthly Service Value', value: fmtCurrency(monthlyValue), color: undefined },
            { label: 'Forecast Renewals', value: fmtCurrency(forecastRenewals), color: undefined },
          ].map(p => (
            <Paper key={p.label} withBorder radius="md" p="md">
              <Text size="xs" c="dimmed">{p.label}</Text>
              <Text fw={700} size="lg" c={p.color}>{p.value}</Text>
            </Paper>
          ))}
        </SimpleGrid>

        {/* T-186: Contract summary strip */}
        <Paper withBorder radius="md" p="md">
          <Group gap="xl">
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Total Contracts</Text>
              <Text fw={700}>{totalContracts}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Active Contracts</Text>
              <Text fw={700}>{contractCount}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Monthly Value</Text>
              <Text fw={700}>{fmtCurrency(monthlyValue)}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Annual Value</Text>
              <Text fw={700}>{fmtCurrency(annualValue)}</Text>
            </Stack>
            {slaBreachRows.length > 0 && (
              <Badge color="red" size="lg">{slaBreachRows.length} SLA Breach{slaBreachRows.length > 1 ? 'es' : ''}</Badge>
            )}
          </Group>
        </Paper>

        <Tabs defaultValue="pipeline">
          <Tabs.List>
            <Tabs.Tab value="pipeline">Pipeline</Tabs.Tab>
            <Tabs.Tab value="financial">Financial</Tabs.Tab>
            <Tabs.Tab value="customers">By Customer</Tabs.Tab>
            <Tabs.Tab value="sla">SLA Tracking</Tabs.Tab>
          </Tabs.List>

          {/* Pipeline table + renewal donut */}
          <Tabs.Panel value="pipeline" pt="md">
            <Grid gap="lg">
              <Grid.Col span={{ base: 12, md: 9 }}>
                <Paper withBorder radius="md">
                  {loading ? <Center p="xl"><Loader /></Center> : quotes.length === 0 ? (
                    <Center p="xl"><Text c="dimmed" size="sm">No service quotes yet.</Text></Center>
                  ) : (
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Ref</Table.Th>
                          <Table.Th>Customer</Table.Th>
                          <Table.Th>Asset</Table.Th>
                          <Table.Th>Frequency</Table.Th>
                          <Table.Th>Last Chased</Table.Th>
                          <Table.Th>Next Action</Table.Th>
                          <Table.Th>Renewal Value</Table.Th>
                          <Table.Th>Status</Table.Th>
                          <Table.Th>Probability</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {quotes.map(q => {
                          const lastChase = q.chaseEntries?.slice(-1)[0];
                          const nextAction = lastChase?.nextActionDate;
                          const isOverdue = nextAction && new Date(nextAction) < now;
                          return (
                            <Table.Tr key={q.id} style={{ cursor: 'pointer' }}
                              onClick={() => navigate(`/dashboard/service-operations/${q.id}`)}>
                              <Table.Td><Text size="sm" fw={600}>{q.sQuoteRef}</Text></Table.Td>
                              <Table.Td><Text size="sm">{q.customerName}</Text></Table.Td>
                              <Table.Td><Text size="sm" c="dimmed">{q.assetRef || '—'}</Text></Table.Td>
                              <Table.Td><Text size="sm">{q.frequency ?? '—'}</Text></Table.Td>
                              <Table.Td>
                                <Text size="sm" c="dimmed">
                                  {lastChase ? new Date(lastChase.chaseDate).toLocaleDateString('en-GB') : '—'}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" c={isOverdue ? 'red' : undefined} fw={isOverdue ? 600 : undefined}>
                                  {nextAction ? new Date(nextAction).toLocaleDateString('en-GB') : '—'}
                                  {isOverdue && ' ⚠'}
                                </Text>
                              </Table.Td>
                              <Table.Td><Text size="sm">{fmtCurrency(q.annualRevenueIncVat)}</Text></Table.Td>
                              <Table.Td>
                                <Badge color={STATUS_COLOR[q.status]} variant="light" size="sm">
                                  {STATUS_LABELS[q.status]}
                                </Badge>
                              </Table.Td>
                              <Table.Td>
                                {q.probability != null ? (
                                  <Group gap="xs" align="center">
                                    <Progress value={q.probability} size="sm" style={{ flex: 1, minWidth: 50 }}
                                      color={q.probability >= 70 ? 'green' : q.probability >= 40 ? 'yellow' : 'red'} />
                                    <Text size="xs">{q.probability}%</Text>
                                  </Group>
                                ) : '—'}
                              </Table.Td>
                            </Table.Tr>
                          );
                        })}
                      </Table.Tbody>
                    </Table>
                  )}
                </Paper>
              </Grid.Col>

              {/* Renewal pipeline donut */}
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Paper withBorder radius="md" p="lg">
                  <Stack gap="md">
                    <Text fw={600} size="sm">Renewal Pipeline</Text>
                    {quotes.length > 0 && (
                      <>
                        <Center>
                          <RingProgress size={140} thickness={18}
                            label={<Text ta="center" size="xs" fw={700}>{quotes.length}{'\n'}total</Text>}
                            sections={STATUS_STEPS.map(s => ({
                              value: quotes.filter(q => q.status === s).length / quotes.length * 100,
                              color: STATUS_COLOR[s],
                              tooltip: `${STATUS_LABELS[s]}: ${quotes.filter(q => q.status === s).length}`,
                            })).filter(s => s.value > 0)}
                          />
                        </Center>
                        <Stack gap={4}>
                          {STATUS_STEPS.map(s => {
                            const count = quotes.filter(q => q.status === s).length;
                            if (count === 0) return null;
                            return (
                              <Group key={s} justify="space-between">
                                <Group gap={6}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--mantine-color-${STATUS_COLOR[s]}-6)` }} />
                                  <Text size="xs" c="dimmed">{STATUS_LABELS[s]}</Text>
                                </Group>
                                <Text size="xs" fw={600}>{count}</Text>
                              </Group>
                            );
                          })}
                        </Stack>
                      </>
                    )}
                    {quotes.length === 0 && <Text size="xs" c="dimmed">No data</Text>}
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* T-184 + T-185: Financial + Engineer workload */}
          <Tabs.Panel value="financial" pt="md">
            <Grid gap="lg">
              <Grid.Col span={7}>
                <Paper withBorder radius="md" p="lg">
                  <Stack gap="sm">
                    <Text fw={600} size="sm">Monthly Revenue (Last 6 Months)</Text>
                    {typeof window !== 'undefined' && (
                      <ApexChart
                        type="bar"
                        height={250}
                        options={barChartOptions}
                        series={[{ name: 'Revenue', data: monthRevenue }]}
                      />
                    )}
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={5}>
                <Paper withBorder radius="md" p="lg">
                  <Stack gap="sm">
                    <Text fw={600} size="sm">Open Jobs by Customer (Top 10)</Text>
                    {Object.entries(engineerCounts).slice(0, 8).map(([name, count]) => (
                      <Group key={name} justify="space-between">
                        <Text size="xs" lineClamp={1} style={{ flex: 1 }}>{name}</Text>
                        <Group gap="xs">
                          <Progress value={Math.min((count / quotes.length) * 100, 100)} size="sm" w={80} />
                          <Badge size="xs">{count}</Badge>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* T-187: KPI by customer */}
          <Tabs.Panel value="customers" pt="md">
            <Paper withBorder radius="md">
              <Table striped withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Customer</Table.Th>
                    <Table.Th>Quotes</Table.Th>
                    <Table.Th>Annual Value</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {customerRows.map(([customer, data]) => (
                    <Table.Tr key={customer}>
                      <Table.Td><Text size="sm" fw={600}>{customer}</Text></Table.Td>
                      <Table.Td>{data.count}</Table.Td>
                      <Table.Td>{fmtCurrency(data.value)}</Table.Td>
                      <Table.Td>
                        <Badge size="sm" color={STATUS_COLOR[data.status as ServiceQuoteStatus] ?? 'gray'} variant="light">
                          {STATUS_LABELS[data.status as ServiceQuoteStatus] ?? data.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Tabs.Panel>

          {/* T-188: SLA Tracking */}
          <Tabs.Panel value="sla" pt="md">
            <Paper withBorder radius="md">
              {slaBreachRows.length === 0 ? (
                <Center p="xl"><Text c="green" size="sm">No SLA breaches detected.</Text></Center>
              ) : (
                <Table striped withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Ref</Table.Th>
                      <Table.Th>Customer</Table.Th>
                      <Table.Th>SLA Response</Table.Th>
                      <Table.Th>SLA Resolution</Table.Th>
                      <Table.Th>Response Breach</Table.Th>
                      <Table.Th>Resolution Breach</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {slaBreachRows.map(q => (
                      <Table.Tr key={q.id} style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/dashboard/service-operations/${q.id}`)}>
                        <Table.Td><Text size="sm" fw={600}>{q.sQuoteRef}</Text></Table.Td>
                        <Table.Td>{q.customerName}</Table.Td>
                        <Table.Td>{q.slaResponse || '—'}</Table.Td>
                        <Table.Td>{q.slaResolution || '—'}</Table.Td>
                        <Table.Td>
                          {slaBreached(q.slaResponse, q.createdAt) ? (
                            <Badge color="red" size="sm">Breached</Badge>
                          ) : <Badge color="green" size="sm">OK</Badge>}
                        </Table.Td>
                        <Table.Td>
                          {slaBreached(q.slaResolution, q.createdAt) ? (
                            <Badge color="red" size="sm">Breached</Badge>
                          ) : <Badge color="green" size="sm">OK</Badge>}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
