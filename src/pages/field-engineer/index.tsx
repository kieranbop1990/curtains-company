import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Stack, Title, Text, Paper, Group, Badge, Button,
  Center, Loader, Alert, Anchor,
} from '@mantine/core';
import { IconAlertCircle, IconCalendar, IconMapPin } from '@tabler/icons-react';
import { fieldEngineerApi, photoQueue } from 'src/api/field-engineer';
import type { DistributionJob } from 'src/types/distribution';

function LastSyncDisplay() {
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('fc_last_sync');
    if (stored) setLastSync(new Date(stored).toLocaleTimeString('en-GB'));
  }, []);

  return (
    <Text size="xs" c="dimmed">
      Last sync: {lastSync ?? 'Never'}{' '}
      <Anchor size="xs" component="button"
        onClick={async () => {
          localStorage.setItem('fc_last_sync', Date.now().toString());
          setLastSync(new Date().toLocaleTimeString('en-GB'));
          await photoQueue.processQueue();
        }}>
        Sync now
      </Anchor>
    </Text>
  );
}

function daysBetween(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default function FieldEngineerHomePage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<DistributionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fieldEngineerApi.getMyJobs()
      .then(data => {
        setJobs(data);
        localStorage.setItem('fc_last_sync', Date.now().toString());
        // Cache jobs for offline
        localStorage.setItem('fc_cached_jobs', JSON.stringify(data));
      })
      .catch(() => {
        // Try offline cache
        const cached = localStorage.getItem('fc_cached_jobs');
        if (cached) {
          setJobs(JSON.parse(cached));
        } else {
          setError('No network and no cached data available');
        }
      })
      .finally(() => setLoading(false));

    // Trigger photo queue processing on load
    if (navigator.onLine) {
      photoQueue.processQueue();
    }
  }, []);

  const pendingPhotos = photoQueue.get().filter(p => p.status === 'queued' || p.status === 'failed').length;

  if (loading) return <Center p="xl"><Loader /></Center>;

  return (
    <Container size="sm" py="md">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={2}>
            <Title order={3} fw={700}>My Jobs</Title>
            <LastSyncDisplay />
          </Stack>
          {pendingPhotos > 0 && (
            <Badge color="orange">{pendingPhotos} photo{pendingPhotos > 1 ? 's' : ''} queued</Badge>
          )}
        </Group>

        {error && <Alert icon={<IconAlertCircle />} color="red">{error}</Alert>}

        {jobs.length === 0 && !error && (
          <Paper withBorder radius="md" p="lg">
            <Center><Text c="dimmed">No jobs assigned to you.</Text></Center>
          </Paper>
        )}

        {jobs.map(job => {
          const dl = daysBetween(job.dateIn);
          return (
            <Paper key={job.id} withBorder radius="md" p="md"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/field-engineer/${job.id}`)}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={700} size="lg">{job.djRef}</Text>
                  {job.returnVisit && <Badge color="orange" size="sm">Return Visit</Badge>}
                </Group>
                <Text fw={600}>{job.customerName ?? 'Unknown Customer'}</Text>
                {job.siteName && (
                  <Group gap="xs">
                    <IconMapPin size={14} />
                    <Text size="sm">{job.siteName}</Text>
                  </Group>
                )}
                {job.dateIn && (
                  <Group gap="xs">
                    <IconCalendar size={14} />
                    <Text size="sm">{new Date(job.dateIn).toLocaleDateString('en-GB')}</Text>
                    {dl != null && (
                      <Badge size="xs" color={dl < 0 ? 'red' : dl === 0 ? 'green' : 'gray'}>
                        {dl < 0 ? `${Math.abs(dl)}d ago` : dl === 0 ? 'Today' : `in ${dl}d`}
                      </Badge>
                    )}
                  </Group>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
}
