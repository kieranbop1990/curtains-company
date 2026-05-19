import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

import type { Order } from 'src/types/order';
import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary: FC<OrderSummaryProps> = (props) => {
  const { order, ...other } = props;
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));


  const align = mdUp ? 'horizontal' : 'vertical';
  const createdAt = format(parseISO(order.createdAt), 'dd/MM/yyyy HH:mm');

  return (
    <Card {...other}>
      <CardHeader title="Basic info" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          label="Customer"
        >
          <Typography variant="subtitle2">
            {order.customer}
          </Typography>
        </PropertyListItem>
        <Divider />
        <PropertyListItem
          align={align}
          label="ID"
          value={order.id}
        />
        <Divider />
        <PropertyListItem
          align={align}
          label="Project Reference"
          value={order.projectReference}
        />
        <Divider />
        <PropertyListItem
          align={align}
          label="Project Name"
          value={order.projectName}
        />
        <Divider />
        <Divider />
        <PropertyListItem
            align={align}
            label="Quotation Reference"
            value={order.quotationNo}
        />
        <Divider />
        <PropertyListItem
            align={align}
            label="Order Date"
            value={createdAt}
        />
        <PropertyListItem
            align={align}
            label="Site Manager"
            value={order.siteContactManager}
        />
        <Divider />
        <PropertyListItem
            align={align}
            label="Site Supervisor"
            value={order.siteContactSupervisor}
        />
        <Divider />
        <PropertyListItem
            align={align}
            label="Status"
            value={order.status}
        />
        <Divider />
        <PropertyListItem
            align={align}
            label="Ordered items"
            value={order.items?.length.toString() || 'No current ordered items'}
        />
        <Divider />
      </PropertyList>
    </Card>
  );
};

OrderSummary.propTypes = {
  // @ts-ignore
  order: PropTypes.object.isRequired
};
