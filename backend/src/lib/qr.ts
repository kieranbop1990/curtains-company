import QRCode from 'qrcode';

export async function generateQrCode(url: string): Promise<Buffer> {
  if (!url.trim()) throw new Error('QR code URL must not be empty');
  const buffer = await QRCode.toBuffer(url, { type: 'png', width: 256, margin: 2 });
  return buffer;
}

export async function generateQrCodeDataUrl(url: string): Promise<string> {
  if (!url.trim()) throw new Error('QR code URL must not be empty');
  return QRCode.toDataURL(url, { width: 256, margin: 2 });
}
