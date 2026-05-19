import type {ChangeEvent, FC, MouseEvent} from 'react';
import {Fragment, useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {Scrollbar} from 'src/components/scrollbar';
import type {Product} from 'src/types/product';

interface CategoryOption {
    label: string;
    value: string;
}

const categoryOptions: CategoryOption[] = [
    {
        label: 'Firesafe',
        value: 'firesafe'
    },
    {
        label: 'Enhanced',
        value: 'enhanced'
    },
    {
        label: 'Smoke',
        value: 'smoke'
    },
];

interface ProductListTableProps {
    count?: number;
    items?: Product[];
    onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    page?: number;
    rowsPerPage?: number;
}

export const ProductListTable: FC<ProductListTableProps> = (props) => {
    const {
        count = 0,
        items = [],
        onPageChange = () => {
        },
        onRowsPerPageChange,
        page = 0,
        rowsPerPage = 0
    } = props;
    const [currentProduct, setCurrentProduct] = useState<string | null>(null);

    const handleProductToggle = useCallback(
        (productId: string): void => {
            setCurrentProduct((prevProductId) => {
                if (prevProductId === productId) {
                    return null;
                }

                return productId;
            });
        },
        []
    );

    return (
        <div>
            <Scrollbar>
                <Table sx={{minWidth: 1200}}>
                    <TableHead>
                        <TableRow>
                            <TableCell/>
                            <TableCell width="100%">
                                Name
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((product) => {
                            const isCurrent = product.name === currentProduct;

                            return (
                                <Fragment key={product.name}>
                                    <TableRow
                                        hover
                                        key={product.name}
                                    >
                                        <TableCell
                                            padding="checkbox"
                                            sx={{
                                                ...(isCurrent && {
                                                    position: 'relative',
                                                    '&:after': {
                                                        position: 'absolute',
                                                        content: '" "',
                                                        top: 0,
                                                        left: 0,
                                                        backgroundColor: 'primary.main',
                                                        width: 3,
                                                        height: 'calc(100% + 1px)'
                                                    }
                                                })
                                            }}
                                            width="25%"
                                        >
                                            <IconButton onClick={() => handleProductToggle(product.name)}>
                                                <SvgIcon>
                                                    {isCurrent ? <ChevronDownIcon/> : <ChevronRightIcon/>}
                                                </SvgIcon>
                                            </IconButton>
                                        </TableCell>
                                        <TableCell width="25%">
                                            <Box
                                                sx={{
                                                    alignItems: 'center',
                                                    display: 'flex'
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        cursor: 'pointer',
                                                        ml: 2
                                                    }}
                                                >
                                                    <Typography variant="subtitle2">
                                                        {product.name}
                                                    </Typography>
                                                    <Typography
                                                        color="text.secondary"
                                                        variant="body2"
                                                    >
                                                        in {product.category}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    {isCurrent && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                sx={{
                                                    p: 0,
                                                    position: 'relative',
                                                    '&:after': {
                                                        position: 'absolute',
                                                        content: '" "',
                                                        top: 0,
                                                        left: 0,
                                                        backgroundColor: 'primary.main',
                                                        width: 3,
                                                        height: 'calc(100% + 1px)'
                                                    }
                                                }}
                                            >
                                                <CardContent>
                                                    <Grid
                                                        container
                                                        spacing={3}
                                                    >
                                                        <Grid
                                                            item
                                                            md={6}
                                                            xs={12}
                                                        >
                                                            <Typography variant="h6">
                                                                Basic details
                                                            </Typography>
                                                            <Divider sx={{my: 2}}/>
                                                            <Grid
                                                                container
                                                                spacing={3}
                                                            >
                                                                <Grid
                                                                    item
                                                                    md={6}
                                                                    xs={12}
                                                                >
                                                                    <TextField
                                                                        defaultValue={product.name}
                                                                        fullWidth
                                                                        label="Product name"
                                                                        name="name"
                                                                        disabled={true}
                                                                    />
                                                                </Grid>
                                                                <Grid
                                                                    item
                                                                    md={6}
                                                                    xs={12}
                                                                >
                                                                    <TextField
                                                                        defaultValue={product.category}
                                                                        fullWidth
                                                                        label="Category"
                                                                        select
                                                                    >
                                                                        {categoryOptions.map((option) => (
                                                                            <MenuItem
                                                                                disabled={true}
                                                                                key={option.value}
                                                                                value={option.value}
                                                                            >
                                                                                {option.label}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                                <Divider/>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
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
                rowsPerPageOptions={[25, 50]}
            />
        </div>
    );
};

ProductListTable.propTypes = {
    count: PropTypes.number,
    items: PropTypes.array,
    onPageChange: PropTypes.func,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number,
    rowsPerPage: PropTypes.number
};
