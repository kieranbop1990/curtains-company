/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SwitchFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { Customers } from "../models";
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
export declare type CustomersUpdateFormInputValues = {
    customer?: string;
    businessName?: string;
    email?: string;
    contactNum?: string;
    accountsContact?: string;
    regNumber?: string;
    trustedPayer?: boolean;
    creditLimit?: number;
    billingAddress?: string;
    accountsEmail?: string;
    vatNumber?: string;
    taxReference?: string;
    vatExempt?: boolean;
    vatReverse?: boolean;
    cisDeductions?: boolean;
    cisName?: string;
    cisRate?: string;
    cisOrgType?: string;
};
export declare type CustomersUpdateFormValidationValues = {
    customer?: ValidationFunction<string>;
    businessName?: ValidationFunction<string>;
    email?: ValidationFunction<string>;
    contactNum?: ValidationFunction<string>;
    accountsContact?: ValidationFunction<string>;
    regNumber?: ValidationFunction<string>;
    trustedPayer?: ValidationFunction<boolean>;
    creditLimit?: ValidationFunction<number>;
    billingAddress?: ValidationFunction<string>;
    accountsEmail?: ValidationFunction<string>;
    vatNumber?: ValidationFunction<string>;
    taxReference?: ValidationFunction<string>;
    vatExempt?: ValidationFunction<boolean>;
    vatReverse?: ValidationFunction<boolean>;
    cisDeductions?: ValidationFunction<boolean>;
    cisName?: ValidationFunction<string>;
    cisRate?: ValidationFunction<string>;
    cisOrgType?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type CustomersUpdateFormOverridesProps = {
    CustomersUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    customer?: PrimitiveOverrideProps<TextFieldProps>;
    businessName?: PrimitiveOverrideProps<TextFieldProps>;
    email?: PrimitiveOverrideProps<TextFieldProps>;
    contactNum?: PrimitiveOverrideProps<TextFieldProps>;
    accountsContact?: PrimitiveOverrideProps<TextFieldProps>;
    regNumber?: PrimitiveOverrideProps<TextFieldProps>;
    trustedPayer?: PrimitiveOverrideProps<SwitchFieldProps>;
    creditLimit?: PrimitiveOverrideProps<TextFieldProps>;
    billingAddress?: PrimitiveOverrideProps<TextFieldProps>;
    accountsEmail?: PrimitiveOverrideProps<TextFieldProps>;
    vatNumber?: PrimitiveOverrideProps<TextFieldProps>;
    taxReference?: PrimitiveOverrideProps<TextFieldProps>;
    vatExempt?: PrimitiveOverrideProps<SwitchFieldProps>;
    vatReverse?: PrimitiveOverrideProps<SwitchFieldProps>;
    cisDeductions?: PrimitiveOverrideProps<SwitchFieldProps>;
    cisName?: PrimitiveOverrideProps<TextFieldProps>;
    cisRate?: PrimitiveOverrideProps<TextFieldProps>;
    cisOrgType?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type CustomersUpdateFormProps = React.PropsWithChildren<{
    overrides?: CustomersUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    customers?: Customers;
    onSubmit?: (fields: CustomersUpdateFormInputValues) => CustomersUpdateFormInputValues;
    onSuccess?: (fields: CustomersUpdateFormInputValues) => void;
    onError?: (fields: CustomersUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: CustomersUpdateFormInputValues) => CustomersUpdateFormInputValues;
    onValidate?: CustomersUpdateFormValidationValues;
} & React.CSSProperties>;
export default function CustomersUpdateForm(props: CustomersUpdateFormProps): React.ReactElement;
