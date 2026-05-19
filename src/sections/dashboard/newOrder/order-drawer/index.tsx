import type {FC} from 'react';
import PropTypes from 'prop-types';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import useMediaQuery from '@mui/material/useMediaQuery';
import type {Theme} from '@mui/material/styles/createTheme';
import {Box, Typography} from '@mui/material';
import {OrderDetails} from './order-details';
import {OrderInformation} from "../../../../types/order";
import {updateOrderItemProduction} from "../../../../api/order/calls";


interface OrderDrawerProps {
    container?: HTMLDivElement | null;
    open?: boolean;
    onClose?: () => void;
    orderId?: string;
    order: OrderInformation;
}

export const OrderDrawer: FC<OrderDrawerProps> = (props) => {
    const {container, onClose, open} = props;
    const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

    const handleApprove = () => {
        return async () => {
            await updateOrderItemProduction(props.order.orderId, props.order)
            if (onClose) {
                onClose();
            }
        }
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
                    {props.order.itemName}
                </Typography>
                <IconButton
                    color="inherit"
                    onClick={onClose}
                >
                    <SvgIcon>
                        <XIcon/>
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
                        onApprove={handleApprove()}
                        onReject={handleReject()}
                        orderId={props.orderId!}
                        order={props.order}
                    />
                </Box>
        </div>
    );

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
                SlideProps={{container}}
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
            SlideProps={{container}}
            variant="temporary"
        >
            {content}
        </Drawer>
    );
};

OrderDrawer.propTypes = {
    container: PropTypes.any,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    orderId: PropTypes.string,
    // @ts-ignore
    order: PropTypes.object
};
