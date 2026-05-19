import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Stack, Paper, Grid, TextInput, Select, Button, Group, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { assetsApi } from 'src/api/assets';

export default function AssetAddPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: '', siteName: '', siteAddress: '', systemType: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.customerName.trim()) { setError('Customer name is required'); return; }
    setSaving(true);
    try {
      const asset = await assetsApi.createAsset(form);
      navigate(`/dashboard/assets/${asset.id}`);
    } catch (e: any) { setError(e.message); setSaving(false); }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={2} fw={700}>Add Asset</Title>
        {error && <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>}
        <Paper withBorder radius="md" p="lg">
          <Grid gap="md">
            <Grid.Col span={6}>
              <TextInput label="Customer Name" required value={form.customerName} onChange={set('customerName')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Site Name" value={form.siteName} onChange={set('siteName')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput label="Site Address" value={form.siteAddress} onChange={set('siteAddress')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="System Type" value={form.systemType} onChange={set('systemType')} />
            </Grid.Col>
          </Grid>
        </Paper>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => navigate('/dashboard/assets')}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Create Asset</Button>
        </Group>
      </Stack>
    </Container>
  );
}
