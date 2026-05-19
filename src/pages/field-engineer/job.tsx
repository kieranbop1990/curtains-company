import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Stack, Title, Text, Paper, Group, Badge, Button,
  Center, Loader, Alert, Tabs, Textarea, Anchor, Progress,
  NumberInput, Select,
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle, IconCamera, IconSend, IconCalendar } from '@tabler/icons-react';
import { fieldEngineerApi, photoQueue } from 'src/api/field-engineer';
import type { DistributionJob } from 'src/types/distribution';

const SYSTEM_STATUSES = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'INSTALLED', label: 'Installed' },
];

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'gray', IN_PROGRESS: 'blue', INSTALLED: 'green',
};

const MEDIA_TYPES = [
  'Installation Evidence', 'Photos/Videos', 'Sign-off', 'Additional Works', 'Commissioning',
];

interface SystemRecord {
  systemIndex: number;
  status: string;
  notes: string;
  checklistDone: boolean;
}

export default function FieldEngineerJobPage() {
  const { djId } = useParams<{ djId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<DistributionJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [systemRecords, setSystemRecords] = useState<Record<number, SystemRecord>>({});
  const [customerSig, setCustomerSig] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState(MEDIA_TYPES[0]);
  const [queuedCount, setQueuedCount] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const cameraRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    if (!djId) return;
    fieldEngineerApi.getMyJob(djId)
      .then(data => {
        setJob(data);
        localStorage.setItem(`fc_job_${djId}`, JSON.stringify(data));
        // Initialize system records from engineer count + 1 system per engineer assumed
        const numSystems = Math.max(1, data.engineers.length);
        const initial: Record<number, SystemRecord> = {};
        for (let i = 1; i <= numSystems; i++) {
          initial[i] = { systemIndex: i, status: 'NOT_STARTED', notes: '', checklistDone: false };
        }
        setSystemRecords(initial);
      })
      .catch(() => {
        const cached = localStorage.getItem(`fc_job_${djId}`);
        if (cached) setJob(JSON.parse(cached));
        else setError('Job not found and no cached data available');
      })
      .finally(() => setLoading(false));
  }, [djId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const queue = photoQueue.get().filter(p => p.djId === djId);
    setQueuedCount(queue.filter(p => p.status === 'queued' || p.status === 'failed').length);
    setUploadedCount(queue.filter(p => p.status === 'done').length);
  }, [djId]);

  const capturePhoto = async () => {
    cameraRef.current?.click();
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !djId) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      try {
        const { url } = await fieldEngineerApi.getMediaUploadUrl(djId, file.name, file.type);
        const photoId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        photoQueue.add({
          id: photoId, djId, uploadUrl: url,
          dataUrl, contentType: file.type,
          mediaType: selectedMediaType,
          status: navigator.onLine ? 'queued' : 'queued',
          queuedAt: new Date().toISOString(),
        });
        setQueuedCount(prev => prev + 1);
        if (navigator.onLine) {
          await photoQueue.processQueue();
          setQueuedCount(0);
          setUploadedCount(prev => prev + 1);
        }
      } catch {
        // Queued for later
        setQueuedCount(prev => prev + 1);
      }
    };
    reader.readAsDataURL(file);
  };

  const submitDay = async () => {
    if (!djId || !job) return;
    setSubmitting(true);
    try {
      await fieldEngineerApi.submitDay(djId, {
        dayLabel: `Day ${activeDay} of ${job.daysOnSite ?? '?'}`,
        customerSignature: customerSig || undefined,
        submittedAt: new Date().toISOString(),
        isFinalDay: activeDay === totalDays,
      });
      setSubmitted(true);
      await photoQueue.processQueue();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Center p="xl"><Loader /></Center>;
  if (error || !job) return (
    <Container size="sm" py="md">
      <Alert icon={<IconAlertCircle />} color="red">{error ?? 'Job not found'}</Alert>
    </Container>
  );

  const totalDays = job.daysOnSite ?? 1;
  const allSystemsDone = Object.values(systemRecords).every(r => r.status === 'INSTALLED');

  return (
    <Container size="sm" py="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Button variant="subtle" size="sm" leftSection={<IconArrowLeft size={14} />}
            onClick={() => navigate('/field-engineer')}>Jobs</Button>
          <Text size="xs" c="dimmed" ta="right">
            {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
          </Text>
        </Group>

        <Paper withBorder radius="md" p="md">
          <Stack gap="xs">
            <Group justify="space-between">
              <Title order={4} fw={700}>{job.djRef}</Title>
              {job.returnVisit && <Badge color="orange">Return Visit</Badge>}
            </Group>
            <Text fw={600} size="lg">{job.customerName}</Text>
            {job.siteName && <Text size="sm">{job.siteName}</Text>}
            {job.dateIn && <Text size="sm" c="dimmed">Date In: {new Date(job.dateIn).toLocaleDateString('en-GB')}</Text>}
          </Stack>
        </Paper>

        <Tabs defaultValue="job">
          <Tabs.List>
            <Tabs.Tab value="job">Job</Tabs.Tab>
            <Tabs.Tab value="systems">Systems</Tabs.Tab>
            <Tabs.Tab value="media">Media</Tabs.Tab>
            <Tabs.Tab value="calendar">Calendar</Tabs.Tab>
          </Tabs.List>

          {/* Per-job view (T-154) */}
          <Tabs.Panel value="job" pt="md">
            <Stack gap="md">
              {/* Day navigation (T-153) */}
              <Paper withBorder radius="md" p="md">
                <Group justify="space-between">
                  <Text fw={600} size="sm">Day Navigation</Text>
                  <Group gap="xs">
                    <Button size="xs" variant="subtle" disabled={activeDay <= 1}
                      onClick={() => setActiveDay(d => Math.max(1, d - 1))}>‹</Button>
                    <Badge size="lg">Day {activeDay} of {totalDays}</Badge>
                    <Button size="xs" variant="subtle" disabled={activeDay >= totalDays}
                      onClick={() => setActiveDay(d => Math.min(totalDays, d + 1))}>›</Button>
                  </Group>
                </Group>
              </Paper>

              {/* Site information */}
              <Paper withBorder radius="md" p="md">
                <Stack gap="xs">
                  <Text fw={600} size="sm">Site Details</Text>
                  <Text size="sm">📍 {job.siteName ?? 'No site name'}</Text>
                  {job.dateIn && (
                    <Text size="sm">🕐 {new Date(job.dateIn).toLocaleDateString('en-GB')}</Text>
                  )}
                  {job.engineers.slice(0, 1).map(e => (
                    <Text key={e.id} size="sm">👷 {e.engineerName} — Start: {e.signOnTime ?? 'TBC'}</Text>
                  ))}
                </Stack>
              </Paper>

              {/* Submit day flow (T-158) */}
              <Paper withBorder radius="md" p="md">
                <Stack gap="sm">
                  <Text fw={600} size="sm">Submit Day {activeDay}</Text>
                  {!allSystemsDone && (
                    <Text size="sm" c="orange">Complete all system records before submitting.</Text>
                  )}
                  <Textarea label="Customer Signature (reference / note)"
                    value={customerSig}
                    onChange={(e) => setCustomerSig(e.currentTarget.value)}
                    placeholder="Customer name and sign-off reference" />
                  <Button color="green" leftSection={<IconSend size={14} />}
                    loading={submitting} disabled={submitted}
                    onClick={submitDay}>
                    {submitted ? '✓ Submitted' : `Submit Day ${activeDay}`}
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>

          {/* Per-system records (T-155) */}
          <Tabs.Panel value="systems" pt="md">
            <Stack gap="md">
              {Object.entries(systemRecords).map(([idx, rec]) => (
                <Paper key={idx} withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={600} size="sm">System {idx}</Text>
                      <Badge color={STATUS_COLORS[rec.status]} variant="light">{rec.status.replace('_', ' ')}</Badge>
                    </Group>
                    <Select
                      label="Status"
                      data={SYSTEM_STATUSES}
                      value={rec.status}
                      onChange={(v) => v && setSystemRecords(prev => ({
                        ...prev, [Number(idx)]: { ...rec, status: v }
                      }))} />
                    <Textarea label="Installation Notes" size="sm"
                      value={rec.notes}
                      onChange={(e) => setSystemRecords(prev => ({
                        ...prev, [Number(idx)]: { ...rec, notes: e.currentTarget.value }
                      }))} />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Tabs.Panel>

          {/* Photo capture (T-156, T-157) */}
          <Tabs.Panel value="media" pt="md">
            <Stack gap="md">
              <Paper withBorder radius="md" p="md">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600} size="sm">Media Capture</Text>
                    <Group gap="xs">
                      {queuedCount > 0 && <Badge color="orange">{queuedCount} queued</Badge>}
                      {uploadedCount > 0 && <Badge color="green">{uploadedCount} uploaded</Badge>}
                    </Group>
                  </Group>
                  {(queuedCount + uploadedCount) > 0 && (
                    <Progress
                      value={uploadedCount > 0 ? (uploadedCount / (uploadedCount + queuedCount)) * 100 : 0}
                      size="sm" color="green" />
                  )}
                  <Select label="Media Type" data={MEDIA_TYPES.map(t => ({ value: t, label: t }))}
                    value={selectedMediaType}
                    onChange={(v) => v && setSelectedMediaType(v)} />
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handlePhotoCapture}
                  />
                  <Button leftSection={<IconCamera size={14} />} onClick={capturePhoto}>
                    Take Photo / Video
                  </Button>
                  {queuedCount > 0 && navigator.onLine && (
                    <Button size="sm" variant="light" onClick={() => photoQueue.processQueue()}>
                      Upload {queuedCount} queued item(s)
                    </Button>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>

          {/* Mini installation calendar (T-160) */}
          <Tabs.Panel value="calendar" pt="md">
            <Paper withBorder radius="md" p="md">
              <Stack gap="sm">
                <Text fw={600} size="sm">Installation Schedule</Text>
                {job.dateIn ? (
                  <Stack gap="xs">
                    {Array.from({ length: totalDays }, (_, i) => {
                      const day = i + 1;
                      const dayDate = new Date(job.dateIn!);
                      dayDate.setDate(dayDate.getDate() + i);
                      const isToday = dayDate.toDateString() === new Date().toDateString();
                      return (
                        <Paper key={day} withBorder radius="sm" p="sm"
                          style={{ cursor: 'pointer', backgroundColor: isToday ? 'var(--mantine-color-blue-0)' : undefined }}
                          onClick={() => setActiveDay(day)}>
                          <Group justify="space-between">
                            <Text size="sm" fw={day === activeDay ? 700 : 400}>
                              Day {day} — {dayDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </Text>
                            {isToday && <Badge size="xs" color="blue">Today</Badge>}
                            {day === activeDay && <Badge size="xs" variant="outline">Current</Badge>}
                          </Group>
                        </Paper>
                      );
                    })}
                  </Stack>
                ) : (
                  <Text c="dimmed" size="sm">No date scheduled.</Text>
                )}
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
