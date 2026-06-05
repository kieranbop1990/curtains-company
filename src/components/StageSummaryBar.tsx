import { Group, Paper, ThemeIcon, Text, Button } from '@mantine/core';
import { IconCheck, IconAlertCircle, IconArrowRight } from '@tabler/icons-react';

export interface GateItem {
  label: string;
  passed: boolean;
}

interface StageSummaryBarProps {
  gates: GateItem[];
  actionLabel: string;
  onAction: () => void;
  actionLoading?: boolean;
  actionColor?: string;
  actionDisabledOverride?: boolean;
}

export function StageSummaryBar({
  gates, actionLabel, onAction, actionLoading, actionColor = 'blue', actionDisabledOverride,
}: StageSummaryBarProps) {
  const allPassed = gates.every(g => g.passed);
  const disabled = actionDisabledOverride ?? !allPassed;
  return (
    <Paper withBorder radius="md" p="md"
      style={{ borderColor: allPassed ? 'var(--mantine-color-green-4)' : 'var(--mantine-color-gray-3)' }}>
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="lg" wrap="wrap">
          {gates.map(g => (
            <Group key={g.label} gap={6}>
              <ThemeIcon size="xs" radius="xl" color={g.passed ? 'green' : 'red'} variant="light">
                {g.passed ? <IconCheck size={10} /> : <IconAlertCircle size={10} />}
              </ThemeIcon>
              <Text size="xs" c={g.passed ? 'dimmed' : 'red'}>{g.label}</Text>
            </Group>
          ))}
        </Group>
        <Button
          color={actionColor}
          size="sm"
          disabled={disabled}
          loading={actionLoading}
          leftSection={<IconArrowRight size={14} />}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </Group>
    </Paper>
  );
}
