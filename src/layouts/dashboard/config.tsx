import type { ReactNode } from 'react';
import { useMemo } from 'react';
import SvgIcon from '@mui/material/SvgIcon';

import CalendarIcon from 'src/icons/untitled-ui/duocolor/calendar';
import File01Icon from 'src/icons/untitled-ui/duocolor/file-01';
import HomeSmileIcon from 'src/icons/untitled-ui/duocolor/home-smile';
import ShoppingBag03Icon from 'src/icons/untitled-ui/duocolor/shopping-bag-03';
import Upload04Icon from 'src/icons/untitled-ui/duocolor/upload-04';
import Users03Icon from 'src/icons/untitled-ui/duocolor/users-03';
import { paths } from 'src/paths';

export interface Item {
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  items?: Item[];
  label?: ReactNode;
  path?: string;
  title: string;
}

export interface Section {
  items: Item[];
  subheader?: string;
}

export const useSections = () => {
  return useMemo(() => [
    {
      items: [
        {
          title: 'Operations Dashboard',
          path: paths.dashboard.operations.index,
          icon: <SvgIcon fontSize="small"><HomeSmileIcon /></SvgIcon>
        }
      ]
    },
    {
      subheader: 'CRM',
      items: [
        {
          title: 'Quote Pipeline',
          path: paths.dashboard.quotes.index,
          icon: <SvgIcon fontSize="small"><File01Icon /></SvgIcon>
        },
        {
          title: 'Live Projects',
          path: paths.dashboard.liveProjects.index,
          icon: <SvgIcon fontSize="small"><Upload04Icon /></SvgIcon>
        },
        {
          title: 'Service Operations',
          path: paths.dashboard.serviceOperations.index,
          icon: <SvgIcon fontSize="small"><CalendarIcon /></SvgIcon>
        },
        {
          title: 'Asset Management',
          path: paths.dashboard.assets.index,
          icon: <SvgIcon fontSize="small"><ShoppingBag03Icon /></SvgIcon>
        },
      ]
    },
    {
      subheader: 'Production',
      items: [
        {
          title: 'Manufacturing',
          path: paths.dashboard.manufacturing.index,
          icon: <SvgIcon fontSize="small"><ShoppingBag03Icon /></SvgIcon>
        },
        {
          title: 'Distribution',
          path: paths.dashboard.distribution.index,
          icon: <SvgIcon fontSize="small"><Upload04Icon /></SvgIcon>
        },
        {
          title: 'Installation Calendar',
          path: paths.dashboard.operations.calendar,
          icon: <SvgIcon fontSize="small"><CalendarIcon /></SvgIcon>
        },
      ]
    },
    {
      subheader: 'Admin',
      items: [
        {
          title: 'Staff Directory',
          path: paths.dashboard.admin.staff,
          icon: <SvgIcon fontSize="small"><Users03Icon /></SvgIcon>
        },
        {
          title: 'Parts Library',
          path: paths.dashboard.admin.parts,
          icon: <SvgIcon fontSize="small"><ShoppingBag03Icon /></SvgIcon>
        },
      ]
    },
  ], []);
};
