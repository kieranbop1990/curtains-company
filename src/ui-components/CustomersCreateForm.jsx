/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  SwitchField,
  TextField,
} from "@aws-amplify/ui-react";
import { Customers } from "../models";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { DataStore } from "aws-amplify";
export default function CustomersCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    customer: "",
    businessName: "",
    email: "",
    contactNum: "",
    accountsContact: "",
    regNumber: "",
    trustedPayer: false,
    creditLimit: "",
    billingAddress: "",
    accountsEmail: "",
    vatNumber: "",
    taxReference: "",
    vatExempt: false,
    vatReverse: false,
    cisDeductions: false,
    cisName: "",
    cisRate: "",
    cisOrgType: "",
  };
  const [customer, setCustomer] = React.useState(initialValues.customer);
  const [businessName, setBusinessName] = React.useState(
    initialValues.businessName
  );
  const [email, setEmail] = React.useState(initialValues.email);
  const [contactNum, setContactNum] = React.useState(initialValues.contactNum);
  const [accountsContact, setAccountsContact] = React.useState(
    initialValues.accountsContact
  );
  const [regNumber, setRegNumber] = React.useState(initialValues.regNumber);
  const [trustedPayer, setTrustedPayer] = React.useState(
    initialValues.trustedPayer
  );
  const [creditLimit, setCreditLimit] = React.useState(
    initialValues.creditLimit
  );
  const [billingAddress, setBillingAddress] = React.useState(
    initialValues.billingAddress
  );
  const [accountsEmail, setAccountsEmail] = React.useState(
    initialValues.accountsEmail
  );
  const [vatNumber, setVatNumber] = React.useState(initialValues.vatNumber);
  const [taxReference, setTaxReference] = React.useState(
    initialValues.taxReference
  );
  const [vatExempt, setVatExempt] = React.useState(initialValues.vatExempt);
  const [vatReverse, setVatReverse] = React.useState(initialValues.vatReverse);
  const [cisDeductions, setCisDeductions] = React.useState(
    initialValues.cisDeductions
  );
  const [cisName, setCisName] = React.useState(initialValues.cisName);
  const [cisRate, setCisRate] = React.useState(initialValues.cisRate);
  const [cisOrgType, setCisOrgType] = React.useState(initialValues.cisOrgType);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setCustomer(initialValues.customer);
    setBusinessName(initialValues.businessName);
    setEmail(initialValues.email);
    setContactNum(initialValues.contactNum);
    setAccountsContact(initialValues.accountsContact);
    setRegNumber(initialValues.regNumber);
    setTrustedPayer(initialValues.trustedPayer);
    setCreditLimit(initialValues.creditLimit);
    setBillingAddress(initialValues.billingAddress);
    setAccountsEmail(initialValues.accountsEmail);
    setVatNumber(initialValues.vatNumber);
    setTaxReference(initialValues.taxReference);
    setVatExempt(initialValues.vatExempt);
    setVatReverse(initialValues.vatReverse);
    setCisDeductions(initialValues.cisDeductions);
    setCisName(initialValues.cisName);
    setCisRate(initialValues.cisRate);
    setCisOrgType(initialValues.cisOrgType);
    setErrors({});
  };
  const validations = {
    customer: [{ type: "Required" }],
    businessName: [],
    email: [],
    contactNum: [],
    accountsContact: [],
    regNumber: [],
    trustedPayer: [],
    creditLimit: [],
    billingAddress: [],
    accountsEmail: [],
    vatNumber: [],
    taxReference: [],
    vatExempt: [],
    vatReverse: [],
    cisDeductions: [],
    cisName: [],
    cisRate: [],
    cisOrgType: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          customer,
          businessName,
          email,
          contactNum,
          accountsContact,
          regNumber,
          trustedPayer,
          creditLimit,
          billingAddress,
          accountsEmail,
          vatNumber,
          taxReference,
          vatExempt,
          vatReverse,
          cisDeductions,
          cisName,
          cisRate,
          cisOrgType,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await DataStore.save(new Customers(modelFields));
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "CustomersCreateForm")}
      {...rest}
    >
      <TextField
        label="Customer"
        isRequired={true}
        isReadOnly={false}
        value={customer}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer: value,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.customer ?? value;
          }
          if (errors.customer?.hasError) {
            runValidationTasks("customer", value);
          }
          setCustomer(value);
        }}
        onBlur={() => runValidationTasks("customer", customer)}
        errorMessage={errors.customer?.errorMessage}
        hasError={errors.customer?.hasError}
        {...getOverrideProps(overrides, "customer")}
      ></TextField>
      <TextField
        label="Business name"
        isRequired={false}
        isReadOnly={false}
        value={businessName}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName: value,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.businessName ?? value;
          }
          if (errors.businessName?.hasError) {
            runValidationTasks("businessName", value);
          }
          setBusinessName(value);
        }}
        onBlur={() => runValidationTasks("businessName", businessName)}
        errorMessage={errors.businessName?.errorMessage}
        hasError={errors.businessName?.hasError}
        {...getOverrideProps(overrides, "businessName")}
      ></TextField>
      <TextField
        label="Email"
        isRequired={false}
        isReadOnly={false}
        value={email}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email: value,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.email ?? value;
          }
          if (errors.email?.hasError) {
            runValidationTasks("email", value);
          }
          setEmail(value);
        }}
        onBlur={() => runValidationTasks("email", email)}
        errorMessage={errors.email?.errorMessage}
        hasError={errors.email?.hasError}
        {...getOverrideProps(overrides, "email")}
      ></TextField>
      <TextField
        label="Contact num"
        isRequired={false}
        isReadOnly={false}
        value={contactNum}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum: value,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.contactNum ?? value;
          }
          if (errors.contactNum?.hasError) {
            runValidationTasks("contactNum", value);
          }
          setContactNum(value);
        }}
        onBlur={() => runValidationTasks("contactNum", contactNum)}
        errorMessage={errors.contactNum?.errorMessage}
        hasError={errors.contactNum?.hasError}
        {...getOverrideProps(overrides, "contactNum")}
      ></TextField>
      <TextField
        label="Accounts contact"
        isRequired={false}
        isReadOnly={false}
        value={accountsContact}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact: value,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.accountsContact ?? value;
          }
          if (errors.accountsContact?.hasError) {
            runValidationTasks("accountsContact", value);
          }
          setAccountsContact(value);
        }}
        onBlur={() => runValidationTasks("accountsContact", accountsContact)}
        errorMessage={errors.accountsContact?.errorMessage}
        hasError={errors.accountsContact?.hasError}
        {...getOverrideProps(overrides, "accountsContact")}
      ></TextField>
      <TextField
        label="Reg number"
        isRequired={false}
        isReadOnly={false}
        value={regNumber}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber: value,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.regNumber ?? value;
          }
          if (errors.regNumber?.hasError) {
            runValidationTasks("regNumber", value);
          }
          setRegNumber(value);
        }}
        onBlur={() => runValidationTasks("regNumber", regNumber)}
        errorMessage={errors.regNumber?.errorMessage}
        hasError={errors.regNumber?.hasError}
        {...getOverrideProps(overrides, "regNumber")}
      ></TextField>
      <SwitchField
        label="Trusted payer"
        defaultChecked={false}
        isDisabled={false}
        isChecked={trustedPayer}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer: value,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.trustedPayer ?? value;
          }
          if (errors.trustedPayer?.hasError) {
            runValidationTasks("trustedPayer", value);
          }
          setTrustedPayer(value);
        }}
        onBlur={() => runValidationTasks("trustedPayer", trustedPayer)}
        errorMessage={errors.trustedPayer?.errorMessage}
        hasError={errors.trustedPayer?.hasError}
        {...getOverrideProps(overrides, "trustedPayer")}
      ></SwitchField>
      <TextField
        label="Credit limit"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={creditLimit}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit: value,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.creditLimit ?? value;
          }
          if (errors.creditLimit?.hasError) {
            runValidationTasks("creditLimit", value);
          }
          setCreditLimit(value);
        }}
        onBlur={() => runValidationTasks("creditLimit", creditLimit)}
        errorMessage={errors.creditLimit?.errorMessage}
        hasError={errors.creditLimit?.hasError}
        {...getOverrideProps(overrides, "creditLimit")}
      ></TextField>
      <TextField
        label="Billing address"
        isRequired={false}
        isReadOnly={false}
        value={billingAddress}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress: value,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.billingAddress ?? value;
          }
          if (errors.billingAddress?.hasError) {
            runValidationTasks("billingAddress", value);
          }
          setBillingAddress(value);
        }}
        onBlur={() => runValidationTasks("billingAddress", billingAddress)}
        errorMessage={errors.billingAddress?.errorMessage}
        hasError={errors.billingAddress?.hasError}
        {...getOverrideProps(overrides, "billingAddress")}
      ></TextField>
      <TextField
        label="Accounts email"
        isRequired={false}
        isReadOnly={false}
        value={accountsEmail}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail: value,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.accountsEmail ?? value;
          }
          if (errors.accountsEmail?.hasError) {
            runValidationTasks("accountsEmail", value);
          }
          setAccountsEmail(value);
        }}
        onBlur={() => runValidationTasks("accountsEmail", accountsEmail)}
        errorMessage={errors.accountsEmail?.errorMessage}
        hasError={errors.accountsEmail?.hasError}
        {...getOverrideProps(overrides, "accountsEmail")}
      ></TextField>
      <TextField
        label="Vat number"
        isRequired={false}
        isReadOnly={false}
        value={vatNumber}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber: value,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.vatNumber ?? value;
          }
          if (errors.vatNumber?.hasError) {
            runValidationTasks("vatNumber", value);
          }
          setVatNumber(value);
        }}
        onBlur={() => runValidationTasks("vatNumber", vatNumber)}
        errorMessage={errors.vatNumber?.errorMessage}
        hasError={errors.vatNumber?.hasError}
        {...getOverrideProps(overrides, "vatNumber")}
      ></TextField>
      <TextField
        label="Tax reference"
        isRequired={false}
        isReadOnly={false}
        value={taxReference}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference: value,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.taxReference ?? value;
          }
          if (errors.taxReference?.hasError) {
            runValidationTasks("taxReference", value);
          }
          setTaxReference(value);
        }}
        onBlur={() => runValidationTasks("taxReference", taxReference)}
        errorMessage={errors.taxReference?.errorMessage}
        hasError={errors.taxReference?.hasError}
        {...getOverrideProps(overrides, "taxReference")}
      ></TextField>
      <SwitchField
        label="Vat exempt"
        defaultChecked={false}
        isDisabled={false}
        isChecked={vatExempt}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt: value,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.vatExempt ?? value;
          }
          if (errors.vatExempt?.hasError) {
            runValidationTasks("vatExempt", value);
          }
          setVatExempt(value);
        }}
        onBlur={() => runValidationTasks("vatExempt", vatExempt)}
        errorMessage={errors.vatExempt?.errorMessage}
        hasError={errors.vatExempt?.hasError}
        {...getOverrideProps(overrides, "vatExempt")}
      ></SwitchField>
      <SwitchField
        label="Vat reverse"
        defaultChecked={false}
        isDisabled={false}
        isChecked={vatReverse}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse: value,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.vatReverse ?? value;
          }
          if (errors.vatReverse?.hasError) {
            runValidationTasks("vatReverse", value);
          }
          setVatReverse(value);
        }}
        onBlur={() => runValidationTasks("vatReverse", vatReverse)}
        errorMessage={errors.vatReverse?.errorMessage}
        hasError={errors.vatReverse?.hasError}
        {...getOverrideProps(overrides, "vatReverse")}
      ></SwitchField>
      <SwitchField
        label="Cis deductions"
        defaultChecked={false}
        isDisabled={false}
        isChecked={cisDeductions}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions: value,
              cisName,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.cisDeductions ?? value;
          }
          if (errors.cisDeductions?.hasError) {
            runValidationTasks("cisDeductions", value);
          }
          setCisDeductions(value);
        }}
        onBlur={() => runValidationTasks("cisDeductions", cisDeductions)}
        errorMessage={errors.cisDeductions?.errorMessage}
        hasError={errors.cisDeductions?.hasError}
        {...getOverrideProps(overrides, "cisDeductions")}
      ></SwitchField>
      <TextField
        label="Cis name"
        isRequired={false}
        isReadOnly={false}
        value={cisName}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName: value,
              cisRate,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.cisName ?? value;
          }
          if (errors.cisName?.hasError) {
            runValidationTasks("cisName", value);
          }
          setCisName(value);
        }}
        onBlur={() => runValidationTasks("cisName", cisName)}
        errorMessage={errors.cisName?.errorMessage}
        hasError={errors.cisName?.hasError}
        {...getOverrideProps(overrides, "cisName")}
      ></TextField>
      <TextField
        label="Cis rate"
        isRequired={false}
        isReadOnly={false}
        value={cisRate}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate: value,
              cisOrgType,
            };
            const result = onChange(modelFields);
            value = result?.cisRate ?? value;
          }
          if (errors.cisRate?.hasError) {
            runValidationTasks("cisRate", value);
          }
          setCisRate(value);
        }}
        onBlur={() => runValidationTasks("cisRate", cisRate)}
        errorMessage={errors.cisRate?.errorMessage}
        hasError={errors.cisRate?.hasError}
        {...getOverrideProps(overrides, "cisRate")}
      ></TextField>
      <TextField
        label="Cis org type"
        isRequired={false}
        isReadOnly={false}
        value={cisOrgType}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              customer,
              businessName,
              email,
              contactNum,
              accountsContact,
              regNumber,
              trustedPayer,
              creditLimit,
              billingAddress,
              accountsEmail,
              vatNumber,
              taxReference,
              vatExempt,
              vatReverse,
              cisDeductions,
              cisName,
              cisRate,
              cisOrgType: value,
            };
            const result = onChange(modelFields);
            value = result?.cisOrgType ?? value;
          }
          if (errors.cisOrgType?.hasError) {
            runValidationTasks("cisOrgType", value);
          }
          setCisOrgType(value);
        }}
        onBlur={() => runValidationTasks("cisOrgType", cisOrgType)}
        errorMessage={errors.cisOrgType?.errorMessage}
        hasError={errors.cisOrgType?.hasError}
        {...getOverrideProps(overrides, "cisOrgType")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
