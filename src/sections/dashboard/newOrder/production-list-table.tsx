import {ChangeEvent, FC, MouseEvent} from 'react';
import {Fragment, useState} from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import {Scrollbar} from 'src/components/scrollbar';
import {SeverityPill} from 'src/components/severity-pill';
import {OrderInformation} from "../../../types/order";

interface ProductionListTableProps {
    count?: number;
    items?: OrderInformation[];
    onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onSelect?: (orderId: string) => void;
    page?: number;
    rowsPerPage?: number;
}

export const ProductionListTable: FC<ProductionListTableProps> = (props) => {
    const {
        count = 0,
        items = [],
        onPageChange = () => {
        },
        onRowsPerPageChange,
        onSelect,
        page = 0,
        rowsPerPage = 0
    } = props;

    return (
        <div>
            <Scrollbar>
                <Table sx={{minWidth: 1200}}>
                    <TableHead>
                        <TableRow>
                            <TableCell width="25%">
                                Item Reference
                            </TableCell>
                            <TableCell width="25%">
                                Quantity
                            </TableCell>
                            <TableCell width="25%">
                                Order Status
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((product) => {
                            const statusColor = product.production ? 'success' : 'info';
                            const statusText = product.production ? 'Completed' : 'Pending';
                            return (
                                    <TableRow
                                        hover
                                        key={product.id}
                                        onClick={() => onSelect?.(product.id)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                Item reference : {product.reference}
                                            </Typography>
                                        </TableCell>
                                        <TableCell width="25%">
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                {product.itemQuantity}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <SeverityPill color={statusColor}>
                                                {statusText}
                                            </SeverityPill>
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
        </div>
    );
};

ProductionListTable.propTypes = {
    count: PropTypes.number,
    items: PropTypes.array,
    onPageChange: PropTypes.func,
    onRowsPerPageChange: PropTypes.func,
    onSelect: PropTypes.func,
    page: PropTypes.number,
    rowsPerPage: PropTypes.number
};
