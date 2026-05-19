import { PDFDocument } from 'pdf-lib';

interface XeroTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getXeroAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token;
  }

  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('XERO_CLIENT_ID and XERO_CLIENT_SECRET must be set');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const resp = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=accounting.transactions.read accounting.contacts.read',
  });

  if (!resp.ok) {
    throw new Error(`Xero auth failed: ${resp.status} ${await resp.text()}`);
  }

  const data = (await resp.json()) as XeroTokenResponse;
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

export async function getInvoiceStatus(invoiceNumber: string): Promise<{
  status: string;
  amountDue: number;
  amountPaid: number;
}> {
  const token = await getXeroAccessToken();
  const tenantId = process.env.XERO_TENANT_ID;
  const resp = await fetch(
    `https://api.xero.com/api.xro/2.0/Invoices?InvoiceNumbers=${encodeURIComponent(invoiceNumber)}`,
    { headers: { Authorization: `Bearer ${token}`, 'xero-tenant-id': tenantId!, Accept: 'application/json' } }
  );

  if (!resp.ok) {
    throw new Error(`Xero invoice fetch failed: ${resp.status}`);
  }

  const data = await resp.json() as { Invoices?: { Status?: string; AmountDue?: number; AmountPaid?: number }[] };
  const invoice = data.Invoices?.[0];
  if (!invoice) throw new Error(`Invoice ${invoiceNumber} not found in Xero`);

  return {
    status: invoice.Status ?? 'UNKNOWN',
    amountDue: invoice.AmountDue ?? 0,
    amountPaid: invoice.AmountPaid ?? 0,
  };
}

export async function getPendingActionItems(): Promise<
  { id: string; type: string; description: string; createdAt: string }[]
> {
  const token = await getXeroAccessToken();
  const tenantId = process.env.XERO_TENANT_ID;
  // Fetch AWAITING_PAYMENT and SUBMITTED invoices as actionable items
  const resp = await fetch(
    'https://api.xero.com/api.xro/2.0/Invoices?Statuses=SUBMITTED,AUTHORISED&page=1',
    { headers: { Authorization: `Bearer ${token}`, 'xero-tenant-id': tenantId!, Accept: 'application/json' } }
  );

  if (!resp.ok) {
    throw new Error(`Xero pending items fetch failed: ${resp.status}`);
  }

  const data = await resp.json() as { Invoices?: { InvoiceID?: string; Type?: string; Reference?: string; DateString?: string }[] };
  return (data.Invoices ?? []).map((inv) => ({
    id: inv.InvoiceID ?? '',
    type: inv.Type ?? 'INVOICE',
    description: inv.Reference ?? inv.InvoiceID ?? '',
    createdAt: inv.DateString ?? '',
  }));
}

export async function parseQuotePdf(pdfBuffer: Buffer): Promise<{
  quoteValue: number;
  metadata: Record<string, string>;
}> {
  // Extract text from PDF using pdf-lib (basic field extraction)
  try {
    const doc = await PDFDocument.load(pdfBuffer);
    const form = doc.getForm();
    const fields = form.getFields();
    const metadata: Record<string, string> = {};
    let quoteValue = 0;

    for (const field of fields) {
      const name = field.getName();
      try {
        const textField = form.getTextField(name);
        const value = textField.getText() ?? '';
        metadata[name] = value;
        if (/total|amount|value|price/i.test(name)) {
          const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed)) quoteValue = parsed;
        }
      } catch {
        // field is not a text field — skip
      }
    }

    return { quoteValue, metadata };
  } catch (err) {
    throw new Error(`Failed to parse quote PDF: ${(err as Error).message}`);
  }
}
