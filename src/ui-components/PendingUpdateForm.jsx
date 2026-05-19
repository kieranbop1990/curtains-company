/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, SwitchField } from "@aws-amplify/ui-react";
import { Pending } from "../models";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { DataStore } from "aws-amplify";
export default function PendingUpdateForm(props) {
  const {
    id: idProp,
    pending: pendingModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    purchaseOrder: false,
    survey: false,
    drawingsApproved: false,
    drawings: false,
    completed: false,
    depositPaid: false,
    orderPlaced: false,
    shippingDetails: false,
    invoices: false,
    quotationDetails: false,
  };
  const [purchaseOrder, setPurchaseOrder] = React.useState(
    initialValues.purchaseOrder
  );
  const [survey, setSurvey] = React.useState(initialValues.survey);
  const [drawingsApproved, setDrawingsApproved] = React.useState(
    initialValues.drawingsApproved
  );
  const [drawings, setDrawings] = React.useState(initialValues.drawings);
  const [completed, setCompleted] = React.useState(initialValues.completed);
  const [depositPaid, setDepositPaid] = React.useState(
    initialValues.depositPaid
  );
  const [orderPlaced, setOrderPlaced] = React.useState(
    initialValues.orderPlaced
  );
  const [shippingDetails, setShippingDetails] = React.useState(
    initialValues.shippingDetails
  );
  const [invoices, setInvoices] = React.useState(initialValues.invoices);
  const [quotationDetails, setQuotationDetails] = React.useState(
    initialValues.quotationDetails
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = pendingRecord
      ? { ...initialValues, ...pendingRecord }
      : initialValues;
    setPurchaseOrder(cleanValues.purchaseOrder);
    setSurvey(cleanValues.survey);
    setDrawingsApproved(cleanValues.drawingsApproved);
    setDrawings(cleanValues.drawings);
    setCompleted(cleanValues.completed);
    setDepositPaid(cleanValues.depositPaid);
    setOrderPlaced(cleanValues.orderPlaced);
    setShippingDetails(cleanValues.shippingDetails);
    setInvoices(cleanValues.invoices);
    setQuotationDetails(cleanValues.quotationDetails);
    setErrors({});
  };
  const [pendingRecord, setPendingRecord] = React.useState(pendingModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? await DataStore.query(Pending, idProp)
        : pendingModelProp;
      setPendingRecord(record);
    };
    queryData();
  }, [idProp, pendingModelProp]);
  React.useEffect(resetStateValues, [pendingRecord]);
  const validations = {
    purchaseOrder: [],
    survey: [],
    drawingsApproved: [],
    drawings: [],
    completed: [],
    depositPaid: [],
    orderPlaced: [],
    shippingDetails: [],
    invoices: [],
    quotationDetails: [],
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
          purchaseOrder,
          survey,
          drawingsApproved,
          drawings,
          completed,
          depositPaid,
          orderPlaced,
          shippingDetails,
          invoices,
          quotationDetails,
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
          await DataStore.save(
            Pending.copyOf(pendingRecord, (updated) => {
              Object.assign(updated, modelFields);
            })
          );
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "PendingUpdateForm")}
      {...rest}
    >
      <SwitchField
        label="Purchase order"
        defaultChecked={false}
        isDisabled={false}
        isChecked={purchaseOrder}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              purchaseOrder: value,
              survey,
              drawingsApproved,
              drawings,
              completed,
              depositPaid,
              orderPlaced,
              shippingDetails,
              invoices,
              quotationDetails,
            };
            const result = onChange(modelFields);
            value = result?.purchaseOrder ?? value;
          }
          if (errors.purchaseOrder?.hasError) {
            runValidationTasks("purchaseOrder", value);
          }
          setPurchaseOrder(value);
        }}
        onBlur={() => runValidationTasks("purchaseOrder", purchaseOrder)}
        errorMessage={errors.purchaseOrder?.errorMessage}
        hasError={errors.purchaseOrder?.hasError}
        {...getOverrideProps(overrides, "purchaseOrder")}
      ></SwitchField>
      <SwitchField
        label="Survey"
        defaultChecked={false}
        isDisabled={false}
        isChecked={survey}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              purchaseOrder,
              survey: value,
              drawingsApproved,
              drawings,
              completed,
              depositPaid,
              orderPlaced,
              shippingDetails,
              invoices,
              quotationDetails,
            };
            const result = onChange(modelFields);
            value = result?.survey ?? value;
          }
          if (errors.survey?.hasError) {
            runValidationTasks("survey", value);
          }
          setSurvey(value);
        }}
        onBlur={() => runValidationTasks("survey", survey)}
        errorMessage={errors.survey?.errorMessage}
        hasError={errors.survey?.hasError}
        {...getOverrideProps(overrides, "survey")}
      ></SwitchField>
      <SwitchField
        label="Drawings approved"
        defaultChecked={false}
        isDisabled={false}
        isChecked={drawingsApproved}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              purchaseOrder,
              survey,
              drawingsApproved: value,
              drawings,
              completed,
              depositPaid,
              orderPlaced,
              shippingDetails,
              invoices,
              quotationDetails,
            };
            const result = onChange(modelFields);
            value = result?.drawingsApproved ?? value;
          }
          if (errors.drawingsApproved?.hasError) {
            runValidationTasks("drawingsApproved", value);
          }
          setDrawingsApproved(value);
        }}
        onBlur={() => runValidationTasks("drawingsApproved", drawingsApproved)}
        errorMessage={errors.drawingsApproved?.errorMessage}
        hasError={errors.drawingsApproved?.hasError}
        {...getOverrideProps(overrides, "drawingsApproved")}
      ></SwitchField>
      <SwitchField
        label="Drawings"
        defaultChecked={false}
        isDisabled={false}
        isChecked={drawings}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              purchaseOrder,
              survey,
              drawingsApproved,
              drawings: value,
              completed,
              depositPaid,
              orderPlaced,
              shippingDetails,
              invoices,
              quotationDetails,
            };
            const result = onChange(modelFields);
            value = result?.drawings ?? value;
          }
          if (errors.drawings?.hasError) {
            runValidationTasks("drawings", value);
          }
          setDrawings(value);
        }}
        onBlur={() => runValidationTasks("drawings", drawings)}
        errorMessage={errors.drawings?.errorMessage}
        hasError={errors.drawings?.hasError}
        {...getOverrideProps(overrides, "drawings")}
      ></SwitchField>
      <SwitchField
        label="Completed"
        defaultChecked={false}
        isDisabled={false}
        isChecked={completed}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              purchaseOrder,
              survey,
              drawingsApproved,
              drawings,
              completed: value,
              depositPaid,
              orderPlaced,
              shippingDetails,
              invoices,
              quotationDetails,
            };
            const result = onChange(modelFields);
            value = result?.completed ?? value;
          }
          if (errors.completed?.hasError) {
            runValidationTasks("completed", value);
          }
          setCompleted(value);
        }}
        onBlur={() => runValidationTasks("completed", completed)}
        errorMessage={errors.completed?.errorMessage}
        hasError={errors.completed?.hasError}
        {...getOverrideProps(overrides, "completed")}
      ></SwitchField>
      <SwitchField
        label="Deposit paid"
        defaultChecked={false}
        isDisabled={false}
        isChecked={depositPaid}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              purchaseOrder,
              survey,
              drawingsApproved,
              drawings,
              completed,
              depositPaid: value,
              orderPlaced,
              shippingDetails,
              invoices,
              quotationDetails,
            };
            const result = onChange(modelFields);
            value = result?.depositPaid ?? value;
          }
          if (errors.depositPaid?.hasError) {
            runValidationTasks("depositPaid", value);
          }
          setDepositPaid(value);
        }}
        onBlur={() => runValidationTasks("depositPaid", depositPaid)}
        errorMessage={errors.depositPaid?.errorMessage}
        hasError={errors.depositPaid?.hasError}
        {...getOverrideProps(overrides, "depositPaid")}
      ></SwitchField>
      <SwitchField
        label="Order placed"
        defaultChecked={false}
        isDisabled={false}
        isChecked={orderPlaced}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              purchaseOrder,
              survey,
              drawingsApproved,
              drawings,
              completed,
              depositPaid,
              orderPlaced: value,
              shippingDetails,
              invoices,
              quotationDetails,
            };
            const result = onChange(modelFields);
            value = result?.orderPlaced ?? value;
          }
          if (errors.orderPlaced?.hasError) {
            runValidationTasks("orderPlaced", value);
          }
          setOrderPlaced(value);
        }}
        onBlur={() => runValidationTasks("orderPlaced", orderPlaced)}
        errorMessage={errors.orderPlaced?.errorMessage}
        hasError={errors.orderPlaced?.hasError}
        {...getOverrideProps(overrides, "orderPlaced")}
      ></SwitchField>
      <SwitchField
        label="Shipping details"
        defaultChecked={false}
        isDisabled={false}
        isChecked={shippingDetails}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              purchaseOrder,
              survey,
              drawingsApproved,
              drawings,
              completed,
              depositPaid,
              orderPlaced,
              shippingDetails: value,
              invoices,
              quotationDetails,
            };
            const result = onChange(modelFields);
            value = result?.shippingDetails ?? value;
          }
          if (errors.shippingDetails?.hasError) {
            runValidationTasks("shippingDetails", value);
          }
          setShippingDetails(value);
        }}
        onBlur={() => runValidationTasks("shippingDetails", shippingDetails)}
        errorMessage={errors.shippingDetails?.errorMessage}
        hasError={errors.shippingDetails?.hasError}
        {...getOverrideProps(overrides, "shippingDetails")}
      ></SwitchField>
      <SwitchField
        label="Invoices"
        defaultChecked={false}
        isDisabled={false}
        isChecked={invoices}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              purchaseOrder,
              survey,
              drawingsApproved,
              drawings,
              completed,
              depositPaid,
              orderPlaced,
              shippingDetails,
              invoices: value,
              quotationDetails,
            };
            const result = onChange(modelFields);
            value = result?.invoices ?? value;
          }
          if (errors.invoices?.hasError) {
            runValidationTasks("invoices", value);
          }
          setInvoices(value);
        }}
        onBlur={() => runValidationTasks("invoices", invoices)}
        errorMessage={errors.invoices?.errorMessage}
        hasError={errors.invoices?.hasError}
        {...getOverrideProps(overrides, "invoices")}
      ></SwitchField>
      <SwitchField
        label="Quotation details"
        defaultChecked={false}
        isDisabled={false}
        isChecked={quotationDetails}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              purchaseOrder,
              survey,
              drawingsApproved,
              drawings,
              completed,
              depositPaid,
              orderPlaced,
              shippingDetails,
              invoices,
              quotationDetails: value,
            };
            const result = onChange(modelFields);
            value = result?.quotationDetails ?? value;
          }
          if (errors.quotationDetails?.hasError) {
            runValidationTasks("quotationDetails", value);
          }
          setQuotationDetails(value);
        }}
        onBlur={() => runValidationTasks("quotationDetails", quotationDetails)}
        errorMessage={errors.quotationDetails?.errorMessage}
        hasError={errors.quotationDetails?.hasError}
        {...getOverrideProps(overrides, "quotationDetails")}
      ></SwitchField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || pendingModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || pendingModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
