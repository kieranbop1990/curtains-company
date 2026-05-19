import type { FC } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';

interface CustomerBasicDetailsProps {
  customer: string,
  contactNum?: string,
  email: string,
  billingAddress?: string,
  businessName?: string,
}

export const CustomerBasicDetails: FC<CustomerBasicDetailsProps> = (props) => {
  const { customer, contactNum, email, billingAddress, businessName, ...other } = props;

  return (
    <Card {...other}>
      <CardHeader title="Basic Details" />
      <PropertyList>
        <PropertyListItem
            divider
            label="Customer"
            value={customer}
        />
        <PropertyListItem
          divider
          label="Email"
          value={email}
        />
        <PropertyListItem
          divider
          label="Contact Number"
          value={contactNum}
        />
        <PropertyListItem
            divider
            label="Billing Address"
            value={billingAddress}
        />
        <PropertyListItem
            divider
            label="Billing Name"
            value={businessName}
        />
      </PropertyList>
    </Card>
  );
};

CustomerBasicDetails.propTypes = {
  customer: PropTypes.string.isRequired,
  contactNum: PropTypes.string,
  email: PropTypes.string.isRequired,
  billingAddress: PropTypes.string,
  businessName: PropTypes.string
};

// CustomerFinancialDetails.tsx
interface CustomerFinancialDetailsProps {
  accountsContact?: string,
  accountsEmail?: string,
  regNumber?: string,
  vatNumber?: string,
  taxReference?: string,
  vatExempt?: boolean,
  vatReverse?: boolean,
  creditLimit?: number,
  trustedPayer?: boolean,
}

export const CustomerFinancialDetails: FC<CustomerFinancialDetailsProps> = (props) => {
  const { accountsContact, accountsEmail, regNumber, vatNumber, taxReference, vatExempt, vatReverse, creditLimit, trustedPayer, ...other } = props;

  return (
      <Card {...other}>
        <CardHeader title="Financial Details" />
        <PropertyList>
          <PropertyListItem
              divider
              label="Accounts Contact"
              value={accountsContact}
          />
          <PropertyListItem
              divider
              label="Accounts Email"
              value={accountsEmail}
          />
          <PropertyListItem
              divider
              label="Registration Number"
              value={regNumber}
          />
          <PropertyListItem
              divider
              label="VAT Number"
              value={vatNumber}
          />
          <PropertyListItem
              divider
              label="Tax Reference"
              value={taxReference}
          />
          <PropertyListItem
              divider
              label="VAT Exempt"
              value={vatExempt ? 'Yes' : 'No'}
          />
          <PropertyListItem
              divider
              label="VAT Reverse"
              value={vatReverse ? 'Yes' : 'No'}
          />
          <PropertyListItem
              divider
              label="Credit Limit"
              value={creditLimit?.toString()}
          />
          <PropertyListItem
              divider
              label="Trusted Payer"
              value={trustedPayer ? 'Yes' : 'No'}
          />
        </PropertyList>
      </Card>
  );
};

CustomerFinancialDetails.propTypes = {
  accountsContact: PropTypes.string,
  accountsEmail: PropTypes.string,
  regNumber: PropTypes.string,
  vatNumber: PropTypes.string,
  taxReference: PropTypes.string,
  vatExempt: PropTypes.bool,
  vatReverse: PropTypes.bool,
  creditLimit: PropTypes.number,
  trustedPayer: PropTypes.bool,
};

// CustomerCISDetails.tsx
interface CustomerCISDetailsProps {
  cisDeductions?: boolean,
  cisName?: string,
  cisRate?: string,
  cisOrgType?: string,
}

export const CustomerCISDetails: FC<CustomerCISDetailsProps> = (props) => {
  const { cisDeductions, cisName, cisRate, cisOrgType, ...other } = props;

  return (
      <Card {...other}>
        <CardHeader title="CIS Details" />
        <PropertyList>
          <PropertyListItem
              divider
              label="CIS Deductions"
              value={cisDeductions ? 'Yes' : 'No'}
          />
          <PropertyListItem
              divider
              label="CIS Name"
              value={cisName}
          />
          <PropertyListItem
              divider
              label="CIS Rate"
              value={cisRate}
          />
          <PropertyListItem
              divider
              label="CIS Org Type"
              value={cisOrgType}
          />
        </PropertyList>
      </Card>
  );
};

CustomerCISDetails.propTypes = {
  cisDeductions: PropTypes.bool,
  cisName: PropTypes.string,
  cisRate: PropTypes.string,
  cisOrgType: PropTypes.string,
};

