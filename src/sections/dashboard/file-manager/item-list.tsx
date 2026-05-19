import type {ChangeEvent, FC, MouseEvent} from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';

import {Scrollbar} from 'src/components/scrollbar';
import type {UploadedItem} from 'src/types/file-manager';

import {ItemListRow} from './item-list-row';

type View = 'grid' | 'list';

interface ItemListProps {
    count?: number;
    items?: UploadedItem[];
    onDelete?: (itemId: string) => void;
    onOpen?: (itemId: string) => void;
    onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
    onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    page?: number;
    rowsPerPage?: number;
    view?: View;
}

export const ItemList: FC<ItemListProps> = (props) => {
    const {
        count = 0,
        items = [],
        onDelete,
        onOpen,
        onPageChange = () => {
        },
        onRowsPerPageChange,
        page = 0,
        rowsPerPage = 0,
        view = 'grid'
    } = props;

    const content: JSX.Element = (
        <Box sx={{m: -3}}>
            <Scrollbar>
                <Box sx={{p: 3}}>
                    <Table
                        sx={{
                            minWidth: 600,
                            borderCollapse: 'separate',
                            borderSpacing: '0 8px'
                        }}
                    >
                        <TableBody>
                            {items.map((item) => (
                                <ItemListRow
                                    key={item.id}
                                    item={item}
                                    onOpen={onOpen}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Scrollbar>
        </Box>
    );


    return (
        <Stack spacing={4}>
            {content}
            <TablePagination
                component="div"
                count={count}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[9, 18]}
            />
        </Stack>
    );
};

ItemList.propTypes = {
    items: PropTypes.array,
    count: PropTypes.number,
    onOpen: PropTypes.func,
    onPageChange: PropTypes.func,
    onRowsPerPageChange: PropTypes.func,
    page: PropTypes.number,
    rowsPerPage: PropTypes.number,
    view: PropTypes.oneOf<View>(['grid', 'list'])
};
