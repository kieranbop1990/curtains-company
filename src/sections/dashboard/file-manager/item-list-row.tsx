import type { FC } from 'react';

import { format } from 'date-fns';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { UploadedItem } from 'src/types/file-manager';
import { bytesToSize } from 'src/utils/bytes-to-size';

import { ItemIcon } from './item-icon';
import {paths} from "../../../paths";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import {useNavigate} from "react-router";

interface ItemListRowProps {
  item: UploadedItem;
  onOpen?: (itemId: string) => void;
}

export const ItemListRow: FC<ItemListRowProps> = (props) => {
  const navigate = useNavigate();
  const { item, onOpen } = props;
  let size = bytesToSize(item.size!);

  const uploadedAt = item.lastModified && format(item.lastModified, 'MMM dd, yyyy');

  const handleItemClick = () => {
    navigate(paths.dashboard.fileManager.doc.replace(':itemViewer', item.id!), { state: { item } });
  };

  return (
    <>
      <TableRow
        key={item.id}
        sx={{
          backgroundColor: 'transparent',
          borderRadius: 1.5,
          boxShadow: 0,
          transition: (theme) => theme.transitions.create(
            ['background-color', 'box-shadow'],
            {
              easing: theme.transitions.easing.easeInOut,
              duration: 200
            }
          ),
          '&:hover': {
            backgroundColor: 'background.paper',
            boxShadow: 16
          },
          [`& .${tableCellClasses.root}`]: {
            borderBottomWidth: 1,
            borderBottomColor: 'divider',
            borderBottomStyle: 'solid',
            borderTopWidth: 1,
            borderTopColor: 'divider',
            borderTopStyle: 'solid',
            '&:first-of-type': {
              borderTopLeftRadius: (theme) => theme.shape.borderRadius * 1.5,
              borderBottomLeftRadius: (theme) => theme.shape.borderRadius * 1.5,
              borderLeftWidth: 1,
              borderLeftColor: 'divider',
              borderLeftStyle: 'solid'
            },
            '&:last-of-type': {
              borderTopRightRadius: (theme) => theme.shape.borderRadius * 1.5,
              borderBottomRightRadius: (theme) => theme.shape.borderRadius * 1.5,
              borderRightWidth: 1,
              borderRightColor: 'divider',
              borderRightStyle: 'solid'
            }
          }
        }}
      >
        <TableCell>
          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
          >
            <Box
              onClick={() => onOpen?.(item.id!)}
              sx={{ cursor: 'pointer' }}
            >
              <ItemIcon
                type={'file'}
                extension={item.extension}
              />
            </Box>
            <div>
              <Typography
                noWrap
                onClick={() => onOpen?.(item.id!)}
                sx={{ cursor: 'pointer' }}
                variant="subtitle2"
              >
                {item.id}
              </Typography>
              <Typography
                color="text.secondary"
                noWrap
                variant="body2"
              >
                {size}
              </Typography>
            </div>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography
            noWrap
            variant="subtitle2"
          >
            Uploaded at
          </Typography>
          <Typography
            color="text.secondary"
            noWrap
            variant="body2"
          >
            {uploadedAt}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <IconButton
              onClick={handleItemClick}
          >
            <SvgIcon>
              <ArrowRightIcon/>
            </SvgIcon>
          </IconButton>
        </TableCell>
      </TableRow>
    </>
  );
};

ItemListRow.propTypes = {
  // @ts-ignore
  item: PropTypes.object.isRequired,
  onOpen: PropTypes.func
};
