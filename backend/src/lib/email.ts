import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

function getClient() {
  return new SESClient({ region: process.env.AWS_REGION || 'eu-west-2' });
}

function getFrom() {
  return process.env.SES_FROM_EMAIL || 'noreply@firecurtains.com';
}

export type EmailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

export async function sendEmail(
  to: string | string[],
  subject: string,
  htmlBody: string,
  _attachments: EmailAttachment[] = []
): Promise<{ messageId: string }> {
  const recipients = Array.isArray(to) ? to : [to];
  // Attachments are supported via SES SendRawEmail but require MIME building;
  // the engine accepts them now and will wire raw MIME in a later task.
  const cmd = new SendEmailCommand({
    Source: getFrom(),
    Destination: { ToAddresses: recipients },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: { Html: { Data: htmlBody, Charset: 'UTF-8' } },
    },
  });
  const result = await getClient().send(cmd);
  const messageId = result.MessageId ?? '';
  console.log(`[email] sent: "${subject}" → ${recipients.join(', ')} (${messageId})`);
  return { messageId };
}

export async function sendDeliveryConfirmation(toEmail: string, jobRef: string, podBuffer: Buffer) {
  await sendEmail(
    toEmail,
    `Delivery Confirmation — ${jobRef}`,
    `<p>Your order <strong>${jobRef}</strong> has been delivered. Proof of Delivery is attached.</p>`,
    [{ filename: `POD-${jobRef}.pdf`, content: podBuffer, contentType: 'application/pdf' }]
  );
}

export async function sendServiceDueAlert(toEmail: string, assetRef: string, daysUntilService: number) {
  await sendEmail(
    toEmail,
    `Service Due in ${daysUntilService} Days — ${assetRef}`,
    `<p>Asset <strong>${assetRef}</strong> is due for service in <strong>${daysUntilService} days</strong>. Please schedule a service visit.</p>`
  );
}

export async function sendPaymentMilestoneAlert(toEmail: string, jobRef: string, milestone: string, amount: number) {
  await sendEmail(
    toEmail,
    `Payment Milestone Due — ${jobRef}`,
    `<p>Milestone <strong>${milestone}</strong> is due for job <strong>${jobRef}</strong>. Amount: <strong>£${amount.toFixed(2)}</strong>.</p>`
  );
}

export async function sendOverdueInvoiceAlert(toEmail: string, jobRef: string, amount: number) {
  await sendEmail(
    toEmail,
    `Overdue Invoice — ${jobRef}`,
    `<p>Invoice for <strong>${jobRef}</strong> is overdue. Outstanding: <strong>£${amount.toFixed(2)}</strong>. Please action immediately.</p>`
  );
}

export async function sendRenewalReminder(toEmail: string, assetRef: string, renewalDate: string) {
  await sendEmail(
    toEmail,
    `Service Contract Renewal — ${assetRef}`,
    `<p>Service contract for <strong>${assetRef}</strong> renews on <strong>${renewalDate}</strong>. Please arrange renewal.</p>`
  );
}
