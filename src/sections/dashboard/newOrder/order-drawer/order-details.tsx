import type { FC } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';
import { OrderInformation } from 'src/types/order';

interface OrderDetailsProps {
  onApprove?: () => void;
  onReject?: () => void;
  orderId: string;
  order: OrderInformation;
}

export const OrderDetails: FC<OrderDetailsProps> = (props) => {
  const { onApprove, onReject, orderId, order } = props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const align = lgUp ? 'horizontal' : 'vertical';

  return (
      <Stack spacing={6}>
        <Stack spacing={3}>
          <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              spacing={3}
          >
            <Typography variant="h6">
              Details
            </Typography>
          </Stack>
          <PropertyList>
            <PropertyListItem
                align={align}
                disableGutters
                divider
                label="Item"
                value={order.itemName}
            />
            <PropertyListItem
                align={align}
                disableGutters
                divider
                label="Quantity"
                value={String(order.itemQuantity)}
            />
            <PropertyListItem
                align={align}
                disableGutters
                divider
                label="Drop"
                value={`${String(order.drop)} mm`}
            />
            <PropertyListItem
                align={align}
                disableGutters
                divider
                label="Width"
                value={`${String(order.width)} mm`}
            />
            <PropertyListItem
                align={align}
                disableGutters
                divider
                label="Cost"
                value={`£${String(order.cost)}`}
            />
          </PropertyList>
          <Stack
              alignItems="center"
              direction="row"
              flexWrap="wrap"
              justifyContent="flex-end"
              spacing={2}
          >
            {
                !props.order.production &&
                <Stack
                    alignItems="center"
                    direction="row"
                    flexWrap="wrap"
                    justifyContent="flex-end"
                    spacing={2}
                >
                  <Button
                      onClick={onApprove}
                      size="small"
                      variant="contained"
                  >
                    Approve
                  </Button>
                  <Button
                      color="error"
                      onClick={onReject}
                      size="small"
                      variant="outlined"
                  >
                    Cancel
                  </Button>
                </Stack>
            }
          </Stack>
        </Stack>
      </Stack>
  );
};


OrderDetails.propTypes = {
  onApprove: PropTypes.func,
  onEdit: PropTypes.func,
  onReject: PropTypes.func,
  // @ts-ignore
  orderId: PropTypes.string,
  // @ts-ignore
  order: PropTypes.object
};
