import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type PdfDocType =
  | 'PRODUCTION_CUTTING_LIST'
  | 'PRODUCTION_SPEC_SHEET'
  | 'QC_FORM'
  | 'PACKING_LIST'
  | 'LABELS'
  | 'BOX_LABELS'
  | 'PROOF_OF_COLLECTION'
  | 'PROOF_OF_DELIVERY'
  | 'ASSET_PROFILE'
  | 'QUICK_QUOTE';

const DOC_TITLES: Record<PdfDocType, string> = {
  PRODUCTION_CUTTING_LIST: 'Fabrication Cutting List',
  PRODUCTION_SPEC_SHEET: 'Production Specification Sheet',
  QC_FORM: 'QC Form',
  PACKING_LIST: 'Packing List',
  LABELS: 'Labels',
  BOX_LABELS: 'Box Labels',
  PROOF_OF_COLLECTION: 'Proof of Collection',
  PROOF_OF_DELIVERY: 'Proof of Delivery',
  ASSET_PROFILE: 'Asset Profile',
  QUICK_QUOTE: 'Quick Quote',
};

export async function generateDocument(
  type: PdfDocType,
  data: Record<string, unknown>
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();

  // Header
  page.drawText('Fire Curtains Ltd', { x: 40, y: height - 50, size: 20, font: boldFont, color: rgb(0.11, 0.31, 0.85) });
  page.drawText(DOC_TITLES[type], { x: 40, y: height - 75, size: 14, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(`Generated: ${new Date().toISOString()}`, { x: 40, y: height - 95, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

  // Divider
  page.drawLine({ start: { x: 40, y: height - 110 }, end: { x: 555, y: height - 110 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

  // Data fields
  let y = height - 135;
  for (const [key, value] of Object.entries(data)) {
    if (y < 60) break;
    page.drawText(`${key}:`, { x: 40, y, size: 9, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(String(value ?? ''), { x: 180, y, size: 9, font, color: rgb(0.1, 0.1, 0.1) });
    y -= 18;
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
