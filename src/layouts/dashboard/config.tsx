import { useMemo } from 'react';
import {
  IconLayoutDashboard,
  IconFileDescription,
  IconClipboardList,
  IconClipboardCheck,
  IconTool,
  IconBuildingFactory2,
  IconTruck,
  IconPackage,
  IconCalendar,
  IconUsers,
  IconPuzzle,
  IconHelp,
  IconBell,
  IconChecklist,
  IconCircleCheck,
  IconMessage,
  IconSettings,
  IconChartBar,
  IconFolderOpen,
  IconCurrencyPound,
  IconCrane,
  IconBoxSeam,
  IconArrowsTransferDown,
} from '@tabler/icons-react';
import { paths } from 'src/paths';

export interface Item {
  disabled?: boolean;
  external?: boolean;
  icon?: React.ReactNode;
  items?: Item[];
  label?: React.ReactNode;
  path?: string;
  title: string;
}

export interface Section {
  items: Item[];
  subheader?: string;
}

export const useSections = () => {
  return useMemo<Section[]>(() => [
    {
      items: [
        {
          title: 'Dashboard',
          path: paths.dashboard.operations.index,
          icon: <IconLayoutDashboard size={20} />,
        },
      ],
    },
    {
      subheader: 'LG — Installations',
      items: [
        {
          title: 'Quotes (S)',
          path: paths.dashboard.quotes.index,
          icon: <IconFileDescription size={20} />,
        },
        {
          title: 'Live Quotes (LQ)',
          path: paths.dashboard.liveProjects.index,
          icon: <IconClipboardList size={20} />,
        },
        {
          title: 'Manufacturing (MFG)',
          path: paths.dashboard.manufacturing.index,
          icon: <IconBuildingFactory2 size={20} />,
        },
        {
          title: 'Collection (6A)',
          path: `${paths.dashboard.distribution.index}?type=COLLECTION`,
          icon: <IconBoxSeam size={20} />,
        },
        {
          title: 'Delivery (6B)',
          path: `${paths.dashboard.distribution.index}?type=DELIVERY`,
          icon: <IconTruck size={20} />,
        },
        {
          title: 'Live (6C)',
          path: `${paths.dashboard.distribution.index}?type=INSTALLATION`,
          icon: <IconArrowsTransferDown size={20} />,
        },
      ],
    },
    {
      subheader: 'LS — Services',
      items: [
        {
          title: 'Services (LS)',
          path: paths.dashboard.serviceOperations.index,
          icon: <IconClipboardCheck size={20} />,
        },
        {
          title: 'Assets (AST)',
          path: paths.dashboard.assets.index,
          icon: <IconPackage size={20} />,
        },
      ],
    },
    {
      subheader: 'Operations',
      items: [
        {
          title: 'Operations (Live)',
          path: paths.dashboard.operations.index,
          icon: <IconChartBar size={20} />,
        },
        {
          title: 'Calendar',
          path: paths.dashboard.operations.calendar,
          icon: <IconCalendar size={20} />,
        },
        {
          title: 'Access Equipment',
          path: paths.dashboard.operations.index,
          icon: <IconCrane size={20} />,
          disabled: true,
        },
      ],
    },
    {
      subheader: 'Finance & Docs',
      items: [
        {
          title: 'Finance',
          path: paths.dashboard.operations.index,
          icon: <IconCurrencyPound size={20} />,
          disabled: true,
        },
        {
          title: 'Documents',
          path: paths.dashboard.operations.index,
          icon: <IconFolderOpen size={20} />,
          disabled: true,
        },
        {
          title: 'Reports',
          path: paths.dashboard.operations.index,
          icon: <IconChartBar size={20} />,
          disabled: true,
        },
      ],
    },
    {
      subheader: 'Workspace',
      items: [
        {
          title: 'Alerts',
          path: paths.dashboard.operations.index,
          icon: <IconBell size={20} />,
          disabled: true,
        },
        {
          title: 'Tasks',
          path: paths.dashboard.operations.index,
          icon: <IconChecklist size={20} />,
          disabled: true,
        },
        {
          title: 'Approvals',
          path: paths.dashboard.operations.index,
          icon: <IconCircleCheck size={20} />,
          disabled: true,
        },
        {
          title: 'Messages',
          path: paths.dashboard.operations.index,
          icon: <IconMessage size={20} />,
          disabled: true,
        },
      ],
    },
    {
      subheader: 'Admin',
      items: [
        {
          title: 'Staff Directory',
          path: paths.dashboard.admin.staff,
          icon: <IconUsers size={20} />,
        },
        {
          title: 'Parts Library',
          path: paths.dashboard.admin.parts,
          icon: <IconPuzzle size={20} />,
        },
        {
          title: 'Settings',
          path: paths.dashboard.operations.index,
          icon: <IconSettings size={20} />,
          disabled: true,
        },
      ],
    },
    {
      items: [
        {
          title: 'How It Works',
          path: paths.howTo,
          icon: <IconHelp size={20} />,
        },
      ],
    },
  ], []);
};
