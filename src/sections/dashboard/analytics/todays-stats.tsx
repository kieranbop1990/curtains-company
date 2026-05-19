import type {FC} from 'react';
import numeral from 'numeral';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface TodaysStatsProps {
    orders: number;
    production: number;
    customers: number;
}

export const TodaysStats: FC<TodaysStatsProps> = (props) => {
    const {orders, production, customers} = props;

    return (
        <Card>
            <CardHeader
                title="Today's Live Stats"
                sx={{pb: 0}}
            />
            <CardContent>
                <Grid
                    container
                    spacing={3}
                >
                    <Grid
                        xs={12}
                        md={4}
                    >
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                            sx={{
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                    ? 'neutral.800'
                                    : 'error.lightest',
                                borderRadius: 2.5,
                                px: 3,
                                py: 4
                            }}
                        >
                            <Box
                                sx={{
                                    flexShrink: 0,
                                    height: 48,
                                    width: 48,
                                    '& img': {
                                        width: '100%'
                                    }
                                }}
                            >
                                <img src="/assets/iconly/iconly-glass-chart.svg"/>
                            </Box>
                            <div>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Customers
                                </Typography>
                                <Typography variant="h5">
                                    {customers}
                                </Typography>
                            </div>
                        </Stack>
                    </Grid>
                    <Grid
                        xs={12}
                        md={4}
                    >
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                            sx={{
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                    ? 'neutral.800'
                                    : 'warning.lightest',
                                borderRadius: 2.5,
                                px: 3,
                                py: 4
                            }}
                        >
                            <Box
                                sx={{
                                    flexShrink: 0,
                                    height: 48,
                                    width: 48,
                                    '& img': {
                                        width: '100%'
                                    }
                                }}
                            >
                                <img src="/assets/iconly/orders.svg"/>
                            </Box>
                            <div>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Orders
                                </Typography>
                                <Typography variant="h5">
                                    {orders}
                                </Typography>
                            </div>
                        </Stack>
                    </Grid>
                    <Grid
                        xs={12}
                        md={4}
                    >
                        <Stack
                            alignItems="center"
                            direction="row"
                            spacing={2}
                            sx={{
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                    ? 'neutral.800'
                                    : 'success.lightest',
                                borderRadius: 2.5,
                                px: 3,
                                py: 4
                            }}
                        >
                            <Box
                                sx={{
                                    flexShrink: 0,
                                    height: 48,
                                    width: 48,
                                    '& img': {
                                        width: '100%'
                                    }
                                }}
                            >
                                <img src="/assets/iconly/construction-ruler-pencil.svg"/>
                            </Box>
                            <div>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    In production
                                </Typography>
                                <Typography variant="h5">
                                    {production}
                                </Typography>
                            </div>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};
