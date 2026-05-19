import {FC, useEffect} from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import type {Order, OrderInformation} from 'src/types/order';
import {updateOrder, createOrder} from "../../../api/order/calls";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {useAuth} from "../../../hooks/use-auth";
import {Customer} from "../../../types/customer";
import {OrderItems} from './order-items';
import {OrderItemForm} from './order-item';
import {useNavigate} from 'react-router-dom';
import {Box} from "@mui/material";

interface OrderEditFormProps {
    order: Order;
    customers?: Customer[]
    update: boolean;
}

export const OrderEditForm: FC<OrderEditFormProps> = (props) => {
    const {user} = useAuth();
    const {order, customers, update} = props;
    const navigate = useNavigate();

    const paymentsTerms: string[] = [
        "Immediate payment full amount",
        "50% on order 50% on completion",
        "On account 30 days from invoice date",
        "Payment prior to collection",
        "On accounts 30 days from end of month",
        "Staged Payments",
    ];

    const supplyType: string[] = [
        "Supply Only",
        "Supply and Deliver",
        "Supply and Install"
    ];

    const deliveryOption: string[] = [
        "Fitters",
        "Delivery Driver"
    ];

    let totalCost = 0;

    const addItemToItemsArray = (newItem: OrderInformation) => {
        const newItems = [...formik.values.items, newItem];
        formik.setFieldValue("items", newItems);

        const totalCost = newItems.reduce((sum, orderInfo) => sum + (Number(orderInfo.cost || 0) * Number(orderInfo.itemQuantity || 0)), 0);
        formik.setFieldValue("orderValue", Number(totalCost));
    };

    const removeItemFromItemsArray = (id: string) => {
        const newItems = formik.values.items.filter(item => item.id !== id);
        formik.setFieldValue("items", newItems);

        totalCost = newItems.reduce((sum, orderInfo) => sum + Number(orderInfo.cost || 0), 0);
        formik.setFieldValue("orderValue", totalCost);
    };


    const formik = useFormik({
        initialValues: {
            orderDate: order.orderDate ? new Date(order.orderDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
            quotationNo: order.quotationNo || '',
            supply: order.supply || '',
            customerCollection: order.customerCollection || false,
            deliveryCharge: order.deliveryCharge || '',
            estimatedCollectionDelivery: order.estimatedCollectionDelivery ? new Date(order.estimatedCollectionDelivery).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
            estimateProjectCompletion: order.estimateProjectCompletion ? new Date(order.estimateProjectCompletion).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
            sfclDelivered: order.sfclDelivered || '',

            projectReference: order.projectReference || '',
            projectName: order.projectName || '',
            siteAddress: order.siteAddress || '',
            siteContactManager: order.siteContactManager || '',
            siteContactManagerNumber: order.siteContactManagerNumber || 0,
            siteContactSupervisor: order.siteContactSupervisor || '',
            siteContactSupervisorNumber: order.siteContactSupervisorNumber || '',
            siteWorkingHours: order.siteWorkingHours || '',
            startTime: order.siteWorkingHours?.split(' : ')[0] || '00:00',
            endTime: order.siteWorkingHours?.split(' : ')[1] || '00:00',

            sfclTerms: order.sfclTerms || paymentsTerms[0],
            sfclCreditScore: order.sfclCreditScore || '',
            sfclRecommended: order.sfclRecommended || '',
            sfclInsured: order.sfclInsured || false,


            status: order.status || 'PENDING',
            orderValue: order.orderValue || totalCost,

            onboardedCustomers: order.customer || '',
            items: order.items || [],
            submit: false
        },
        validateOnMount: false,
        validationSchema: Yup.object({
            orderDate: Yup
                .date(),
            quotationNo: Yup
                .string()
                .max(200)
                .required('Quotation number is required'),
            supply: Yup
                .string(),
            customerCollection: Yup.bool(),
            deliveryCharge: Yup
                .string()
                .max(80),
            estimatedCollectionDelivery: Yup
                .date(),
            estimateProjectCompletion: Yup
                .date(),
            sfclDelivered: Yup
                .string()
                .max(80),


            projectReference: Yup
                .string()
                .max(200),
            projectName: Yup
                .string()
                .max(200),
            siteAddress: Yup
                .string()
                .max(200)
                .required('Project address is required'),
            siteContactManager: Yup
                .string()
                .max(200)
                .required('Contact manager is required'),
            siteContactManagerNumber: Yup
                .string()
                .matches(
                    /^(?:\+44\s?|0)(?:\d\s?){9,12}\d$/,
                    'Please enter a valid UK phone number'
                )
                .required('Contact manager number is required'),
            siteContactSupervisor: Yup
                .string()
                .max(200),
            siteContactSupervisorNumber: Yup
                .string()
                .matches(
                    /^(?:\+44\s?|0)(?:\d\s?){9,12}\d$/,
                    'Please enter a valid UK phone number'
                ).notRequired(),
            siteWorkingHours: Yup
                .string(),


            sfclTerms: Yup
                .string(),
            sfclCreditScore: Yup
                .string()
                .max(200)
                .required('Credit score is required'),
            sfclRecommended: Yup
                .string()
                .max(200)
                .required('Top recommended credit is required'),
            sfclInsured: Yup.bool(),


            status: Yup
                .string(),
            orderValue: Yup.number().max(1000000).required('Order value is required'),
            items: Yup.array(),
            onboardedCustomers: Yup
                .string()
                .required('Please select a customer'),
            vatReverse: Yup.bool(),
        }),
        onSubmit: async (values, helpers): Promise<void> => {
            values.siteWorkingHours = `${values.startTime} : ${values.endTime}`;
            let result;
            if (values.items.length === 0) {
                // Throw a toast and return to prevent the submission
                toast.error("At least one order item must be added");
                return;
            }

            console.log(`ORDER VALUES ARE`, values)
            try {
                if (props.update) {
                    result = await updateOrder(order, values, user);
                    helpers.setStatus({success: true});
                    helpers.setSubmitting(false);
                    toast.success(result)
                } else {
                    result = await createOrder(values, user)
                    helpers.setStatus({success: true});
                    helpers.setSubmitting(false);
                    navigate(paths.dashboard.orders.details.replace(':orderId', result));
                }
            } catch (err) {
                console.error(err);
                toast.error(err.message || 'Something went wrong!');
                helpers.setStatus({success: false});
                helpers.setErrors({submit: err.message});
                helpers.setSubmitting(false);
            }
        }
    });

    useEffect(() => {
        totalCost = formik.values.items.reduce((sum, orderInfo) => sum + (Number(orderInfo.cost || 0) * Number(orderInfo.itemQuantity || 0)), 0);
        formik.setFieldValue("orderValue", Number(totalCost));
    }, [formik.values.items]);

    const handleDateChange = (date: Date | null) => {
        formik.setFieldValue("orderDate", date ? date.toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10));
    };
    const handleEstimatedCollectionDelivery = (date: Date | null) => {
        formik.setFieldValue("estimatedCollectionDelivery", date ? date.toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10));
    };
    const handleEstimateProjectCompletion = (date: Date | null) => {
        formik.setFieldValue("estimateProjectCompletion", date ? date.toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10));
    };

    return (
        <>
            <Box mb={3}>
                <Card>
                    <CardContent sx={{pt: 0}}>
                        <OrderItemForm addItem={addItemToItemsArray}/>
                        <OrderItems items={formik.values.items}
                                    removeItem={removeItemFromItemsArray}
                                    allowDelete={true}/>
                        <CardHeader title={`Complete order cost: £${formik.values.orderValue}`}/>
                    </CardContent>
                </Card>
            </Box>
            <Divider/>
            <form
                onSubmit={formik.handleSubmit}
            >
                <Box mb={3}>
                    <Card>
                        <CardHeader title={props.update ? 'Edit Order' : 'Create Order'}/>
                        <CardContent sx={{pt: 0}}>
                            <Grid
                                container
                                spacing={3}
                            >
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Order date
                                    </Typography>
                                    <DatePicker
                                        format="dd/MM/yyyy"
                                        label="From"
                                        onChange={handleDateChange}
                                        value={formik.values.orderDate ? new Date(formik.values.orderDate) : null}/>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        label="Customer"
                                        name="onboardedCustomers"
                                        error={!!(formik.touched.onboardedCustomers && formik.errors.onboardedCustomers)}
                                        helperText={formik.touched.onboardedCustomers && formik.errors.onboardedCustomers}
                                        onChange={formik.handleChange}
                                        select
                                        fullWidth
                                        SelectProps={{native: true}}
                                        value={formik.values.onboardedCustomers}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    >
                                        <option value="" disabled>
                                            Select a customer...
                                        </option>
                                        {props.customers?.map((option) => (
                                            <option
                                                key={option.businessName}
                                                value={option.id}
                                            >
                                                {option.businessName}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        error={!!(formik.touched.quotationNo && formik.errors.quotationNo)}
                                        fullWidth
                                        helperText={formik.touched.quotationNo && formik.errors.quotationNo}
                                        label="Quotation Number"
                                        name="quotationNo"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.quotationNo}/>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        label="Supply"
                                        name="supply"
                                        error={!!(formik.touched.supply && formik.errors.supply)}
                                        helperText={formik.touched.supply && formik.errors.supply}
                                        onChange={formik.handleChange}
                                        select
                                        fullWidth
                                        SelectProps={{native: true}}
                                        value={formik.values.supply}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    >
                                        <option value="" disabled>
                                            Select a preference..
                                        </option>
                                        {supplyType.map((option) => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                {
                                    formik.values.supply === 'Supply Only' && (
                                        <Grid
                                            xs={12}
                                            md={6}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                Does this customer want to collect their order?
                                            </Typography>
                                            <Switch
                                                checked={formik.values.customerCollection}
                                                color="primary"
                                                edge="start"
                                                name="customerCollection"
                                                onChange={formik.handleChange}
                                                value={formik.values.customerCollection}
                                            />
                                        </Grid>
                                    )}
                                {/*Used on all*/}
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Any additional charges or notes required?
                                    </Typography>
                                    <TextField
                                        error={!!(formik.touched.deliveryCharge && formik.errors.deliveryCharge)}
                                        fullWidth
                                        helperText={formik.touched.deliveryCharge && formik.errors.deliveryCharge}
                                        label="Delivery Notes / Charge"
                                        name="deliveryCharge"
                                        disabled={props.update}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.deliveryCharge}/>
                                </Grid>
                                {
                                    (formik.values.supply === 'Supply and Deliver' || formik.values.supply === 'Supply Only') && (
                                        <Grid
                                            xs={12}
                                            md={6}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                            >
                                                Estimated collection/delivery date?
                                            </Typography>
                                            <DatePicker
                                                format="dd/MM/yyyy"
                                                label="From"
                                                onChange={handleEstimatedCollectionDelivery}
                                                value={formik.values.estimatedCollectionDelivery ? new Date(formik.values.estimatedCollectionDelivery) : null}/>
                                        </Grid>
                                    )}

                                {
                                    formik.values.supply === 'Supply and Install' && (
                                        <>
                                            <Grid
                                                xs={12}
                                                md={6}
                                            >
                                                <Typography
                                                    color="text.secondary"
                                                    variant="body2"
                                                >
                                                    Estimated completion date?
                                                </Typography>
                                                <DatePicker
                                                    format="dd/MM/yyyy"
                                                    label="From"
                                                    onChange={handleEstimateProjectCompletion}
                                                    value={formik.values.estimateProjectCompletion ? new Date(formik.values.estimateProjectCompletion) : null}/>
                                            </Grid>
                                            <Grid
                                                xs={12}
                                                md={6}
                                            >
                                                <Typography
                                                    color="text.secondary"
                                                    variant="body2"
                                                >
                                                    Is this delivery to site from fitters / delivery driver?
                                                </Typography>
                                                <TextField
                                                    label="Delivery Options"
                                                    name="sfclDelivered"
                                                    error={!!(formik.touched.sfclDelivered && formik.errors.sfclDelivered)}
                                                    helperText={formik.touched.sfclDelivered && formik.errors.sfclDelivered}
                                                    onChange={formik.handleChange}
                                                    select
                                                    fullWidth
                                                    SelectProps={{native: true}}
                                                    value={formik.values.sfclDelivered}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                >
                                                    <option value="" disabled>
                                                        Select a delivery option..
                                                    </option>
                                                    {deliveryOption.map((option) => (
                                                        <option
                                                            key={option}
                                                            value={option}
                                                        >
                                                            {option}
                                                        </option>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                        </>
                                    )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>

                <Box mb={3}>
                    <Card>
                        <CardHeader title={'Project / Site Information'}/>
                        <CardContent sx={{pt: 0}}>
                            <Grid
                                container
                                spacing={3}
                            >
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        error={!!(formik.touched.projectReference && formik.errors.projectReference)}
                                        fullWidth
                                        disabled={props.update}
                                        helperText={formik.touched.projectReference && formik.errors.projectReference}
                                        label="Project Reference"
                                        name="projectReference"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.projectReference}/>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        error={!!(formik.touched.projectName && formik.errors.projectName)}
                                        fullWidth
                                        helperText={formik.touched.projectName && formik.errors.projectName}
                                        label="Project Name"
                                        name="projectName"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.projectName}/>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        error={!!(formik.touched.siteAddress && formik.errors.siteAddress)}
                                        fullWidth
                                        helperText={formik.touched.siteAddress && formik.errors.siteAddress}
                                        label="Site Address"
                                        name="siteAddress"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.siteAddress}/>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        error={!!(formik.touched.siteContactManager && formik.errors.siteContactManager)}
                                        fullWidth
                                        helperText={formik.touched.siteContactManager && formik.errors.siteContactManager}
                                        label="Site Manager"
                                        name="siteContactManager"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.siteContactManager}/>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        error={!!(formik.touched.siteContactManagerNumber && formik.errors.siteContactManagerNumber)}
                                        fullWidth
                                        helperText={formik.touched.siteContactManagerNumber && formik.errors.siteContactManagerNumber}
                                        label="Site Manager Number"
                                        name="siteContactManagerNumber"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.siteContactManagerNumber}/>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        error={!!(formik.touched.siteContactSupervisor && formik.errors.siteContactSupervisor)}
                                        fullWidth
                                        helperText={formik.touched.siteContactSupervisor && formik.errors.siteContactSupervisor}
                                        label="Site Supervisor"
                                        name="siteContactSupervisor"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.siteContactSupervisor}/>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        error={!!(formik.touched.siteContactSupervisorNumber && formik.errors.siteContactSupervisorNumber)}
                                        fullWidth
                                        helperText={formik.touched.siteContactSupervisorNumber && formik.errors.siteContactSupervisorNumber}
                                        label="Site Supervisor Number"
                                        name="siteContactSupervisorNumber"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.siteContactSupervisorNumber}/>
                                </Grid>
                                <Grid xs={12} md={6}>
                                    <TextField
                                        error={!!(formik.touched.startTime && formik.errors.startTime)}
                                        fullWidth
                                        helperText={formik.touched.startTime && formik.errors.startTime}
                                        label="Start Time"
                                        name="startTime"
                                        type="time"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.startTime}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        inputProps={{
                                            step: 300, // 5 min
                                        }}
                                    />
                                </Grid>

                                <Grid xs={12} md={6}>
                                    <TextField
                                        error={!!(formik.touched.endTime && formik.errors.endTime)}
                                        fullWidth
                                        helperText={formik.touched.endTime && formik.errors.endTime}
                                        label="End Time"
                                        name="endTime"
                                        type="time"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.endTime}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        inputProps={{
                                            step: 300, // 5 min
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>

                <Box mb={3}>
                    <Card>
                        <CardHeader title={'Credit'}/>
                        <CardContent sx={{pt: 0}}>
                            <Grid
                                container
                                spacing={3}
                            >
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        label="Payment Terms"
                                        name="sfclTerms"
                                        onChange={formik.handleChange}
                                        select
                                        fullWidth
                                        SelectProps={{native: true}}
                                        value={formik.values.sfclTerms}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    >
                                        {paymentsTerms.map((option) => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        error={!!(formik.touched.sfclCreditScore && formik.errors.sfclCreditScore)}
                                        fullWidth
                                        helperText={formik.touched.sfclCreditScore && formik.errors.sfclCreditScore}
                                        label="Credit score"
                                        name="sfclCreditScore"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.sfclCreditScore}/>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <TextField
                                        error={!!(formik.touched.sfclRecommended && formik.errors.sfclRecommended)}
                                        fullWidth
                                        helperText={formik.touched.sfclRecommended && formik.errors.sfclRecommended}
                                        label="Recommended credit"
                                        name="sfclRecommended"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        required
                                        value={formik.values.sfclRecommended}/>
                                </Grid>
                                <Grid
                                    xs={12}
                                    md={6}
                                >
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Is this order insured?
                                    </Typography>
                                    <Switch
                                        checked={formik.values.sfclInsured}
                                        color="primary"
                                        edge="start"
                                        name="sfclInsured"
                                        onChange={formik.handleChange}
                                        value={formik.values.sfclInsured}
                                    />
                                </Grid>


                            </Grid>
                        </CardContent>
                    </Card>
                </Box>

                <Box mb={3}>
                    <Card>
                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row'
                            }}
                            flexWrap="wrap"
                            spacing={3}
                            sx={{p: 3}}
                        >
                            <Button
                                disabled={formik.isSubmitting}
                                type="submit"
                                variant="contained"
                            >
                                {props.update ? 'Update order' : 'Create order'}
                            </Button>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                href={props.update ? paths.dashboard.orders.details.replace(':orderId', order.id) : paths.dashboard.orders.index}
                            >
                                Cancel
                            </Button>
                        </Stack>
                    </Card>
                </Box>
            </form>
        </>
    )
        ;
};

OrderEditForm.propTypes = {
    // @ts-ignore
    order: PropTypes.object.isRequired
};
