import { Group, Text, ThemeIcon, Anchor } from '@mantine/core';
import { IconChevronRight, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export type WorkflowStage =
  | 'quotes'
  | 'live-quotes'
  | 'survey-drawings'
  | 'production-pack'
  | 'manufacturing'
  | 'distribution'
  | 'asset';

interface StageStep {
  key: WorkflowStage;
  label: string;
  short: string;
  path?: string;
}

const LG_STAGES: StageStep[] = [
  { key: 'quotes', label: 'Quotes (S)', short: 'Q', path: '/dashboard/quotes' },
  { key: 'live-quotes', label: 'Live Quote (LQ)', short: 'LQ', path: '/dashboard/live-projects' },
  { key: 'survey-drawings', label: 'Survey & Drawings (SD)', short: 'SD' },
  { key: 'production-pack', label: 'Production Pack', short: 'PP', path: '/dashboard/production-packs' },
  { key: 'manufacturing', label: 'Manufacturing (MFG)', short: 'MFG', path: '/dashboard/manufacturing' },
  { key: 'distribution', label: 'Distribution', short: 'DIST', path: '/dashboard/distribution' },
  { key: 'asset', label: 'Asset (AST)', short: 'AST', path: '/dashboard/assets' },
];

interface StageProgressProps {
  current: WorkflowStage;
  flow?: 'LG';
}

export function StageProgress({ current, flow = 'LG' }: StageProgressProps) {
  const navigate = useNavigate();
  const stages = LG_STAGES;
  const currentIdx = stages.findIndex(s => s.key === current);

  return (
    <Group gap={4} wrap="nowrap" style={{ overflowX: 'auto' }}>
      {stages.map((stage, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const clickable = !!stage.path && done;
        return (
          <Group key={stage.key} gap={4} wrap="nowrap">
            <Group gap={6} wrap="nowrap"
              style={{ cursor: clickable ? 'pointer' : undefined }}
              onClick={clickable ? () => navigate(stage.path!) : undefined}>
              {done && (
                <ThemeIcon size="xs" radius="xl" color="green" variant="filled">
                  <IconCheck size={8} />
                </ThemeIcon>
              )}
              {active && (
                <ThemeIcon size="xs" radius="xl" color="blue" variant="filled">
                  <Text size="xs" c="white" fw={700} lh={1}>{i + 1}</Text>
                </ThemeIcon>
              )}
              {!done && !active && (
                <ThemeIcon size="xs" radius="xl" color="gray" variant="light">
                  <Text size="xs" c="dimmed" fw={700} lh={1}>{i + 1}</Text>
                </ThemeIcon>
              )}
              {clickable ? (
                <Anchor size="xs" c="green" fw={active ? 700 : 400} style={{ whiteSpace: 'nowrap' }}>
                  {stage.short}
                </Anchor>
              ) : (
                <Text size="xs" c={active ? 'blue' : done ? 'green' : 'dimmed'}
                  fw={active ? 700 : 400} style={{ whiteSpace: 'nowrap' }}>
                  {stage.short}
                </Text>
              )}
            </Group>
            {i < stages.length - 1 && (
              <IconChevronRight size={12} color="var(--mantine-color-gray-4)" />
            )}
          </Group>
        );
      })}
    </Group>
  );
}
