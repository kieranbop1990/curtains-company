import {FC, useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {File, FileDropzone} from 'src/components/file-dropzone';
import {CustomFile, FileList} from 'src/components/list-files';
import {useFormik} from "formik";
import * as Yup from "yup";
import {Box, Button, Container, Divider, Switch} from "@mui/material";
import {Order} from "../../../types/order";
import {useMounted} from "../../../hooks/use-mounted";
import {ordersApi} from "../../../api/order";
import {updatePendingStatus} from "../../../api/order/calls";
import {toast} from "react-hot-toast";
import CircularProgress from '@mui/material/CircularProgress';
import {useSettings} from 'src/hooks/use-settings';
import Link from "@mui/material/Link";
import {RouterLink} from "../../../components/router-link";
import {paths} from "../../../paths";
import SvgIcon from "@mui/material/SvgIcon";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import {useAuth} from "../../../hooks/use-auth";
import {apiClient} from "../../../api/client";


const parseFileFromApi = (item: any): CustomFile => {
    const name = item.id || item.path?.split('/').pop() || '';
    const type = name.split('.').pop() as string;
    return {name, type};
}

const useOrder = (ordersId: string | undefined): [Order | null, boolean, CustomFile[], CustomFile[], CustomFile[], CustomFile[], CustomFile[], CustomFile[]] => {
    const isMounted = useMounted();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [existingFiles1, setExistingFiles1] = useState<CustomFile[]>([]);
    const [existingFiles2, setExistingFiles2] = useState<CustomFile[]>([]);
    const [existingFiles3, setExistingFiles3] = useState<CustomFile[]>([]);
    const [existingFiles4, setExistingFiles4] = useState<CustomFile[]>([]);
    const [existingFiles5, setExistingFiles5] = useState<CustomFile[]>([]);
    const [existingFiles6, setExistingFiles6] = useState<CustomFile[]>([]);

    const handleOrderGet = useCallback(async () => {
        try {
            const response = await ordersApi.getOrder({id: ordersId!});

            if (isMounted()) {
                setOrder(response);

                const folders = ['po', 'surveyDetails', 'drawings', 'quotation', 'invoices', 'shipping'];
                const fileResults = await Promise.all(
                    folders.map(folder =>
                        apiClient.get(`/api/files/${ordersId}?prefix=${folder}`).catch(() => [])
                    )
                );

                setExistingFiles1((fileResults[0] || []).map(parseFileFromApi));
                setExistingFiles2((fileResults[1] || []).map(parseFileFromApi));
                setExistingFiles3((fileResults[2] || []).map(parseFileFromApi));
                setExistingFiles4((fileResults[3] || []).map(parseFileFromApi));
                setExistingFiles5((fileResults[4] || []).map(parseFileFromApi));
                setExistingFiles6((fileResults[5] || []).map(parseFileFromApi));

                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, [ordersId, isMounted]);

    useEffect(() => {
        handleOrderGet();
    }, [ordersId]);

    return [order, loading, existingFiles1, existingFiles2, existingFiles3, existingFiles4, existingFiles5, existingFiles6];
};

export const PendingForm: FC = (props) => {
    const {orderId} = useParams();
    const orderPath = `${orderId}`;
    const {user} = useAuth();
    const [order, loading, existingFiles1, existingFiles2, existingFiles3, existingFiles4, existingFiles5, existingFiles6] = useOrder(orderId);
    const [files1, setFiles1] = useState<File[]>([]);
    const [files2, setFiles2] = useState<File[]>([]);
    const [files3, setFiles3] = useState<File[]>([]);
    const [files4, setFiles4] = useState<File[]>([]);
    const [files5, setFiles5] = useState<File[]>([]);
    const [files6, setFiles6] = useState<File[]>([]);
    const [newlyUploadedFiles1, setNewlyUploadedFiles1] = useState<CustomFile[]>([]);
    const [newlyUploadedFiles2, setNewlyUploadedFiles2] = useState<CustomFile[]>([]);
    const [newlyUploadedFiles3, setNewlyUploadedFiles3] = useState<CustomFile[]>([]);
    const [newlyUploadedFiles4, setNewlyUploadedFiles4] = useState<CustomFile[]>([]);
    const [newlyUploadedFiles5, setNewlyUploadedFiles5] = useState<CustomFile[]>([]);
    const [newlyUploadedFiles6, setNewlyUploadedFiles6] = useState<CustomFile[]>([]);
    const navigate = useNavigate();

    const pending = order?.pending;
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            purchaseOrder: pending?.purchaseOrder || false,
            surveys: pending?.survey || false,
            drawings: pending?.drawings || false,
            quotation: pending?.quotationDetails || false,
            completed: pending?.completed || false,
            invoices: pending?.invoices || false,
            shipping: pending?.shippingDetails || false,
            deposit: pending?.depositPaid || false,
            orderPlaced: pending?.orderPlaced || false,
            drawingsApproved: pending?.drawingsApproved || false
        },

        validationSchema: Yup.object({
            purchaseOrder: Yup.boolean(),
            surveys: Yup.boolean(),
            drawings: Yup.boolean(),
            quotation: Yup.boolean(),
            completed: Yup.boolean(),
            invoices: Yup.boolean(),
            shipping: Yup.boolean(),
            //sme checks
            deposit: Yup.boolean(),
            orderPlaced: Yup.boolean(),
            drawingsApproved: Yup.boolean(),
        }),

        onSubmit: async (values, {setSubmitting}): Promise<void> => {
            // Check if all values (except 'completed') are true
            // If all values are true, set 'completed' to true
            values.completed = Object.keys(values)
                .filter(key => key !== 'completed')
                .every(key => (values as { [key: string]: boolean })[key]);

            const update = await updatePendingStatus(order!.id, values)
            toast.success(update);
            setSubmitting(false);
            navigate(paths.dashboard.orders.index)
        }
    });

    useEffect(() => {
        if (files1.length > 0 || existingFiles1.length > 0) {
            formik.setFieldValue('purchaseOrder', true);
        }

        if (files2.length > 0 || existingFiles2.length > 0) {
            formik.setFieldValue('surveys', true);
        }

        if (files3.length > 0 || existingFiles3.length > 0) {
            formik.setFieldValue('drawings', true);
        }

        if (files4.length > 0 || existingFiles4.length > 0) {
            formik.setFieldValue('quotation', true);
        }

        if (files5.length > 0 || existingFiles5.length > 0) {
            formik.setFieldValue('invoices', true);
        }

        if (files6.length > 0 || existingFiles6.length > 0) {
            formik.setFieldValue('shipping', true);
        }

    }, [files1, files2, files3, files4, files5, files6, existingFiles1, existingFiles2, existingFiles3, existingFiles4, existingFiles5, existingFiles6, formik.values, formik.setFieldValue]);

    const handleFilesDrop = (setter: Function) => (newFiles: File[]) => {
        setter((prevFiles: File[]) => [...prevFiles, ...newFiles]);
    }

    const handleFileRemove = (setter: Function) => (file: File) => {
        setter((prevFiles: File[]) => prevFiles.filter((_file) => _file.path !== file.path));
    }

    const isFormIncomplete = () => {
        const {purchaseOrder, surveys, drawings, invoices, shipping} = formik.values;
        if(order && order.supply === "Supply and Install") {
            // For "Supply and Install", return true if any one of these is falsy
            return !(purchaseOrder && surveys && drawings && invoices);
        } else {
            // For other order supplies, use the original logic
            return !(purchaseOrder && surveys && drawings && invoices && shipping);
        }
    }

    const handleFilesRemoveAll = (setter: Function) => () => setter([]);

    if (loading) {
        return <CircularProgress/>;
    }

    return (
        <><OrderDetails order={order!}/>
            <form
                onSubmit={formik.handleSubmit}
                {...props}
            >
                <Stack spacing={4}>
                    <Card>
                        <CardContent>
                            <Grid container
                                  spacing={3}>
                                <Grid xs={12}
                                      md={4}>
                                    <Stack spacing={1}>
                                        <Typography variant="h6">Purchase Orders</Typography>
                                        <Typography color="text.secondary"
                                                    variant="body2">Upload any / all purchase
                                            orders.</Typography>
                                    </Stack>
                                </Grid>
                                <Grid xs={12}
                                      md={8}>
                                    <FileList files={[...existingFiles1, ...newlyUploadedFiles1]}
                                              path={`${orderPath}/po/`}/>
                                    <FileDropzone
                                        accept={{
                                            'application/pdf': ['.pdf'],
                                            'image/jpeg': ['.jpg', '.jpeg'],
                                            'image/png': ['.png'],
                                            'application/msword': ['.doc'],
                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                                        }}
                                        onFilesUploaded={(uploadedFiles) => {
                                            setNewlyUploadedFiles1(prevFiles => [...prevFiles, ...uploadedFiles]);
                                        }}
                                        caption="e.g email confirmation"
                                        files={files1}
                                        onDrop={handleFilesDrop(setFiles1)}
                                        onRemove={handleFileRemove(setFiles1)}
                                        onRemoveAll={handleFilesRemoveAll(setFiles1)}
                                        folder={`${orderPath}/po/`}/>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Grid container
                                  spacing={3}>
                                <Grid xs={12}
                                      md={4}>
                                    <Stack spacing={1}>
                                        <Typography variant="h6">Site Drawings</Typography>
                                        <Typography color="text.secondary"
                                                    variant="body2">Customer drawings.
                                            Upload</Typography>
                                    </Stack>
                                </Grid>
                                <Grid xs={12}
                                      md={8}>
                                    <FileList files={[...existingFiles3, ...newlyUploadedFiles3]}
                                              path={`${orderPath}/drawings/`}/>
                                    <FileDropzone
                                        accept={{
                                            'application/pdf': ['.pdf'],
                                            'image/jpeg': ['.jpg', '.jpeg'],
                                            'image/png': ['.png'],
                                            'application/msword': ['.doc'],
                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                                        }}
                                        onFilesUploaded={(uploadedFiles) => {
                                            setNewlyUploadedFiles3(prevFiles => [...prevFiles, ...uploadedFiles]);
                                        }}
                                        caption="e.g drawings"
                                        files={files3}
                                        onDrop={handleFilesDrop(setFiles3)}
                                        onRemove={handleFileRemove(setFiles3)}
                                        onRemoveAll={handleFilesRemoveAll(setFiles3)}
                                        folder={`${orderPath}/drawings/`}/>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Grid container
                                  spacing={3}>
                                <Grid xs={12}
                                      md={4}>
                                    <Stack spacing={1}>
                                        <Typography variant="h6">Quotation Details</Typography>
                                        <Typography color="text.secondary"
                                                    variant="body2">Cost sheet</Typography>
                                    </Stack>
                                </Grid>
                                <Grid xs={12}
                                      md={8}>
                                    <FileList files={[...existingFiles4, ...newlyUploadedFiles4]} path={`${orderPath}/quotation/`}/>
                                    <FileDropzone
                                        accept={{
                                            'application/pdf': ['.pdf'],
                                            'image/jpeg': ['.jpg', '.jpeg'],
                                            'image/png': ['.png'],
                                            'application/msword': ['.doc'],
                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                                        }}
                                        onFilesUploaded={(uploadedFiles) => {
                                            setNewlyUploadedFiles4(prevFiles => [...prevFiles, ...uploadedFiles]);
                                        }}
                                        caption="e.g cost sheet"
                                        files={files4}
                                        onDrop={handleFilesDrop(setFiles4)}
                                        onRemove={handleFileRemove(setFiles4)}
                                        onRemoveAll={handleFilesRemoveAll(setFiles4)}
                                        folder={`${orderPath}/quotation/`}/>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Grid container
                                  spacing={3}>
                                <Grid xs={12}
                                      md={4}>
                                    <Stack spacing={1}>
                                        <Typography variant="h6">Survey</Typography>
                                        <Typography color="text.secondary"
                                                    variant="body2">Upload any / all survey
                                            details.</Typography>
                                    </Stack>
                                </Grid>
                                <Grid xs={12}
                                      md={8}>
                                    <FileList files={[...existingFiles2, ...newlyUploadedFiles2]} path={`${orderPath}/surveyDetails/`}/>
                                    <FileDropzone
                                        accept={{
                                            'application/pdf': ['.pdf'],
                                            'image/jpeg': ['.jpg', '.jpeg'],
                                            'image/png': ['.png'],
                                            'application/msword': ['.doc'],
                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                                        }}
                                        onFilesUploaded={(uploadedFiles) => {
                                            setNewlyUploadedFiles2(prevFiles => [...prevFiles, ...uploadedFiles]);
                                        }}
                                        caption="e.g survey documentation"
                                        files={files2}
                                        onDrop={handleFilesDrop(setFiles2)}
                                        onRemove={handleFileRemove(setFiles2)}
                                        onRemoveAll={handleFilesRemoveAll(setFiles2)}
                                        folder={`${orderPath}/surveyDetails/`}/>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Grid container
                                  spacing={3}>
                                <Grid xs={12}
                                      md={4}>
                                    <Stack spacing={1}>
                                        <Typography variant="h6">Invoices</Typography>
                                        <Typography color="text.secondary"
                                                    variant="body2">Cross reference outstanding
                                            values from xero</Typography>
                                    </Stack>
                                </Grid>
                                <Grid xs={12}
                                      md={8}>
                                    <FileList files={[...existingFiles5, ...newlyUploadedFiles5]} path={`${orderPath}/invoices/`}/>
                                    <FileDropzone
                                        accept={{
                                            'application/pdf': ['.pdf'],
                                            'image/jpeg': ['.jpg', '.jpeg'],
                                            'image/png': ['.png'],
                                            'application/msword': ['.doc'],
                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                                        }}
                                        onFilesUploaded={(uploadedFiles) => {
                                            setNewlyUploadedFiles5(prevFiles => [...prevFiles, ...uploadedFiles]);
                                        }}
                                        caption="e.g xero invoice"
                                        files={files5}
                                        onDrop={handleFilesDrop(setFiles5)}
                                        onRemove={handleFileRemove(setFiles5)}
                                        onRemoveAll={handleFilesRemoveAll(setFiles5)}
                                        folder={`${orderPath}/invoices/`}/>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    {order?.supply !== 'Supply and Install' && (
                    <Card>
                        <CardContent>
                            <Grid container
                                  spacing={3}>
                                <Grid xs={12}
                                      md={4}>
                                    <Stack spacing={1}>
                                        <Typography variant="h6">Shipping Details</Typography>
                                        <Typography color="text.secondary"
                                                    variant="body2">Could include labels /
                                            packing list / spec sheets etc</Typography>
                                    </Stack>
                                </Grid>
                                <Grid xs={12}
                                      md={8}>
                                    <FileList files={[...existingFiles6, ...newlyUploadedFiles6]} path={`${orderPath}/shipping/`}/>
                                    <FileDropzone
                                        accept={{
                                            'application/pdf': ['.pdf'],
                                            'image/jpeg': ['.jpg', '.jpeg'],
                                            'image/png': ['.png'],
                                            'application/msword': ['.doc'],
                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                                        }}
                                        onFilesUploaded={(uploadedFiles) => {
                                            setNewlyUploadedFiles6(prevFiles => [...prevFiles, ...uploadedFiles]);
                                        }}
                                        caption="e.g spec sheet"
                                        files={files6}
                                        onDrop={handleFilesDrop(setFiles6)}
                                        onRemove={handleFileRemove(setFiles6)}
                                        onRemoveAll={handleFilesRemoveAll(setFiles6)}
                                        folder={`${orderPath}/shipping/`}/>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    )}
                    <Card>
                        <CardContent>
                            <Grid xs={12}
                                  md={4}>
                                <Typography variant="h6">
                                    Outstanding items to move to production ready
                                </Typography>
                            </Grid>
                            <Grid xs={12}
                                  sm={12}
                                  md={8}>
                                <Stack divider={<Divider/>}
                                       spacing={3}>
                                    <Stack direction="column"
                                           spacing={3}>
                                        <Stack direction="row"
                                               justifyContent="space-between"
                                               alignItems="center"
                                               spacing={1}>
                                            <Typography color="text.secondary"
                                                        variant="body2">
                                                Has the deposit been received from the customer?
                                            </Typography>
                                            <Switch
                                                checked={formik.values.deposit}
                                                color="primary"
                                                edge="start"
                                                name="deposit"
                                                onChange={formik.handleChange}
                                                value={formik.values.deposit}
                                                disabled={isFormIncomplete()}
                                            />
                                        </Stack>
                                        <Stack direction="row"
                                               justifyContent="space-between"
                                               alignItems="center"
                                               spacing={1}>
                                            <Typography color="text.secondary"
                                                        variant="body2">
                                                Has the order been placed?
                                            </Typography>
                                            <Switch
                                                checked={formik.values.orderPlaced}
                                                color="primary"
                                                edge="start"
                                                name="orderPlaced"
                                                onChange={formik.handleChange}
                                                value={formik.values.orderPlaced}
                                                disabled={isFormIncomplete()}
                                            />
                                        </Stack>
                                        <Stack direction="row"
                                               justifyContent="space-between"
                                               alignItems="center"
                                               spacing={1}>
                                            <Typography color="text.secondary"
                                                        variant="body2">
                                                Has the customer approved the drawing and have we uploaded email proof?
                                            </Typography>
                                            <Switch
                                                checked={formik.values.drawingsApproved}
                                                color="primary"
                                                edge="start"
                                                name="drawingsApproved"
                                                onChange={formik.handleChange}
                                                value={formik.values.drawingsApproved}
                                                disabled={isFormIncomplete()}
                                            />
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                    >
                        <Button
                            type="submit"
                            variant="contained"
                        >
                            Update
                        </Button>
                    </Stack>
                </Stack>
            </form>
        </>
    );
};

const OrderDetails: React.FC<{ order: Order }> = ({order}) => {
    const settings = useSettings();
    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                py: 8
            }}
        >
            <Container maxWidth={settings.stretch ? false : 'xl'}>
                <Stack spacing={4}>
                    <div>
                        <Link
                            color="text.primary"
                            component={RouterLink}
                            href={paths.dashboard.orders.index}
                            sx={{
                                alignItems: 'center',
                                display: 'inline-flex'
                            }}
                            underline="hover"
                        >
                            <SvgIcon sx={{mr: 1}}>
                                <ArrowLeftIcon/>
                            </SvgIcon>
                            <Typography variant="subtitle2">
                                Orders
                            </Typography>
                        </Link>
                    </div>
                    <Box mt={3}/>
                </Stack>
                <Grid
                    container
                    spacing={{
                        xs: 3,
                        lg: 4
                    }}
                >
                    <Grid
                        xs={12}
                        md={3}
                        sm={3}
                    >
                        <Card>
                            <Stack
                                spacing={1}
                                sx={{p: 3}}
                            >
                                <Typography variant="h6">
                                    {'Order date'}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {order?.orderDate}
                                </Typography>
                            </Stack>
                        </Card>
                    </Grid>
                    <Grid
                        xs={12}
                        md={3}
                        sm={3}
                    >
                        <Card>
                            <Stack
                                spacing={1}
                                sx={{p: 3}}
                            >
                                <Typography variant="h6">
                                    {'Customer'}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {order?.customer}
                                </Typography>
                            </Stack>
                        </Card>
                    </Grid>
                    <Grid
                        xs={12}
                        md={3}
                        sm={3}
                    >
                        <Card>
                            <Stack
                                spacing={1}
                                sx={{p: 3}}
                            >
                                <Typography variant="h6">
                                    {'Quotation'}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {order?.quotationNo}
                                </Typography>
                                <Typography variant="h6">
                                    {'Invoice total'}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {order?.sfclTerms}
                                </Typography>
                            </Stack>
                        </Card>
                    </Grid>
                    <Grid
                        xs={12}
                        md={3}
                        sm={3}
                    >
                        <Card>
                            <Stack
                                spacing={1}
                                sx={{p: 3}}
                            >
                                <Typography variant="h6">
                                    {'Supply Type'}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {order?.supply}
                                </Typography>
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}