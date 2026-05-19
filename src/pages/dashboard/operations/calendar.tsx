import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Paper, Text, Badge, Grid,
  Button, Select, Switch, Center, Loader, Anchor, Table, Modal,
  TextInput,
} from '@mantine/core';
import { IconArrowLeft, IconPlus, IconCalendar } from '@tabler/icons-react';
import { distributionApi } from 'src/api/distribution';
import type { DistributionJob } from 'src/types/distribution';

type CalendarView = 'month' | 'week' | 'agenda';

const EVENT_TYPES = [
  { type: 'INSTALLATION', label: 'Installation', color: 'blue' },
  { type: 'MULTIPLE', label: 'Multiple Installations', color: 'indigo' },
  { type: 'RETURN_VISIT', label: 'Return Visit', color: 'orange' },
  { type: 'SURVEY', label: 'Survey/Review', color: 'teal' },
  { type: 'RECOMMISSION', label: 'Recommission', color: 'violet' },
  { type: 'UNALLOCATED', label: 'Unallocated', color: 'gray' },
];

function getMonthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const days: Date[] = [];
  for (let i = 0; i < startDow; i++) {
    const d = new Date(first);
    d.setDate(d.getDate() - (startDow - i));
    days.push(d);
  }
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }
  return days;
}

function getWeekDays(anchor: Date): Date[] {
  const dow = anchor.getDay() === 0 ? 6 : anchor.getDay() - 1;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - dow + i);
    return d;
  });
}

function getEventColor(job: DistributionJob): string {
  if (job.returnVisit) return 'orange';
  if (job.distributionType === 'INSTALLATION') return 'blue';
  return 'gray';
}

export default function InstallationCalendarPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<CalendarView>('month');
  const [jobs, setJobs] = useState<DistributionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const [engineerFilter, setEngineerFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showResources, setShowResources] = useState(true);
  const [showUnallocated, setShowUnallocated] = useState(true);
  const [showEngineerDetails, setShowEngineerDetails] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingCustomer, setBookingCustomer] = useState('');
  const [bookingSite, setBookingSite] = useState('');

  const now = new Date();
  const [anchor, setAnchor] = useState(new Date());

  useEffect(() => {
    distributionApi.getAll()
      .then(data => setJobs(data.filter(d => d.distributionType === 'INSTALLATION')))
      .finally(() => setLoading(false));
  }, []);

  // Apply filters
  const filteredJobs = jobs.filter(j => {
    if (engineerFilter && !j.engineers?.some(e => e.engineerName === engineerFilter)) return false;
    if (statusFilter === 'RETURN_VISIT' && !j.returnVisit) return false;
    return true;
  });

  // Engineer list for filters
  const allEngineers = Array.from(new Set(jobs.flatMap(j => j.engineers?.map(e => e.engineerName) ?? [])));

  // KPI computations (T-175)
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const thisMonthJobs = filteredJobs.filter(j => {
    if (!j.dateIn) return false;
    const d = new Date(j.dateIn);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const returnVisitsThisMonth = thisMonthJobs.filter(j => j.returnVisit).length;
  const onSiteToday = filteredJobs.filter(j => j.dateIn?.slice(0, 10) === now.toISOString().slice(0, 10)).length;
  const unallocated = filteredJobs.filter(j => !j.engineers || j.engineers.length === 0).length;

  const kpis = [
    ['Installations (Month)', thisMonthJobs.length],
    ['Return Visits (Month)', returnVisitsThisMonth],
    ['On Site Today', onSiteToday],
    ['Unallocated', unallocated],
    ['Total Engineers', allEngineers.length],
  ];

  // Jobs for selected date (T-176)
  const selectedDateJobs = filteredJobs.filter(j => j.dateIn?.slice(0, 10) === selectedDate);
  const unallocatedJobs = filteredJobs.filter(j => !j.engineers || j.engineers.length === 0);

  function renderJobCard(job: DistributionJob) {
    const color = getEventColor(job);
    return (
      <Paper key={job.id} withBorder radius="sm" p="xs" mb={2}
        style={{ borderLeft: `3px solid var(--mantine-color-${color}-5)`, cursor: 'pointer' }}
        onClick={() => navigate(`/dashboard/distribution/${job.id}`)}>
        <Text size="xs" fw={600}>{job.djRef}</Text>
        <Text size="xs" c="dimmed">{job.siteName ?? job.customerName ?? '—'}</Text>
        {showEngineerDetails && job.engineers?.slice(0, 2).map(e => (
          <Badge key={e.id} size="xs" mr={2}>{e.engineerName?.slice(0, 3)}</Badge>
        ))}
        {job.returnVisit && <Badge size="xs" color="orange">RV</Badge>}
      </Paper>
    );
  }

  // New booking submit
  const handleBooking = async () => {
    if (!bookingDate || !bookingCustomer) return;
    await distributionApi.create({
      distributionType: 'INSTALLATION',
      customerName: bookingCustomer,
      siteName: bookingSite,
    });
    setBookingOpen(false);
    setBookingDate('');
    setBookingCustomer('');
    setBookingSite('');
    const updated = await distributionApi.getAll();
    setJobs(updated.filter(d => d.distributionType === 'INSTALLATION'));
  };

  const monthDays = getMonthDays(anchor.getFullYear(), anchor.getMonth());
  const weekDays = getWeekDays(anchor);

  if (loading) return <Center p="xl"><Loader /></Center>;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/dashboard/operations')}>Dashboard</Button>
            <Title order={2} fw={700}>Installation Calendar</Title>
          </Group>
          <Group gap="sm">
            <Button size="sm" leftSection={<IconPlus size={14} />} onClick={() => setBookingOpen(true)}>
              New Installation
            </Button>
          </Group>
        </Group>

        {/* KPI Pills (T-175: R13) */}
        <Group gap="sm">
          {kpis.map(([label, value]) => (
            <Paper key={label as string} withBorder radius="md" px="md" py="xs">
              <Group gap="xs">
                <Text size="xs" c="dimmed">{label}</Text>
                <Badge size="sm">{value}</Badge>
              </Group>
            </Paper>
          ))}
        </Group>

        {/* Controls: view selector + filters + toggles (T-177, T-180) */}
        <Group gap="sm" wrap="wrap">
          <Button.Group>
            {(['month', 'week', 'agenda'] as CalendarView[]).map(v => (
              <Button key={v} size="xs" variant={view === v ? 'filled' : 'default'}
                onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
            ))}
          </Button.Group>
          <Select placeholder="Engineer" clearable value={engineerFilter} onChange={setEngineerFilter}
            data={allEngineers.map(e => ({ value: e, label: e }))} size="xs" w={160} />
          <Select placeholder="Status" clearable value={statusFilter} onChange={setStatusFilter}
            data={[{ value: 'RETURN_VISIT', label: 'Return Visits' }]} size="xs" w={140} />
          {showResources && (
            <Button size="xs" variant="subtle" onClick={() => setAnchor(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}>‹</Button>
          )}
          <Text size="sm" fw={600}>
            {anchor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </Text>
          <Button size="xs" variant="subtle" onClick={() => setAnchor(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}>›</Button>
          <Switch size="xs" label="Resources" checked={showResources} onChange={e => setShowResources(e.currentTarget.checked)} />
          <Switch size="xs" label="Unallocated" checked={showUnallocated} onChange={e => setShowUnallocated(e.currentTarget.checked)} />
          <Switch size="xs" label="Engineer Details" checked={showEngineerDetails} onChange={e => setShowEngineerDetails(e.currentTarget.checked)} />
        </Group>

        {/* Event type legend (T-178: R16) */}
        <Group gap="sm">
          {EVENT_TYPES.map(et => (
            <Group key={et.type} gap={4}>
              <Badge size="xs" color={et.color}>{et.label}</Badge>
            </Group>
          ))}
        </Group>

        <Grid gap="md">
          <Grid.Col span={9}>
            {view === 'month' && (
              <Paper withBorder radius="md" p="md">
                <Stack gap="xs">
                  <Group gap={0} grow>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <Text key={d} size="xs" ta="center" c="dimmed" fw={600}>{d}</Text>
                    ))}
                  </Group>
                  <Grid gap={2}>
                    {monthDays.map((date, i) => {
                      const dateStr = date.toISOString().slice(0, 10);
                      const dayJobs = filteredJobs.filter(j => j.dateIn?.slice(0, 10) === dateStr);
                      const isCurrentMonth = date.getMonth() === anchor.getMonth();
                      const isToday = dateStr === now.toISOString().slice(0, 10);
                      const isSelected = dateStr === selectedDate;
                      return (
                        <Grid.Col key={i} span={12 / 7}>
                          <Paper
                            withBorder radius="sm"
                            p="xs"
                            style={{
                              minHeight: 80,
                              cursor: 'pointer',
                              opacity: isCurrentMonth ? 1 : 0.4,
                              background: isSelected ? 'var(--mantine-color-blue-0)' : isToday ? 'var(--mantine-color-teal-0)' : undefined,
                              borderColor: isToday ? 'var(--mantine-color-teal-4)' : undefined,
                            }}
                            onClick={() => setSelectedDate(dateStr)}
                          >
                            <Text size="xs" fw={isToday ? 700 : 400} ta="right">{date.getDate()}</Text>
                            {dayJobs.slice(0, 2).map(j => renderJobCard(j))}
                            {dayJobs.length > 2 && <Text size="xs" c="dimmed">+{dayJobs.length - 2} more</Text>}
                          </Paper>
                        </Grid.Col>
                      );
                    })}
                  </Grid>
                </Stack>
              </Paper>
            )}

            {view === 'week' && (
              <Paper withBorder radius="md" p="md">
                <Group gap={0} grow mb="xs">
                  {weekDays.map(date => (
                    <Text key={date.toISOString()} size="xs" ta="center" fw={600}>
                      {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
                    </Text>
                  ))}
                </Group>
                <Grid gap={2}>
                  {weekDays.map((date, i) => {
                    const dateStr = date.toISOString().slice(0, 10);
                    const dayJobs = filteredJobs.filter(j => j.dateIn?.slice(0, 10) === dateStr);
                    const isToday = dateStr === now.toISOString().slice(0, 10);
                    return (
                      <Grid.Col key={i} span={12 / 7}>
                        <Paper withBorder radius="sm" p="xs"
                          style={{ minHeight: 120, background: isToday ? 'var(--mantine-color-blue-0)' : undefined }}>
                          {dayJobs.map(j => renderJobCard(j))}
                          {dayJobs.length === 0 && <Text size="xs" c="dimmed" ta="center" pt="sm">—</Text>}
                        </Paper>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Paper>
            )}

            {view === 'agenda' && (
              <Paper withBorder radius="md">
                {filteredJobs.length === 0 ? (
                  <Center p="xl"><Text c="dimmed" size="sm">No installations scheduled.</Text></Center>
                ) : (
                  <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Job</Table.Th>
                        <Table.Th>Customer</Table.Th>
                        <Table.Th>Site</Table.Th>
                        <Table.Th>Engineers</Table.Th>
                        <Table.Th>Type</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredJobs
                        .filter(j => j.dateIn)
                        .sort((a, b) => (a.dateIn! > b.dateIn! ? 1 : -1))
                        .map(j => (
                          <Table.Tr key={j.id} style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/dashboard/distribution/${j.id}`)}>
                            <Table.Td><Text size="xs">{j.dateIn ? new Date(j.dateIn).toLocaleDateString('en-GB') : '—'}</Text></Table.Td>
                            <Table.Td><Text size="xs" fw={600}>{j.djRef}</Text></Table.Td>
                            <Table.Td><Text size="xs">{j.customerName ?? '—'}</Text></Table.Td>
                            <Table.Td><Text size="xs">{j.siteName ?? '—'}</Text></Table.Td>
                            <Table.Td>
                              {j.engineers?.slice(0, 3).map(e => (
                                <Badge key={e.id} size="xs" mr={2}>{e.engineerName}</Badge>
                              ))}
                            </Table.Td>
                            <Table.Td>
                              <Badge size="xs" color={getEventColor(j)}>{j.returnVisit ? 'Return Visit' : 'Installation'}</Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Paper>
            )}
          </Grid.Col>

          {/* Right Sidebar (T-176: R14) */}
          <Grid.Col span={3}>
            <Stack gap="md">
              <Paper withBorder radius="md" p="md">
                <Stack gap="sm">
                  <Group gap="xs">
                    <IconCalendar size={14} />
                    <Text fw={600} size="sm">{new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
                  </Group>
                  {selectedDateJobs.length === 0 ? (
                    <Text size="xs" c="dimmed">No jobs scheduled.</Text>
                  ) : (
                    selectedDateJobs.map(j => (
                      <Group key={j.id} justify="space-between">
                        <Anchor size="xs" onClick={() => navigate(`/dashboard/distribution/${j.id}`)}>{j.djRef}</Anchor>
                        <Badge size="xs" color={getEventColor(j)}>{j.returnVisit ? 'RV' : 'Inst'}</Badge>
                      </Group>
                    ))
                  )}
                </Stack>
              </Paper>

              {showUnallocated && unallocatedJobs.length > 0 && (
                <Paper withBorder radius="md" p="md">
                  <Stack gap="xs">
                    <Text fw={600} size="sm" c="orange">Unallocated ({unallocatedJobs.length})</Text>
                    {unallocatedJobs.slice(0, 5).map(j => (
                      <Group key={j.id} justify="space-between">
                        <Text size="xs">{j.djRef}</Text>
                        <Button size="xs" variant="subtle" onClick={() => navigate(`/dashboard/distribution/${j.id}`)}>Assign</Button>
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              )}

              {showResources && (
                <Paper withBorder radius="md" p="md">
                  <Stack gap="xs">
                    <Text fw={600} size="sm">Engineer Availability</Text>
                    {allEngineers.slice(0, 8).map(eng => {
                      const onSiteToday = filteredJobs.some(j => j.dateIn?.slice(0, 10) === selectedDate && j.engineers?.some(e => e.engineerName === eng));
                      return (
                        <Group key={eng} justify="space-between">
                          <Text size="xs">{eng}</Text>
                          <Badge size="xs" color={onSiteToday ? 'green' : 'blue'}>{onSiteToday ? 'On Site' : 'Available'}</Badge>
                        </Group>
                      );
                    })}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* New Installation booking modal (T-179: R17) */}
      <Modal opened={bookingOpen} onClose={() => setBookingOpen(false)} title="Book New Installation">
        <Stack gap="md">
          <TextInput label="Date" type="date" value={bookingDate} onChange={e => setBookingDate(e.currentTarget.value)} required />
          <TextInput label="Customer Name" value={bookingCustomer} onChange={e => setBookingCustomer(e.currentTarget.value)} required />
          <TextInput label="Site" value={bookingSite} onChange={e => setBookingSite(e.currentTarget.value)} />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setBookingOpen(false)}>Cancel</Button>
            <Button onClick={handleBooking} disabled={!bookingDate || !bookingCustomer}>Book Installation</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
