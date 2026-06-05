import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container, Title, Stack, Group, Button, Paper, Grid, TextInput,
  Select, Text,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { serviceQuotesApi } from 'src/api/service-operations';

export default function ServiceQuoteAddPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-populate from asset or live project if navigated from those pages
  const [customerName, setCustomerName] = useState(searchParams.get('customerName') ?? '');
  const [assetId, setAssetId] = useState(searchParams.get('assetId') ?? undefined);
  const [assetRef, setAssetRef] = useState(searchParams.get('assetRef') ?? '');
  const lqRef = searchParams.get('lqRef') ?? null;
  const [serviceCategory, setServiceCategory] = useState('');
  const [contractType, setContractType] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const quote = await serviceQuotesApi.create({ customerName, assetId, assetRef });
      // Patch service category + contract type if provided
      if (serviceCategory || contractType) {
        await serviceQuotesApi.update(quote.id, { serviceCategory, contractType });
      }
      navigate(`/dashboard/service-operations/${quote.id}`);
    } catch {
      setError('Failed to create service quote');
      setSaving(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group>
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/dashboard/service-operations')}>Back</Button>
          <Title order={2} fw={700}>New Service Quote</Title>
        </Group>

        {lqRef && (
          <Paper withBorder radius="md" p="sm" bg="violet.0">
            <Text size="sm">Creating service job from Live Project <strong>{lqRef}</strong>. Customer name is pre-filled.</Text>
          </Paper>
        )}

        <Paper withBorder radius="md" p="lg">
          <Stack gap="md">
            <Text fw={600} size="sm">Quote Details</Text>
            {error && <Text c="red" size="sm">{error}</Text>}
            <Grid gap="sm">
              <Grid.Col span={12}>
                <TextInput
                  label="Customer Name"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.currentTarget.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Asset Ref"
                  value={assetRef}
                  onChange={(e) => setAssetRef(e.currentTarget.value)}
                  description={assetId ? `Linked to asset ${assetId}` : undefined}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Service Category"
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.currentTarget.value)}
                  placeholder="e.g. Annual Service, Admin Access"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Contract Type"
                  clearable
                  data={[
                    { value: 'FULL', label: 'Full Service Contract' },
                    { value: 'MAINTENANCE', label: 'Maintenance Only' },
                    { value: 'INSPECTION', label: 'Inspection Only' },
                    { value: 'ADHOC', label: 'Ad Hoc' },
                  ]}
                  value={contractType || null}
                  onChange={(v) => setContractType(v ?? '')}
                />
              </Grid.Col>
            </Grid>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => navigate('/dashboard/service-operations')}>Cancel</Button>
              <Button onClick={submit} loading={saving}>Create Service Quote</Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
