import { useField } from "formik";
import Grid from "@mui/material/Grid";
import { TextField, FormHelperText, FormControl } from "@mui/material";

export interface FormikTextFieldProps {
    name: string;
    label: string;
    required?: boolean;
}

export const FormikTextField: React.FC<FormikTextFieldProps> = ({ name, label, required }) => {
    const [field, meta] = useField(name);

    return (
        <Grid
            item
            md={6}
            xs={12}
        >
            <FormControl error={meta.touched && Boolean(meta.error)}>
                <TextField
                    error={meta.touched && Boolean(meta.error)}
                    fullWidth
                    label={label}
                    {...field}
                    required={required}
                />
                {meta.touched && meta.error ? (
                    <FormHelperText>{meta.error}</FormHelperText>
                ) : null}
            </FormControl>
        </Grid>
    );
};
