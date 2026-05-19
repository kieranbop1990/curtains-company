import type {FC} from 'react';
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
import InputAdornment from '@mui/material/InputAdornment';
import {RouterLink} from 'src/components/router-link';
import {paths} from 'src/paths';
import type {Customer} from 'src/types/customer';
import {updateCustomer, createCustomer} from "../../../api/customers/calls";
import {Box} from '@mui/material';

interface CustomerEditFormProps {
    customer: Customer;
    update: boolean;
}

export const CustomerEditForm: FC<CustomerEditFormProps> = (props) => {
    const {customer, ...other} = props;
    const cisRate: string[] = [
        "Gross (0%)",
        "Standard (20%)",
        "Higher (30%)",
    ];
    const cisOrgType: string[] = [
        "Sole Trader",
        "Limited Company",
        "Partnership",
        "Trust"
    ];


    const formik = useFormik({
        initialValues: {
            //details
            customer: customer.customer || '',
            contactNum: customer.contactNum || '',
            email: customer.email || '',
            billingAddress: customer.billingAddress || '',
            businessName: customer.businessName || '',
            //financial
            accountsContact: customer.accountsContact || '',
            accountsEmail: customer.accountsEmail || '',
            regNumber: customer.regNumber || '',
            vatNumber: customer.vatNumber || '',
            taxReference: customer.taxReference || '',
            vatExempt: customer.vatExempt || false,
            vatReverse: customer.vatReverse || false,
            //CIS
            cisDeductions: customer.cisDeductions || false,
            cisName: customer.cisName || '',
            cisRate: customer.cisRate || '',
            cisOrgType: customer.cisOrgType || '',
            //other
            creditLimit: customer.creditLimit || 0,
            trustedPayer: customer.trustedPayer || false,
            submit: false
        },
        validationSchema: Yup.object({
            //customer
            customer: Yup
                .string()
                .max(255)
                .required('Customer is required'),
            contactNum: Yup
                .string()
                .max(200)
                .required('Contact Number is required'),
            email: Yup
                .string()
                .email('Must be a valid email')
                .max(255)
                .required('Email is required'),
            billingAddress: Yup
                .string()
                .max(255)
                .required('Invoice Address is required'),
            businessName: Yup
                .string()
                .max(255)
                .required(),
            //financial
            accountsContact: Yup
                .string()
                .max(200),
            accountsEmail: Yup
                .string()
                .email('Must be a valid email')
                .max(255),
            regNumber: Yup
                .string()
                .max(200),
            vatNumber: Yup
                .string()
                .max(200),
            taxReference: Yup
                .string()
                .max(200),
            vatExempt: Yup.bool(),
            vatReverse: Yup.bool(),
            //cis
            cisDeductions: Yup.bool(),
            cisName: Yup
                .string()
                .max(200),
            cisRate: Yup
                .string()
                .max(200),
            cisOrgType: Yup
                .string()
                .max(200),
            creditLimit: Yup.number().max(1000000).required('Credit limit is required'),
            trustedPayer: Yup.bool()
        }),
        onSubmit: async (values, helpers): Promise<void> => {
            try {
                let toastPrompt = 'Customer created';
                if (props.update) {
                    await updateCustomer(customer, values);
                    toastPrompt = 'Customer updated';
                } else {
                    await createCustomer(values)
                }
                helpers.setStatus({success: true});
                helpers.setSubmitting(false);
                toast.success(toastPrompt);
            } catch (err) {
                console.error(err);
                toast.error('Something went wrong!');
                helpers.setStatus({success: false});
                helpers.setErrors({submit: err.message});
                helpers.setSubmitting(false);
            }
        }
    });

    return (
        <form
            onSubmit={formik.handleSubmit}
            {...other}
        >
            <Box mb={3}>
                <Card>
                    <CardHeader title="Customer Details"/>
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
                                    error={!!(formik.touched.customer && formik.errors.customer)}
                                    fullWidth
                                    helperText={formik.touched.customer && formik.errors.customer}
                                    label="Customer name"
                                    name="customer"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    required
                                    value={formik.values.customer}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <TextField
                                    error={!!(formik.touched.email && formik.errors.email)}
                                    fullWidth
                                    helperText={formik.touched.email && formik.errors.email}
                                    label="Email address"
                                    name="email"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    required
                                    value={formik.values.email}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <TextField
                                    error={!!(formik.touched.businessName && formik.errors.businessName)}
                                    fullWidth
                                    helperText={formik.touched.businessName && formik.errors.businessName}
                                    label="Business name"
                                    name="businessName"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.businessName}
                                    required
                                />
                                <Typography variant="body2">If no business name, then add in customer name</Typography>
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <TextField
                                    error={!!(formik.touched.contactNum && formik.errors.contactNum)}
                                    fullWidth
                                    helperText={formik.touched.contactNum && formik.errors.contactNum}
                                    label="Contact Number"
                                    name="contactNum"
                                    required
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.contactNum}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <TextField
                                    error={!!(formik.touched.billingAddress && formik.errors.billingAddress)}
                                    fullWidth
                                    helperText={formik.touched.billingAddress && formik.errors.billingAddress}
                                    label="Billing Address to invoice"
                                    name="billingAddress"
                                    required
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.billingAddress}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>

            <Box mb={3}>
                <Card>
                    <CardHeader title="Financial Details"/>
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
                                    error={!!(formik.touched.accountsContact && formik.errors.accountsContact)}
                                    fullWidth
                                    helperText={formik.touched.accountsContact && formik.errors.accountsContact}
                                    label="Accounts Contact"
                                    name="accountsContact"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.accountsContact}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <TextField
                                    error={!!(formik.touched.accountsEmail && formik.errors.accountsEmail)}
                                    fullWidth
                                    helperText={formik.touched.accountsEmail && formik.errors.accountsEmail}
                                    label="Accounts Email"
                                    name="accountsEmail"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.accountsEmail}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <TextField
                                    error={!!(formik.touched.regNumber && formik.errors.regNumber)}
                                    fullWidth
                                    helperText={formik.touched.regNumber && formik.errors.regNumber}
                                    label="Registration Number"
                                    name="regNumber"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.regNumber}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <TextField
                                    error={!!(formik.touched.vatNumber && formik.errors.vatNumber)}
                                    fullWidth
                                    helperText={formik.touched.vatNumber && formik.errors.vatNumber}
                                    label="VAT number"
                                    name="vatNumber"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.vatNumber}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <TextField
                                    error={!!(formik.touched.taxReference && formik.errors.taxReference)}
                                    fullWidth
                                    helperText={formik.touched.taxReference && formik.errors.taxReference}
                                    label="Tax reference"
                                    name="taxReference"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.taxReference}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Is this customer VAT exempt?
                                </Typography>
                                <Switch
                                    checked={formik.values.vatExempt}
                                    color="primary"
                                    edge="start"
                                    name="vatExempt"
                                    onChange={formik.handleChange}
                                    value={formik.values.vatExempt}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Is this customer eligible for VAT reverse?
                                </Typography>
                                <Switch
                                    checked={formik.values.vatReverse}
                                    color="primary"
                                    edge="start"
                                    name="vatReverse"
                                    onChange={formik.handleChange}
                                    value={formik.values.vatReverse}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
            <Box mb={3}>
                <Card>
                    <CardHeader title="Construction industry Scheme"/>
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
                                    Is this customer eligible for CIS deductions?
                                </Typography>
                                <Switch
                                    checked={formik.values.cisDeductions}
                                    color="primary"
                                    edge="start"
                                    name="cisDeductions"
                                    onChange={formik.handleChange}
                                    value={formik.values.cisDeductions}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <TextField
                                    error={!!(formik.touched.cisName && formik.errors.cisName)}
                                    fullWidth
                                    helperText={formik.touched.cisName && formik.errors.cisName}
                                    label="Registered CIS Name"
                                    name="cisName"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.cisName}
                                />
                            </Grid>
                            <Grid
                                xs={12}
                                md={6}
                            >
                                <TextField
                                    label="CIS rate"
                                    name="cisRate"
                                    error={!!(formik.touched.cisRate && formik.errors.cisRate)}
                                    helperText={formik.touched.cisRate && formik.errors.cisRate}
                                    onChange={formik.handleChange}
                                    select
                                    fullWidth
                                    SelectProps={{native: true}}
                                    value={formik.values.cisRate}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                >
                                    <option value="" disabled>
                                        Select a rate...
                                    </option>
                                    {cisRate?.map((option) => (
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
                                    label="CIS Org Type"
                                    name="cisOrgType"
                                    error={!!(formik.touched.cisOrgType && formik.errors.cisOrgType)}
                                    helperText={formik.touched.cisOrgType && formik.errors.cisOrgType}
                                    onChange={formik.handleChange}
                                    select
                                    fullWidth
                                    SelectProps={{native: true}}
                                    value={formik.values.cisOrgType}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                >
                                    <option value="" disabled>
                                        Select a org type...
                                    </option>
                                    {cisOrgType?.map((option) => (
                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option}
                                        </option>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>

                    </CardContent>
                </Card>
            </Box>
            <Box mb={3}>
                <Card>
                    <CardHeader title="Other"/>
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
                                    error={!!(formik.touched.creditLimit && formik.errors.creditLimit)}
                                    fullWidth
                                    helperText={formik.touched.creditLimit && formik.errors.creditLimit}
                                    label="Credit Limit"
                                    name="creditLimit"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    value={formik.values.creditLimit}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">£</InputAdornment>,
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Stack
                            divider={<Divider/>}
                            spacing={3}
                            sx={{mt: 3}}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                            >
                                <Stack spacing={1}>
                                    <Typography
                                        gutterBottom
                                        variant="subtitle1"
                                    >
                                        Trusted Payer
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Is this customer a trusted payer and means we don't often need to chase?
                                    </Typography>
                                </Stack>
                                <Switch
                                    checked={formik.values.trustedPayer}
                                    color="primary"
                                    edge="start"
                                    name="trustedPayer"
                                    onChange={formik.handleChange}
                                    value={formik.values.trustedPayer}
                                />
                            </Stack>
                        </Stack>
                    </CardContent>
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
                            {props.update ? 'Update' : 'Create'}
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            disabled={formik.isSubmitting}
                            href={props.update ? paths.dashboard.customers.details.replace(':customerId', customer.id) : paths.dashboard.customers.index}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Card>
            </Box>
        </form>
    );
};

CustomerEditForm.propTypes = {
    // @ts-ignore
    customer: PropTypes.object.isRequired
};
