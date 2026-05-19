import type {FC} from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type {Theme} from '@mui/material/styles/createTheme';

import {PropertyList} from 'src/components/property-list';
import {PropertyListItem} from 'src/components/property-list-item';
import {OrderInformation, OrderSpecificationExtras} from "src/types/order";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Switch} from "@mui/material";
import TextField from "@mui/material/TextField";

interface OrderDetailsProps {
    onApprove?: (details: OrderSpecificationExtras) => void;
    onReject?: () => void;
    order: OrderInformation;
}

export const OrderDetails: FC<OrderDetailsProps> = (props) => {
    const {onApprove, onReject, order} = props;
    const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

    const sideOptions: string[] = [
        "Left",
        "Right"
    ];

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            headboxSizeWidth: order.productionSpecification?.headboxSizeHeight || 0,
            headboxSizeHeight: order.productionSpecification?.headboxSizeWidth ||0,
            colour: order.productionSpecification?.colour || '',
            motorSide: order.productionSpecification?.motorSide || '',
            smokeSeals: order.productionSpecification?.smokeSeals || false
        },

        validationSchema: Yup.object({
            headboxSizeWidth: Yup.number().required('Width required').moreThan(0),
            headboxSizeHeight: Yup.number().required('Height required').moreThan(0),
            colour: Yup.string(),
            motorSide: Yup.string()
                .required('Motor side is required')
                .oneOf(['Left', 'Right'], 'Motor side must be either Left or Right'),
            smokeSeals: Yup.boolean()
        }),

        onSubmit: async (values, {setSubmitting}): Promise<void> => {
            if(onApprove) {
                onApprove(values);
            }
            setSubmitting(true)
        }
    });


    const align = lgUp ? 'horizontal' : 'vertical';
    return (
        <form
            onSubmit={formik.handleSubmit}
        >
            <Stack spacing={6}>
                <Stack spacing={3}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                        spacing={3}
                    >
                        <Typography variant="h6">
                            Details
                        </Typography>
                    </Stack>
                    <PropertyList>
                        <PropertyListItem
                            align={align}
                            disableGutters
                            divider
                            label="Headbox size Height (mm)"
                        >
                            <TextField
                                error={!!(formik.touched.headboxSizeHeight && formik.errors.headboxSizeHeight)}
                                fullWidth
                                helperText={formik.touched.headboxSizeHeight && formik.errors.headboxSizeHeight}
                                name="headboxSizeHeight"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                required
                                value={formik.values.headboxSizeHeight}/>
                        </PropertyListItem>
                      <PropertyListItem
                          align={align}
                          disableGutters
                          divider
                          label="Headbox size Width (mm)"
                      >
                        <TextField
                            error={!!(formik.touched.headboxSizeWidth && formik.errors.headboxSizeWidth)}
                            fullWidth
                            helperText={formik.touched.headboxSizeWidth && formik.errors.headboxSizeWidth}
                            name="headboxSizeWidth"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            required
                            value={formik.values.headboxSizeWidth}/>
                      </PropertyListItem>
                        <PropertyListItem
                            align={align}
                            disableGutters
                            divider
                            label="RAC Colour"
                        >
                            <TextField
                                error={!!(formik.touched.colour && formik.errors.colour)}
                                fullWidth
                                helperText={formik.touched.colour && formik.errors.colour}
                                name="colour"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                required
                                value={formik.values.colour}/>
                        </PropertyListItem>
                        <PropertyListItem
                            align={align}
                            disableGutters
                            divider
                            label="Motor"
                        >
                            <TextField
                                name="motorSide"
                                error={!!(formik.touched.motorSide && formik.errors.motorSide)}
                                helperText={formik.touched.motorSide && formik.errors.motorSide}
                                onChange={formik.handleChange}
                                select
                                SelectProps={{native: true}}
                                value={formik.values.motorSide}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            >
                                <option value="" disabled>
                                    Select an option
                                </option>
                                {sideOptions.map((option) => (
                                    <option
                                        key={option}
                                        value={option}
                                    >
                                        {option}
                                    </option>
                                ))}
                            </TextField>
                        </PropertyListItem>
                        <PropertyListItem
                            align={align}
                            disableGutters
                            divider
                            label="Smoke Seals"
                        >
                            <Switch
                                checked={formik.values.smokeSeals}
                                color="primary"
                                edge="start"
                                name="smokeSeals"
                                onChange={formik.handleChange}
                                value={formik.values.smokeSeals}
                            />
                        </PropertyListItem>
                    </PropertyList>
                    <Stack
                        alignItems="center"
                        direction="row"
                        flexWrap="wrap"
                        justifyContent="flex-end"
                        spacing={2}
                    >
                        <Button
                            size="small"
                            variant="contained"
                            disabled={formik.isSubmitting}
                            type="submit"
                        >
                            Approve
                        </Button>
                        <Button
                            color="error"
                            onClick={() => {
                                formik.resetForm();
                                if (onReject) {
                                    onReject();
                                }
                            }}
                            size="small"
                            variant="outlined"
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </form>
    );
};

OrderDetails.propTypes = {
    onApprove: PropTypes.func,
    onReject: PropTypes.func,
    // @ts-ignore
    order: PropTypes.object
};
