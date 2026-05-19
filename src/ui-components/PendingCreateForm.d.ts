/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SwitchFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type PendingCreateFormInputValues = {
    purchaseOrder?: boolean;
    survey?: boolean;
    drawingsApproved?: boolean;
    drawings?: boolean;
    completed?: boolean;
    depositPaid?: boolean;
    orderPlaced?: boolean;
    shippingDetails?: boolean;
    invoices?: boolean;
    quotationDetails?: boolean;
};
export declare type PendingCreateFormValidationValues = {
    purchaseOrder?: ValidationFunction<boolean>;
    survey?: ValidationFunction<boolean>;
    drawingsApproved?: ValidationFunction<boolean>;
    drawings?: ValidationFunction<boolean>;
    completed?: ValidationFunction<boolean>;
    depositPaid?: ValidationFunction<boolean>;
    orderPlaced?: ValidationFunction<boolean>;
    shippingDetails?: ValidationFunction<boolean>;
    invoices?: ValidationFunction<boolean>;
    quotationDetails?: ValidationFunction<boolean>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type PendingCreateFormOverridesProps = {
    PendingCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    purchaseOrder?: PrimitiveOverrideProps<SwitchFieldProps>;
    survey?: PrimitiveOverrideProps<SwitchFieldProps>;
    drawingsApproved?: PrimitiveOverrideProps<SwitchFieldProps>;
    drawings?: PrimitiveOverrideProps<SwitchFieldProps>;
    completed?: PrimitiveOverrideProps<SwitchFieldProps>;
    depositPaid?: PrimitiveOverrideProps<SwitchFieldProps>;
    orderPlaced?: PrimitiveOverrideProps<SwitchFieldProps>;
    shippingDetails?: PrimitiveOverrideProps<SwitchFieldProps>;
    invoices?: PrimitiveOverrideProps<SwitchFieldProps>;
    quotationDetails?: PrimitiveOverrideProps<SwitchFieldProps>;
} & EscapeHatchProps;
export declare type PendingCreateFormProps = React.PropsWithChildren<{
    overrides?: PendingCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: PendingCreateFormInputValues) => PendingCreateFormInputValues;
    onSuccess?: (fields: PendingCreateFormInputValues) => void;
    onError?: (fields: PendingCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: PendingCreateFormInputValues) => PendingCreateFormInputValues;
    onValidate?: PendingCreateFormValidationValues;
} & React.CSSProperties>;
export default function PendingCreateForm(props: PendingCreateFormProps): React.ReactElement;
