import type {FC} from 'react';
import {useCallback} from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import {useAuth} from 'src/hooks/use-auth';
import {useRouter} from 'src/hooks/use-router';
import {paths} from 'src/paths';
import {Issuer} from 'src/utils/auth';

interface AccountPopoverProps {
    anchorEl: null | Element;
    onClose?: () => void;
    open?: boolean;
}

export const AccountPopover: FC<AccountPopoverProps> = (props) => {
    const {anchorEl, onClose, open, ...other} = props;
    const router = useRouter();
    const auth = useAuth();
    const { user } = useAuth();

    const handleLogout = useCallback(
        async (): Promise<void> => {
            try {
                onClose?.();

                switch (auth.issuer) {
                    case Issuer.Amplify: {
                        await auth.signOut();
                        break;
                    }

                    default: {
                        console.warn('Using an unknown Auth Issuer, did not log out');
                    }
                }

                window.location.href = paths.index;
            } catch (err) {
                console.error(err);
                toast.error('Something went wrong!');
            }
        },
        [auth, router, onClose]
    );

    return (
        <Popover
            anchorEl={anchorEl}
            anchorOrigin={{
                horizontal: 'center',
                vertical: 'bottom'
            }}
            disableScrollLock
            onClose={onClose}
            open={!!open}
            PaperProps={{sx: {width: 200}}}
            {...other}
        >
            <Box sx={{p: 2}}>
                <Typography variant="body1">
                    {user?.name} {user?.surname}
                </Typography>
                <Typography
                    color="text.secondary"
                    variant="body2"
                >
                    {user?.email}
                </Typography>
            </Box>
            <Divider/>
            <Divider sx={{my: '0 !important'}}/>
            <Box
                sx={{
                    display: 'flex',
                    p: 1,
                    justifyContent: 'center'
                }}
            >
                <Button
                    color="inherit"
                    onClick={handleLogout}
                    size="small"
                >
                    Logout
                </Button>
            </Box>
        </Popover>
    );
};

AccountPopover.propTypes = {
    anchorEl: PropTypes.any,
    onClose: PropTypes.func,
    open: PropTypes.bool
};
