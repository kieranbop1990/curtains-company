import type {FC} from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';


import {Scrollbar} from 'src/components/scrollbar';
import {OrderInformation} from "src/types/order";
import IconButton from '@mui/material/IconButton';

interface OrderItemsProps {
    items: OrderInformation[];
    removeItem?: (id: string) => void;
    allowDelete?: boolean;
}

export const OrderItems: FC<OrderItemsProps> = (props) => {
    const {items, allowDelete, removeItem} = props;

    return (
        <Card>
            <CardHeader title="Order items"/>
            <Scrollbar>
                <Box sx={{minWidth: 700}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    Reference
                                </TableCell>
                                <TableCell>
                                    Description
                                </TableCell>
                                <TableCell>
                                    Item Quantity
                                </TableCell>
                                <TableCell>
                                    Cost
                                </TableCell>
                                <TableCell>
                                    Extras
                                </TableCell>
                                {props.allowDelete && (
                                <TableCell>
                                    Remove
                                </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => {
                                const description = `${item.itemName} - width: ${item.width}, drop: ${item.drop}`;
                                const cost = numeral(item.cost).format('£0,0.00');
                                const extras = item.extras?.map(product => `${product.productName} - Quantity: ${product.quantity}`).join('\n');

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {item.reference}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2">
                                                {description}
                                            </Typography>
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
                                        {props.allowDelete && (
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => props.removeItem && props.removeItem(item.id)}>
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </TableCell>
                                        )}
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
                onPageChange={(): void => {
                }}
                onRowsPerPageChange={(): void => {
                }}
                page={0}
                rowsPerPage={5}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Card>
    );
};

OrderItems.propTypes = {
    items: PropTypes.array.isRequired,
    allowDelete: PropTypes.bool
};
