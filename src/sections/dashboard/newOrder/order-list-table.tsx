import type {ChangeEvent, FC, MouseEvent} from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import ReceiptIcon from '@mui/icons-material/Receipt';
import {RouterLink} from 'src/components/router-link';
import {Scrollbar} from 'src/components/scrollbar';
import {paths} from 'src/paths';
import type {Order, OrderStatus} from 'src/types/order';
import {useNavigate} from "react-router";

interface OrderListTableProps {
    count?: number;
    items?: Order[];
    onDeselectAll?: () => void;
    onDeselectOne?: (orderId: string) => void;
    onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onSelectAll?: () => void;
    onSelectOne?: (orderId: string) => void;
    page?: number;
    rowsPerPage?: number;
    selected?: string[];
}

export const OrderListTable: FC<OrderListTableProps> = (props) => {
    const {
        count = 0,
        items = [],
        onPageChange = () => {
        },
        onRowsPerPageChange,
        page = 0,
        rowsPerPage = 0,
        selected = []
    } = props;
    const navigate = useNavigate();

    const calculateDaysDifference = (dateStr: string): number => {
        const date = new Date(dateStr);
        const now = new Date();

        // Get the difference in milliseconds
        const difference = now.getTime() - date.getTime();

        // Convert the difference to days and return
        return Math.floor(difference / (1000 * 60 * 60 * 24));
    };

    const getStatusIconAndLink = (status: OrderStatus | undefined, id: string) => {
        let icon, link;

        switch (status) {
            case 'PENDING':
                icon = <PendingActionsIcon />;
                link = paths.dashboard.orders.pending.replace(':orderId', id);
                break;
            case 'PRODUCTION_SPECIFICATION':
                icon = <ArchitectureIcon />;
                link = paths.dashboard.orders.production_specification.replace(':orderId', id);
                break;
            case 'PRODUCTION_READY':
                icon = <BuildCircleIcon />;
                link = paths.dashboard.orders.production.replace(':orderId', id);
                break;
            case 'BOOKING':
                icon = <CalendarMonthIcon />;
                link = paths.dashboard.orders.booking.replace(':orderId', id);
                break;
            case 'INSTALLATION':
                icon = <InstallDesktopIcon />;
                link = paths.dashboard.orders.installation.replace(':orderId', id);
                break;
            case 'INVOICE':
                icon = <ReceiptIcon />;
                link = paths.dashboard.orders.invoice.replace(':orderId', id);
                break;
            default:
                return null;
        }

        return (
            <Link
                color="inherit"
                component={RouterLink}
                href={link}
                variant="subtitle2"
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                {icon}
                <Typography sx={{ ml: 1 }}>{status}</Typography>
            </Link>
        );
    };

    return (
        <Box sx={{position: 'relative'}}>
            <Scrollbar>
                <Table sx={{minWidth: 700}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Order Date
                            </TableCell>
                            <TableCell>
                                Quotation Number
                            </TableCell>
                            <TableCell>
                                Quotation Reference
                            </TableCell>
                            <TableCell>
                                Project Name
                            </TableCell>
                            <TableCell>
                                Status
                            </TableCell>
                            <TableCell>
                                Time in status
                            </TableCell>
                            <TableCell align="right">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((order) => {
                            const isSelected = selected.includes(order.id);

                            return (
                                <TableRow
                                    hover
                                    key={order.id}
                                    selected={isSelected}
                                >
                                    <TableCell>
                                        {order.orderDate}
                                    </TableCell>
                                    <TableCell>
                                        {order.quotationNo}
                                    </TableCell>
                                    <TableCell>
                                        <Stack
                                            alignItems="center"
                                            direction="row"
                                            spacing={1}
                                        >
                                            <div>
                                                <Link
                                                    color="inherit"
                                                    component={RouterLink}
                                                    href={paths.dashboard.orders.details.replace(':orderId', order.id)}
                                                    variant="subtitle2"
                                                >
                                                    {order.projectReference}
                                                </Link>
                                                <Typography
                                                    color="text.secondary"
                                                    variant="body2"
                                                >
                                                    {order.customer}
                                                </Typography>
                                            </div>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {order.projectName}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Box>{getStatusIconAndLink(order.status, order.id)}</Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {calculateDaysDifference(order.updatedAt)} days ago
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            component={RouterLink}
                                            href={paths.dashboard.orders.edit.replace(':orderId', order.id)}
                                        >
                                            <SvgIcon>
                                                <Edit02Icon/>
                                            </SvgIcon>
                                        </IconButton>
                                        <IconButton
                                            onClick={() => navigate(paths.dashboard.fileManager.index, { state: { orderId: order.id, customer: order.customer } })}
                                        >
                                            <SvgIcon>
                                                <CloudDownloadIcon/>
                                            </SvgIcon>
                                        </IconButton>
                                        <IconButton
                                            component={RouterLink}
                                            href={paths.dashboard.orders.details.replace(':orderId', order.id)}
                                        >
                                            <SvgIcon>
                                                <ArrowRightIcon/>
                                            </SvgIcon>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Scrollbar>
            <TablePagination
                component="div"
                count={count}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Box>
    );
};

OrderListTable.propTypes = {
    count: PropTypes.number,
    items: PropTypes.array,
    onDeselectAll: PropTypes.func,
    onDeselectOne: PropTypes.func,
    onPageChange: PropTypes.func,
    onRowsPerPageChange: PropTypes.func,
    onSelectAll: PropTypes.func,
    onSelectOne: PropTypes.func,
    page: PropTypes.number,
    rowsPerPage: PropTypes.number,
    selected: PropTypes.array
};
