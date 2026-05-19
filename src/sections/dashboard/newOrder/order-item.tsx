import React, { useState, FC } from 'react';
import { useFormik } from 'formik';
import {
    Button, TextField, Card, CardHeader, CardContent, Grid, Stack, Typography
} from '@mui/material';
import { nanoid } from 'nanoid';
import * as Yup from 'yup';
import PropTypes from "prop-types";
import {extras, products} from 'src/api/products/data';

interface OrderItemFormProps {
    addItem: (item: any) => void;
}

export const OrderItemForm: FC<OrderItemFormProps> = (props) => {
    const [productsList, setProductsList] = useState<{ productName: string, quantity: number }[]>([]);

    const addProduct = () => {
        const newProduct = { productName: '', quantity: 0 };
        formik.setFieldValue('extras', [...formik.values.extras, newProduct]);
    };

    const removeProduct = (index: number) => {
        const updatedProducts = [...formik.values.extras];
        updatedProducts.splice(index, 1);
        formik.setFieldValue('extras', updatedProducts);
    };


    const formik = useFormik({
        enableReinitialize: false,
        initialValues: {
            itemName: '',
            itemQuantity: 0,
            width: 0,
            drop: 0,
            cost: 0,
            reference: '',
            extras: productsList,
        },
        validationSchema: Yup.object({
            itemName: Yup.string().required('Required item name'),
            itemQuantity: Yup.number().required('Required').min(1, 'Must be at least 1'),
            width: Yup.number().required('Required in mm'),
            drop: Yup.number().required('Required in mm'),
            cost: Yup.number().required('Required').min(0.01, 'Must be at least 0.01'),
            reference: Yup.string().required('Item reference required'),
            extras: Yup.array().of(
                Yup.object().shape({
                    productName: Yup.string(),
                    quantity: Yup.number().min(1, 'Must be at least 1'),
                })
            ).required('At least one product is required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            const newItem = {
                id: nanoid(),
                ...values,
                ordersID: 'new',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                _version: 1,
                _lastChangedAt: Date.now(),
            };

            console.log(newItem)

            props.addItem(newItem);
            setSubmitting(false);
            formik.resetForm();
        }
    });

    const getExtraInfoByName = (productName: string): boolean => {
        const product = products.find(product => product.name === productName);
        return product ? product.extraInfo : false;
    }

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if(formik.isValid && !formik.isSubmitting){
            formik.handleSubmit();
        }
    };

    return (
        <Card>
            <CardHeader title={'Add item'} />
            <CardContent sx={{ pt: 0 }}>
                <Grid
                    container
                    spacing={3}
                    sx={{ mt: 1 }}
                >
                    <Grid
                        xs={12}
                        md={6}
                    >
                        <TextField
                            error={!!(formik.touched.reference && formik.errors.reference)}
                            fullWidth
                            helperText={formik.touched.reference && formik.errors.reference}
                            label="Item Reference"
                            name="reference"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            required
                            value={formik.values.reference}
                        />
                    </Grid>
                    <Grid
                        xs={12}
                        md={6}
                    >
                        <TextField
                            label="Item Name"
                            name="itemName"
                            error={!!(formik.touched.itemName && formik.errors.itemName)}
                            helperText={formik.touched.itemName && formik.errors.itemName}
                            onChange={formik.handleChange}
                            select
                            fullWidth
                            SelectProps={{native: true}}
                            value={formik.values.itemName}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        >
                            <option value="" disabled>
                                Select a product...
                            </option>
                            {products.map((option) => (
                                <option
                                    key={option.name}
                                    value={option.name}
                                >
                                    {option.name}
                                </option>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid
                        xs={12}
                        md={6}
                    >
                        <TextField
                            error={!!(formik.touched.itemQuantity && formik.errors.itemQuantity)}
                            fullWidth
                            helperText={formik.touched.itemQuantity && formik.errors.itemQuantity}
                            label="Item Quantity"
                            name="itemQuantity"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            required
                            value={formik.values.itemQuantity}
                        />
                    </Grid>
                    <Grid
                        xs={12}
                        md={6}
                    >
                        <TextField
                            error={!!(formik.touched.cost && formik.errors.cost)}
                            fullWidth
                            helperText={formik.touched.cost && formik.errors.cost}
                            label="Cost"
                            name="cost"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            required
                            value={formik.values.cost}
                        />
                    </Grid>
                    <Grid
                        xs={12}
                        md={6}
                    >
                        <TextField
                            error={!!(formik.touched.width && formik.errors.width)}
                            fullWidth
                            helperText={formik.touched.width && formik.errors.width}
                            label="Width in mm"
                            name="width"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            required
                            disabled={!getExtraInfoByName(formik.values.itemName)}
                            value={formik.values.width}
                        />
                    </Grid>
                    <Grid
                        xs={12}
                        md={6}
                    >
                        <TextField
                            error={!!(formik.touched.drop && formik.errors.drop)}
                            fullWidth
                            helperText={formik.touched.drop && formik.errors.drop}
                            label="Drop in mm"
                            name="drop"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            required
                            disabled={!getExtraInfoByName(formik.values.itemName)}
                            value={formik.values.drop}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Button onClick={addProduct} variant="contained">Add an extra</Button>
                    </Grid>
                {formik.values.extras.map((product, index) => {
                    const productNameError = (formik.errors.extras?.[index] as any)?.productName;
                    const productNameTouched = (formik.touched.extras?.[index] as any)?.productName;

                    const productQuantityError = (formik.errors.extras?.[index] as any)?.quantity;
                    const productQuantityTouched = (formik.touched.extras?.[index] as any)?.quantity;


                    return (
                        <React.Fragment key={index}>
                            <Grid xs={12} md={6}>
                                <TextField
                                    label="Add any extras"
                                    name={`extras[${index}].productName`}
                                    select
                                    fullWidth
                                    SelectProps={{ native: true }}
                                    value={product.productName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={!!(productNameTouched && productNameError)}
                                    helperText={productNameTouched && productNameError}
                                >
                                    <option value="" disabled>
                                        ........
                                    </option>
                                    {extras.map((option) => (
                                        <option key={option.name} value={option.name}>
                                            {option.name}
                                        </option>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid xs={12} md={6}>
                                <TextField
                                    label="Quantity"
                                    name={`extras[${index}].quantity`}
                                    type="number"
                                    value={product.quantity}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={!!(productQuantityTouched && productQuantityError)}
                                    helperText={productQuantityTouched && productQuantityError}
                                />
                                <Button onClick={() => removeProduct(index)}>Remove</Button>
                            </Grid>
                        </React.Fragment>
                    );
                })}
                </Grid>
                {formik.values.extras.length !== 0 && (
                <CardContent>
                    <Typography variant="body1">Added Extras:</Typography>
                    {formik.values.extras.map((product, index) => (
                        <Typography key={index} variant="body2">
                            {product.productName} - Quantity: {product.quantity}
                        </Typography>
                    ))}
                </CardContent>
                    )}
            </CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" spacing={3} sx={{ p: 3 }}>
                <Button
                    disabled={formik.isSubmitting || !formik.isValid}
                    type="submit"
                    variant="contained"
                    onClick={submitForm}  // Call submitForm on click
                >
                    Add items
                </Button>
                <Button onClick={() => formik.resetForm()} variant="contained">
                    Reset
                </Button>
            </Stack>
        </Card>
    );
};

OrderItemForm.propTypes = {
    addItem: PropTypes.func.isRequired,
};
