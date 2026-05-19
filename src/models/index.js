// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const Status = {
  "PENDING": "PENDING",
  "PRODUCTION_READY": "PRODUCTION_READY",
  "BOOKING": "BOOKING",
  "INSTALLATION": "INSTALLATION",
  "INVOICE": "INVOICE",
  "PRODUCTION_SPECIFICATION": "PRODUCTION_SPECIFICATION"
};

const { Pending, OrderInf, Orders, Customers } = initSchema(schema);

export {
  Pending,
  OrderInf,
  Orders,
  Customers,
  Status
};