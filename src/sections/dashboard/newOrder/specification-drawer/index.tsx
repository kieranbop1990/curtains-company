import type { FC } from 'react';
import PropTypes from 'prop-types';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { OrderDetails } from './order-details';
import {OrderInformation, OrderSpecificationExtras} from "src/types/order";
import { updateOrderItemProduction } from 'src/api/order/calls';

interface SpecificationDrawerProps {
  container?: HTMLDivElement | null;
  open?: boolean;
  onClose?: () => void;
  order?: OrderInformation;
}

export const SpecificationDrawer: FC<SpecificationDrawerProps> = (props) => {
  const { container, onClose, open, order } = props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

    const handleApprove = (details: OrderSpecificationExtras) => {
        return async () => {
            if (order) {
                // Merging the details into the order
                const updatedOrder: OrderInformation = {
                    ...order,
                    productionSpecification: details
                };
                await updateOrderItemProduction(updatedOrder.orderId, updatedOrder);
            }

            if (onClose) {
                onClose();
            }
        };
    }


    const handleReject = () => {
        return () => {
            console.log('Rejected', props.order);
            if (onClose) {
                onClose();
            }
        }
    }

  let content: JSX.Element | null = null;

  if (order) {
    content = (
      <div>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          sx={{
            px: 3,
            py: 2
          }}
        >
          <Typography
            color="inherit"
            variant="h6"
          >
            {order.id}
          </Typography>
          <IconButton
            color="inherit"
            onClick={onClose}
          >
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <Box
          sx={{
            px: 3,
            py: 4
          }}
        >
            <OrderDetails
                onApprove={(details) => handleApprove(details)()}
                onReject={handleReject()}
                order={order}
            />
        </Box>
      </div>
    );
  }

  if (lgUp) {
    return (
      <Drawer
        anchor="right"
        open={open}
        PaperProps={{
          sx: {
            position: 'relative',
            width: 500
          }
        }}
        SlideProps={{ container }}
        variant="persistent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      hideBackdrop
      ModalProps={{
        container,
        sx: {
          pointerEvents: 'none',
          position: 'absolute'
        }
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: 400,
          pointerEvents: 'auto',
          position: 'absolute'
        }
      }}
      SlideProps={{ container }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

SpecificationDrawer.propTypes = {
  container: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  // @ts-ignore
  order: PropTypes.object
};
