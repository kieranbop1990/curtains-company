import type {FC} from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {Scrollbar} from 'src/components/scrollbar';
import {OrderInformation} from "src/types/order";
import React from "react";

interface OrderSpecificationProps {
    items: OrderInformation[];
    onSelect?: (orderId: string) => void;
}

export const OrderSpecification: FC<OrderSpecificationProps> = (props) => {
    const {items, onSelect} = props;

    const hasProductionSpecification = items.some(item => item.productionSpecification !== null);

    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Scrollbar>
                <Box sx={{ minWidth: 700 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ maxWidth: 100 }}>
                                    Reference
                                </TableCell>
                                <TableCell sx={{ minWidth: 150 }}>
                                    Product
                                </TableCell>
                                <TableCell sx={{ maxWidth: 50 }}>
                                    Overall width
                                </TableCell>
                                <TableCell sx={{ maxWidth: 50 }}>
                                    Overall height
                                </TableCell>
                                <TableCell sx={{ maxWidth: 51 }}>
                                    Item Quantity
                                </TableCell>
                                <TableCell sx={{ maxWidth: 20 }}>
                                    Cost
                                </TableCell>
                                <TableCell sx={{ maxWidth: 200 }}>
                                    Extras
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => {
                                const cost = numeral(item.cost).format('£0,0.00');
                                const extras = item.extras?.map(product => `${product.productName} - Quantity: ${product.quantity}`).join('\n');

                                return (
                                    <TableRow
                                        hover
                                        key={item.id}
                                        onClick={() => onSelect?.(item.id)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>
                                            {item.reference}
                                        </TableCell>
                                        <TableCell>
                                            {item.itemName}
                                        </TableCell>
                                        <TableCell>
                                            {item.width}
                                        </TableCell>
                                        <TableCell>
                                            {item.drop}
                                        </TableCell>
                                        <TableCell>
                                            {item.itemQuantity}
                                        </TableCell>
                                        <TableCell>
                                            {cost}
                                        </TableCell>
                                        <TableCell>
                                            {extras?.split('\n').map((line, idx) => (
                                                <Typography key={idx} variant="body2">
                                                    {line}
                                                </Typography>
                                            ))}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Box>
            </Scrollbar>
            <TablePagination
                component="div"
                count={items.length}
                onPageChange={(): void => {}}
                onRowsPerPageChange={(): void => {}}
                page={0}
                rowsPerPage={5}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Card>
    );
};

OrderSpecification.propTypes = {
    items: PropTypes.array.isRequired,
    onSelect: PropTypes.func,
};
