import {useField} from "formik";
import Grid from "@mui/material/Grid";
import {FormControl, FormHelperText} from "@mui/material";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

export interface FormikSwitchProps {
    name: string;
    labelText: string;
}

export const FormikSwitch: React.FC<FormikSwitchProps> = ({ name, labelText }) => {
    const [field, meta] = useField(name);

    return (
        <Grid
            item
            md={6}
            xs={12}
            sx={{
                alignItems: 'center',
                display: 'flex',
            }}
        >
            <FormControl error={meta.touched && Boolean(meta.error)}>
                <Switch
                    checked={field.value}
                    color="primary"
                    edge="start"
                    {...field}
                />
                <Typography variant="subtitle2">
                    {labelText}
                </Typography>
                {meta.touched && meta.error ? (
                    <FormHelperText>{meta.error}</FormHelperText>
                ) : null}
            </FormControl>
        </Grid>
    );
};
